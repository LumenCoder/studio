
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, serverTimestamp, query, where, getDocs } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Users, Loader2 } from "lucide-react";
import { useAuth } from "../auth/auth-provider";
import { Skeleton } from "../ui/skeleton";

const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  id: z.string().regex(/^\d{1,4}$/, { message: "User number must be between 1 and 4 digits." }),
  pin: z.string().regex(/^\d{4}$/, { message: "Password must be exactly 4 digits." }),
  role: z.enum(["Team Training", "Manager", "Admin Manager"], {
    required_error: "You need to select a user role.",
  }),
});

type FormattedUser = Omit<User, 'lastLogin'> & {
  lastLogin: string;
};

export function UserManagement() {
  const { toast } = useToast();
  const [formattedUsers, setFormattedUsers] = useState<FormattedUser[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const canCreateAdmins = currentUser?.role === 'Admin Manager';

  useEffect(() => {
    setIsUsersLoading(true);
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as User & { docId: string }));
      const newFormattedUsers = usersData.map(user => ({
        ...user,
        lastLogin: user.lastLogin ? format(user.lastLogin.toDate(), "PPP") : 'N/A',
      }));
      setFormattedUsers(newFormattedUsers.sort((a,b) => parseInt(a.id) - parseInt(b.id)));
      setIsUsersLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      id: "",
      pin: "",
      role: "Team Training",
    },
  });

  async function onSubmit(values: z.infer<typeof userFormSchema>) {
    setIsSubmitting(true);

    const q = query(collection(db, "users"), where("id", "==", values.id));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "User number already exists.",
        });
        setIsSubmitting(false);
        return;
    }

    try {
      await addDoc(collection(db, "users"), {
        id: values.id,
        name: values.name,
        role: values.role,
        pin: values.pin, // In a real app, this should be hashed.
        lastLogin: serverTimestamp(),
      });
      toast({
        title: "User Created",
        description: `${values.name} has been added as a new user.`,
      });
      form.reset();
    } catch (error) {
        console.error("Error creating user: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not create user. Please try again.",
        });
    }
    setIsSubmitting(false);
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  const UserSkeleton = () => (
    <TableRow>
        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    </TableRow>
  );


  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
      className="grid gap-6 lg:grid-cols-5">
      <motion.div variants={cardVariants} className="lg:col-span-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              Create New User
            </CardTitle>
            <CardDescription>
              Fill out the form below to add a new user to the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Number (1-4 digits)</FormLabel>
                      <FormControl>
                        <Input type="text" maxLength={4} placeholder="e.g. 1234" {...field} />
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
                      <FormLabel>Password (4 digits)</FormLabel>
                      <FormControl>
                        <Input type="password" maxLength={4} placeholder="e.g. 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Team Training">Team Training</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          {canCreateAdmins && <SelectItem value="Admin Manager">Admin Manager</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Create User"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={cardVariants} className="lg:col-span-3">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Manage Users
            </CardTitle>
            <CardDescription>
              View existing users. More actions are available in Manager Set-up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <motion.tbody
                variants={tableVariants}
                initial="hidden"
                animate="visible"
                className="[&_tr:last-child]:border-0"
              >
                {isUsersLoading ? (
                    <>
                        <UserSkeleton />
                        <UserSkeleton />
                        <UserSkeleton />
                    </>
                ) :
                (formattedUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    variants={rowVariants}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                  </motion.tr>
                )))}
              </motion.tbody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
