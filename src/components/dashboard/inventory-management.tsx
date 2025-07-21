"use client";

import { useState, useEffect, useMemo } from "react";
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
import { getStatus } from "@/lib/utils";

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventoryData);
  const [isUpdateDay, setIsUpdateDay] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date().getDay();
    // Monday is 1, Thursday is 4
    if (today === 1 || today === 4) {
      setIsUpdateDay(true);
    }
  }, []);

  const handleAddItem = (newItem: InventoryItem) => {
    setInventory((prevInventory) => [newItem, ...prevInventory]);
  };
  
  const handleUpdateInventory = () => {
    toast({
      title: "Inventory Update",
      description: "Ready to update inventory counts for today.",
    });
  };

  const categories = useMemo(() => [...new Set(inventory.map(item => item.category))], [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory
      .filter(item => {
        // Search filter
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

        // Status filter
        const status = getStatus(item.stock, item.threshold).label;
        const matchesStatus = statusFilter === 'All' || status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      });
  }, [inventory, searchQuery, categoryFilter, statusFilter]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-7 space-y-6">
            <Card className="bg-card">
              <CardHeader className="flex flex-col gap-4">
                <div className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>Real-time stock levels for all items.</CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    variant={isUpdateDay ? "default" : "secondary"}
                    onClick={handleUpdateInventory} 
                    aria-label="Update Inventory"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Inventory
                    {isUpdateDay && <span className="ml-2 w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>}
                  </Button>
                </div>
                 <InventoryActions
                  onAddItem={handleAddItem}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  categories={categories}
                />
              </CardHeader>
              <CardContent>
                <InventoryTable inventory={filteredInventory} />
              </CardContent>
            </Card>
        </div>
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <PredictionTool />
        </div>
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <BudgetOverview />
            <AuditLog />
          </div>
        </div>
      </div>
  );
}
