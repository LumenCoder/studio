
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "@/lib/types";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  userId: z.string().min(1, {
    message: "User ID is required.",
  }),
  pin: z.string().min(4, {
    message: "PIN must be at least 4 digits.",
  }),
});

export function LoginForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      pin: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      const q = query(collection(db, "users"), where("id", "==", values.userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid User ID or PIN.",
        });
        setIsSubmitting(false);
        return;
      }
      
      let user: User | null = null;
      let docId: string | null = null;

      querySnapshot.forEach((doc) => {
          const data = doc.data();
          if(data.pin === values.pin) {
            user = {
                docId: doc.id,
                id: data.id,
                name: data.name,
                pin: data.pin,
                role: data.role,
                lastLogin: data.lastLogin
            }
            docId = doc.id;
          }
      });


      if (user && docId) {
        // Update lastLogin timestamp
        const userRef = doc(db, "users", docId);
        await updateDoc(userRef, { lastLogin: Timestamp.now() });

        const serializableUser = {
          ...user,
          lastLogin: user.lastLogin instanceof Timestamp 
            ? user.lastLogin.toDate().toISOString() 
            : new Date().toISOString(),
        };
        sessionStorage.setItem('taco-vision-user', JSON.stringify(serializableUser));

        toast({
          title: `Welcome, ${user.name}!`,
          description: "You have successfully signed in.",
        });
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid User ID or PIN.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <Input placeholder="User ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="PIN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
