import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertContactSchema, insertDonationSchema } from "@shared/schema";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY must be set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

export async function registerRoutes(app: Express) {
  app.get("/api/events", async (_req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.get("/api/events/:id", async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json(event);
  });

  app.post("/api/events", async (req, res) => {
    const result = insertEventSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid event data" });
      return;
    }
    const event = await storage.createEvent(result.data);
    res.status(201).json(event);
  });

  app.post("/api/contact", async (req, res) => {
    const result = insertContactSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid contact data" });
      return;
    }
    const message = await storage.createContactMessage(result.data);
    res.status(201).json(message);
  });

  app.post("/api/donations/create-intent", async (req, res) => {
    const result = insertDonationSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid donation data" });
      return;
    }

    try {
      const { amount, email, name, message } = result.data;

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: "usd",
        payment_method_types: ['card'],
        metadata: {
          name,
          email,
          message: message || "",
        },
      });

      // Create donation record
      await storage.createDonation({
        ...result.data,
        paymentIntentId: paymentIntent.id,
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  // Stripe webhook handler for updating donation status
  app.post("/api/webhooks/stripe", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Update donation status to succeeded
        const donation = await storage.getDonation(Number(paymentIntent.metadata.donationId));
        if (donation) {
          await storage.updateDonationStatus(donation.id, "succeeded");
        }
        break;
      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        // Update donation status to failed
        const failedDonation = await storage.getDonation(Number(failedPaymentIntent.metadata.donationId));
        if (failedDonation) {
          await storage.updateDonationStatus(failedDonation.id, "failed");
        }
        break;
    }

    res.json({ received: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}