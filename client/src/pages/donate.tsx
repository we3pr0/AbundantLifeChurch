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
      const amount = customAmount ? parseInt(customAmount) : selectedAmount;

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
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Custom Amount</h2>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">$</span>
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
      </div>

      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleDonation)} className="space-y-6">
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

            <div className="mb-6">
              <FormLabel>Card Details</FormLabel>
              <div className="mt-1 p-3 border rounded-md bg-white shadow-sm">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing || !stripe || !elements}
            >
              <Heart className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Donate Now"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default function Donate() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Support Our Ministry</h1>
        <p className="text-lg text-gray-600">
          Your generous donation helps us continue our mission and serve our community.
        </p>
      </div>

      <Elements 
        stripe={stripePromise}
        options={{
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#0066cc',
              fontFamily: 'system-ui, sans-serif',
              spacingUnit: '4px',
              borderRadius: '4px',
            },
            rules: {
              '.Input': {
                border: '1px solid #E2E8F0',
                padding: '8px 12px',
              }
            }
          },
        }}
      >
        <DonationForm />
      </Elements>
    </div>
  );
}