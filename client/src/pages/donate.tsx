
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Heart, Landmark, Banknote } from "lucide-react";

// Define donation schema without backend dependencies
const donationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  amount: z.string().min(1, "Amount is required"),
  message: z.string().optional(),
});

type DonationFormData = z.infer<typeof donationSchema>;

function DonationForm() {
  const { toast } = useToast();
  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: { name: "", email: "", amount: "", message: "" },
  });

  const [bankDetails] = useState({
    accountName: "Church Name",
    accountNumber: "1234567890",
    bankName: "Bank Name",
    branch: "Branch Name",
  });

  // Add predefined donation amounts
  const predefinedAmounts = [10, 25, 50, 100, 250];
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (data: DonationFormData) => {
    // Just show a toast and set submitted state instead of sending to backend
    toast({
      title: "Thank you for your generosity!",
      description: `Your donation of $${data.amount} will make a great impact.`,
    });
    setSubmitted(true);
    form.reset();
  };

  const handlePredefinedAmount = (amount: number) => {
    form.setValue("amount", amount.toString());
    setCustomAmount("");
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-2xl text-center">
        <div className="py-10">
          <Heart className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You for Your Donation!</h2>
          <p className="text-gray-600 mb-4">
            Your generosity helps us continue our mission and support our community.
          </p>
          <Button
            onClick={() => setSubmitted(false)}
            className="mt-4"
          >
            Make Another Donation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-2xl">
      <h1 className="text-3xl font-bold text-center mb-4 flex items-center justify-center gap-2">
        <Heart className="text-red-500" /> Support Our Mission
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Your generous donations help us spread the gospel and support our community. You can donate via
        bank transfer or deposit using the details below.
      </p>

      <div className="p-4 bg-gray-100 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Landmark className="text-blue-500" /> Bank Transfer Details
        </h2>
        <p><strong>Account Name:</strong> {bankDetails.accountName}</p>
        <p><strong>Account Number:</strong> {bankDetails.accountNumber}</p>
        <p><strong>Bank Name:</strong> {bankDetails.bankName}</p>
        <p><strong>Branch:</strong> {bankDetails.branch}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Choose Amount</h2>
        <div className="grid grid-cols-3 gap-3">
          {predefinedAmounts.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant={form.getValues("amount") === amount.toString() ? "default" : "outline"}
              onClick={() => handlePredefinedAmount(amount)}
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
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              form.setValue("amount", e.target.value);
            }}
            placeholder="Enter custom amount"
            className="flex-1"
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="message" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Leave a Message (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Your message of support" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" className="w-full">
            <Banknote className="mr-2 h-4 w-4" /> Complete Donation
          </Button>
          
          <p className="text-sm text-center text-gray-500 mt-4">
            Please include your name and email in the bank transfer reference if possible.
          </p>
        </form>
      </Form>
    </div>
  );
}

export default function DonatePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold text-center mb-10">Support Our Community</h1>
      <DonationForm />
    </div>
  );
}
