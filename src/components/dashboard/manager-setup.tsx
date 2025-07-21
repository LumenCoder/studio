"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Trash2, Edit, Save, DollarSign, BarChart, FileSpreadsheet, Loader2 } from "lucide-react";
import { userData as initialUsers, type User, inventoryData, budgetData as initialBudgetData } from "@/lib/data";
import { runShipmentCalculation, type ShipmentCalculationOutput } from "@/lib/actions";

const budgetSchema = z.object({
  budget: z.coerce.number().positive("Budget must be positive."),
  overstockThreshold: z.coerce.number().min(1, "Threshold must be at least 1."),
});

const shipmentSchema = z.object({
  prompt: z.string(), // Hidden field for the AI prompt
});

export function ManagerSetup() {
  const { toast } = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [budgetData, setBudgetData] = useState(initialBudgetData);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [shipmentResult, setShipmentResult] = useState<ShipmentCalculationOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const budgetForm = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budget: budgetData.budget,
      overstockThreshold: 3, // Default overstock multiplier
    },
  });

  const shipmentForm = useForm({
    defaultValues: { prompt: '' },
  });


  const handleUpdateBudget = (values: z.infer<typeof budgetSchema>) => {
    setBudgetData((prev) => ({ ...prev, budget: values.budget }));
    // Here you would also update inventory overstock logic if needed
    toast({
      title: "Settings Updated",
      description: "Budget and overstock settings have been saved.",
    });
  };

  const handleCalculateShipment = async () => {
    setIsCalculating(true);
    setShipmentResult(null);
    const inventoryList = inventoryData.map(item => `${item.name}, Stock: ${item.stock}, Threshold: ${item.threshold}`).join('\n');
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

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
        title: "User Deleted",
        description: `User with ID ${userId} has been removed.`,
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
          <CardDescription>Manage budget and inventory thresholds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget Form */}
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
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Shipment Calculator */}
      <Card>
        <CardHeader>
            <CardTitle>Shipment Calculator</CardTitle>
            <CardDescription>Generate a list of items needed for the next shipment.</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* User Management Table */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>User Administration</CardTitle>
            <CardDescription>Delete or update existing users.</CardDescription>
          </CardHeader>
          <CardContent>
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
                                <Button variant="destructive" size="icon" disabled={user.role === 'Admin Manager'}>
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
                                    <AlertDialogAction onClick={() => deleteUser(user.id)}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
