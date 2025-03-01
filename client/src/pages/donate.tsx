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
import { Heart } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Access the environment variable directly
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  console.warn('Stripe publishable key is missing. Card processing will not work.');
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      },
      padding: "10px 12px",
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  }
};

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

function DonationForm() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>("");
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' or 'bank'

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

    if (paymentMethod === "card") {
      if (!stripe || !elements) {
        toast({
          title: "Error",
          description: "Stripe has not been properly initialized",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsProcessing(true);

        // Create payment intent
        const response = await fetch("/api/donations/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, amount }),
        });

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const { clientSecret } = await response.json();

        // Confirm the payment
        const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
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
      } finally {
        setIsProcessing(false);
      }
    } else if (paymentMethod === "bank") {
      // Handle bank transfer/deposit logic here
      toast({
        title: "Bank Transfer Details",
        description: `Please transfer $${amount} to the following account:\n\nAccount Name: Dummy Account\nIBAN: TR550000100100000926262626\nBank: Dummy Bank\n\nOnce transferred, please send confirmation to example@email.com.`,
        duration: null,
      });

      form.reset();
      setCustomAmount("");
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        {/* Amount Selection and Custom Amount sections remain the same */}
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
<h2 className\="text\-xl font\-semibold mb\-4"\>Custom Amount</h2>
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

        {/* Payment Method Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={paymentMethod === "card" ? "default" : "outline"}
              onClick={() => setPaymentMethod("card")}
            >
              Card
            </Button>
            <Button
              type="button"
              variant={paymentMethod === "bank" ? "default" : "outline"}
              onClick={() => setPaymentMethod("bank")}
            >
              Bank Transfer/Deposit
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleDonation)} className="space-y-6">
            {/* Name, Email, Message fields remain the same */}
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

            {paymentMethod === "card" && (
              <div className="mb-6">
                <FormLabel>Card Details</FormLabel>
                <div className="mt-1 p-3 border rounded-md