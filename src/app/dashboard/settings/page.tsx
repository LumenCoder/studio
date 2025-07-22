
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const pinSchema = z.object({
  currentPin: z.string().min(4, "PIN must be 4 digits.").max(4, "PIN must be 4 digits."),
  newPin: z.string().min(4, "PIN must be 4 digits.").max(4, "PIN must be 4 digits."),
  confirmPin: z.string().min(4, "PIN must be 4 digits.").max(4, "PIN must be 4 digits."),
}).refine((data) => data.newPin === data.confirmPin, {
  message: "New PINs do not match.",
  path: ["confirmPin"],
});

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      currentPin: "",
      newPin: "",
      confirmPin: "",
    },
  });

  const handleUpdatePin = async (values: z.infer<typeof pinSchema>) => {
    setIsSubmitting(true);
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You are not logged in." });
        setIsSubmitting(false);
        return;
    }
    if (values.currentPin !== user.pin) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Your current PIN is incorrect.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const userRef = doc(db, "users", user.docId);
      await updateDoc(userRef, { pin: values.newPin });
      toast({
        title: "Success",
        description: "Your PIN has been updated.",
      });
      form.reset();
    } catch (error) {
      console.error("PIN Update Error:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update your PIN. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <motion.div 
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1 }}
        className="space-y-6">
        <motion.div variants={cardVariants}>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account and application settings.
          </p>
        </motion.div>
        <Separator />

        <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              This is how others will see you on the site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={user?.name} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" defaultValue={user?.id} readOnly />
            </div>
             <Button disabled>Update Profile (in Manager Setup)</Button>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Change PIN</CardTitle>
            <CardDescription>
              Update your 4-digit PIN used for logging in.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdatePin)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currentPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current PIN</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="****" {...field} maxLength={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="newPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New PIN</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="****" {...field} maxLength={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New PIN</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="****" {...field} maxLength={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Update PIN"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        </motion.div>

      </motion.div>
    </div>
  );
}
