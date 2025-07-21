"use client";

import { useState, useEffect } from "react";
import { inventoryData as initialInventoryData, type InventoryItem } from "@/lib/data";
import { InventoryTable } from "./inventory-table";
import { AuditLog } from "./audit-log";
import { PredictionTool } from "./prediction-tool";
import { BudgetOverview } from "./budget-overview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { InventoryActions } from "./inventory-actions";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventoryData);
  const [isUpdateDay, setIsUpdateDay] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date().getDay();
    // Monday is 1, Thursday is 4
    if (today === 1 || today === 4) {
      setIsUpdateDay(true);
    }
  }, []);

  const handleAddItem = (newItem: InventoryItem) => {
    setInventory((prevInventory) => [...prevInventory, newItem]);
    // In a real app, this would also update the backend/database
  };
  
  const handleUpdateInventory = () => {
    // In a real app, this would likely open a modal or navigate to a page
    // to batch-update inventory counts. For this example, we'll just show a toast.
    toast({
      title: "Inventory Update",
      description: "Ready to update inventory counts for today.",
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4 space-y-6">
            <Card className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Inventory</CardTitle>
                  <CardDescription>Real-time stock levels for all items.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleUpdateInventory} 
                    disabled={!isUpdateDay}
                    aria-label="Update Inventory"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Inventory
                  </Button>
                  <InventoryActions onAddItem={handleAddItem} />
                </div>
              </CardHeader>
              <CardContent>
                <InventoryTable inventory={inventory} />
              </CardContent>
            </Card>
        </div>
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <PredictionTool />
          <BudgetOverview />
          <AuditLog />
        </div>
      </div>
  );
}
