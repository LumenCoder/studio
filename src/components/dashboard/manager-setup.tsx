"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Edit, Save, DollarSign, BarChart, FileSpreadsheet, Loader2, Info } from "lucide-react";
import type { User, InventoryItem } from "@/lib/types";
import { runShipmentCalculation, type ShipmentCalculationOutput } from "@/lib/actions";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, deleteDoc, setDoc, query, where, getDocs } from "firebase/firestore";

const budgetSchema = z.object({
  budget: z.coerce.number().positive("Budget must be positive."),
  overstockThreshold: z.coerce.number().min(1, "Threshold must be at least 1."),
});

export function ManagerSetup() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [budgetData, setBudgetData] = useState({ budget: 0, overstockThreshold: 3 });
  const [shipmentResult, setShipmentResult] = useState<ShipmentCalculationOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const budgetForm = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    values: budgetData,
  });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User)));
      setIsLoading(false);
    });

    const unsubBudget = onSnapshot(doc(db, "settings", "budget"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newBudgetData = {
          budget: data.budget || 0,
          overstockThreshold: data.overstockThreshold || 3,
        };
        setBudgetData(newBudgetData);
        budgetForm.reset(newBudgetData);
      }
      setIsLoading(false);
    });

    const unsubInventory = onSnapshot(collection(db, "inventory"), (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
    });

    return () => {
      unsubUsers();
      unsubBudget();
      unsubInventory();
    };
  }, [budgetForm]);

  const handleUpdateBudget = async (values: z.infer<typeof budgetSchema>) => {
    try {
      await setDoc(doc(db, "settings", "budget"), values, { merge: true });
      toast({
        title: "Settings Updated",
        description: "Budget and overstock settings have been saved.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save settings. Check Firestore rules.",
      });
    }
  };

  const handleCalculateShipment = async () => {
    setIsCalculating(true);
    setShipmentResult(null);
    const inventoryList = inventory.map(item => `${item.name}, Stock: ${item.stock}, Threshold: ${item.threshold}`).join('\n');
    const result = await runShipmentCalculation({ inventoryList });

    if ('error' in result) {
      toast({
        variant: "destructive",
        title: "Calculation Failed",
        description: result.error,
      });
    } else {
      setShipmentResult(result);
    }
    setIsCalculating(false);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const q = query(collection(db, "users"), where("id", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
         toast({
          variant: "destructive",
          title: "Delete Failed",
          description: "User not found.",
        });
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, "users", userDoc.id));

      toast({
          title: "User Deleted",
          description: `User with ID ${userId} has been removed.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete user.",
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
          <CardDescription>Manage budget and inventory thresholds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...budgetForm}>
            <form onSubmit={budgetForm.handleSubmit(handleUpdateBudget)} className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Budget Control</h3>
              </div>
              <FormField
                control={budgetForm.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekly Budget ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-2 pt-4">
                <BarChart className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Inventory Thresholds</h3>
              </div>
               <FormField
                control={budgetForm.control}
                name="overstockThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overstock Multiplier</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground pt-1">An item is "Overstock" if its stock is this many times its threshold (e.g., 3 means 3x).</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={budgetForm.formState.isSubmitting}>
                {budgetForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Shipment Calculator</CardTitle>
            <CardDescription>Generate a list of items needed for the next shipment.</CardDescription>
        </CardHeader>
        <CardContent>
            {inventory.length > 0 ? (
              <>
                <Button onClick={handleCalculateShipment} disabled={isCalculating} className="w-full">
                    {isCalculating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                    )}
                    Calculate New Shipment
                </Button>
                {shipmentResult && (
                    <div className="mt-4 space-y-2 text-sm font-mono p-4 bg-muted rounded-md max-h-96 overflow-y-auto">
                        <h4 className="font-sans font-bold text-base">Shipment Needs:</h4>
                        <pre className="whitespace-pre-wrap">{shipmentResult.shipmentList}</pre>
                    </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <Info className="w-10 h-10 mb-2" />
                <p>You need to add inventory items before you can calculate a shipment.</p>
              </div>
            )}
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>User Administration</CardTitle>
            <CardDescription>Delete or update existing users.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> :
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" disabled>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit User (Coming Soon)</span>
                          </Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon" disabled={user.role === 'Admin Manager' || user.id === '25'}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the user account for {user.name}.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                          Delete
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
             }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
