import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertContactSchema, insertDonationSchema } from "@shared/schema";

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

  app.post("/api/donations", async (req, res) => {
    const result = insertDonationSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid donation data" });
      return;
    }

    try {
      // Create donation record
      const donation = await storage.createDonation(result.data);

      res.status(201).json(donation);
    } catch (error) {
      console.error("Error creating donation:", error);
      res.status(500).json({ message: "Error creating donation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}