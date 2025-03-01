
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
import { Heart, Landmark } from "lucide-react";
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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
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
    if (paymentMethod === 'card') {
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
    } else {
      // Bank Transfer Logic
      const amount = customAmount ? parseInt(customAmount) : selectedAmount;
      toast({
        title: "Thank you for your donation!",
        description: `Please transfer $${amount} to the following account. You will receive an email confirmation after the transfer is confirmed.`,
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
            <div className="flex justify-evenly mb-4">
              <Button
                type="button"
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
              >
                Card
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('bank')}
              >
                Bank Transfer
              </Button>
            </div>

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

            {paymentMethod === 'card' && (
              <div className="mb-6">
                <FormLabel>Card Details</FormLabel>
                <div className="mt-1 p-3 border rounded-md bg-white shadow-sm">
                  <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="mb-6">
                <p>
                  Please transfer your donation to the following account:
                </p>
                <p>
                  <strong>Bank:</strong> Dummy Bank
                </p>
                <p>
                  <strong>Account Holder:</strong> Dummy Account Holder
                </p>
              </div>
            )}

            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Donate ${customAmount ? customAmount : selectedAmount}
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

// Export the wrapper component with Elements provider
export default function Donate() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold text-center mb-10">Support Our Community</h1>
      <Elements stripe={stripePromise}>
        <DonationForm />
      </Elements>
    </div>
  );
}
