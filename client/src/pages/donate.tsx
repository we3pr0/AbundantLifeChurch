import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDonationSchema, type InsertDonation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Heart, Banknotes } from "lucide-react"; // Import Banknotes icon

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

function DonationForm() {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donationMethod, setDonationMethod] = useState<"bank" | "card">("card"); // Add donation method state

  const form = useForm<InsertDonation>({
    resolver: zodResolver(insertDonationSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      amount: 25,
    },
  });

  const handleDonation = async (data: InsertDonation) => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;

    if (donationMethod === "card") {
      // Existing Stripe card processing logic
      try {
        // ... (Stripe logic from your original code)
        // Ensure to remove the stripe promise from the top of the file, and only load it when needed
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripePromise = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

        if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
          console.warn('Stripe publishable key is missing. Card processing will not work.');
        }

        const stripe = await stripePromise;
        const elements = stripe.elements();

        if (!stripe || !elements) {
          toast({
            title: "Error",
            description: "Stripe has not been properly initialized",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch("/api/donations/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, amount }),
        });

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const { clientSecret } = await response.json();

        const cardElement = elements.create('card');

        const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: data.name,
              email: data.email,
            },
          },
        });

        if (paymentError) {
          throw new Error(paymentError.message);
        }

        toast({
          title: "Thank you for your donation!",
          description: "Your support means a lot to our community.",
        });

        form.reset();
        setCustomAmount("");
      } catch (error) {
        toast({
          title: "Error processing donation",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      }
    } else if (donationMethod === "bank") {
      // Bank transfer/direct deposit logic
      toast({
        title: "Bank Transfer Instructions",
        description: (
          <div>
            <p>Please transfer ${amount} to the following account:</p>
            <p><strong>Account Name:</strong> Dummy Account</p>
            <p><strong>IBAN:</strong> TR55 0000 0000 0000 0000 0000 00</p>
            <p><strong>Account Number:</strong> 123456789</p>
            <p>Please use your name as the reference.</p>
            <p>Thank you for your donation!</p>
          </div>
        ),
      });
      form.reset();
      setCustomAmount("");
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Amount</h2>
          <div className="grid grid-cols-3 gap-3">
            {PRESET_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant={selectedAmount === amount ? "default" : "outline"}
                className="relative"
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                }}
              >
                <span class="math-inline">\{amount\}
</Button\>
\)\)\}
</div\>
</div\>
<div className\="mb\-8"\>
<h2 className\="text\-xl font\-semibold mb\-4"\>Custom Amount</h2\>
<div className\="flex items\-center"\>
<span className\="text\-gray\-500 mr\-2"\></span></span>
            <Input
              type="number"
              min="1"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(0);
              }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Donation Method</h2>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={donationMethod === "card" ? "default" : "outline"}
              onClick={() => setDonationMethod("card")}
            >
              Card
            </Button>
            <Button
              type="button"
              variant={donationMethod === "bank" ? "default" : "outline"}
              onClick={() => setDonationMethod("bank")}
            >
              Bank Transfer
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleDonation)} className="space-y-6">
            {/* Form Fields (Name, Email, Message) */}
            {/* ... (Your existing form fields) */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Leave a message with your donation"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {donationMethod === "card" && (
              <div className="mb-6">
                <FormLabel>Card Details</FormLabel>
                <div className="mt-1 p-3 border rounded-md bg-white shadow-sm">
                  <div id="card-element"/>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">
              {donationMethod === "card" ? (
                <>
                  <Heart className="mr-2 h-4 w-4" /> Donate Now (Card)
                </>
              ) : (
                <>
                  <Banknotes className="mr-