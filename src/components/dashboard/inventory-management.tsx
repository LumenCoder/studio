"use client";

import { useState } from "react";
import { inventoryData as initialInventoryData, type InventoryItem } from "@/lib/data";
import { InventoryTable } from "./inventory-table";
import { AuditLog } from "./audit-log";
import { PredictionTool } from "./prediction-tool";
import { BudgetOverview } from "./budget-overview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { InventoryActions } from "./inventory-actions";

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventoryData);

  const handleAddItem = (newItem: InventoryItem) => {
    setInventory((prevInventory) => [...prevInventory, newItem]);
    // Here you would also update your backend/database
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
                <InventoryActions onAddItem={handleAddItem} />
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
