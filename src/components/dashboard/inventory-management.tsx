
"use client";

import { useState, useMemo, useEffect } from "react";
import type { InventoryItem } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { InventoryTable } from "./inventory-table";
import { AuditLog } from "./audit-log";
import { PredictionTool } from "./prediction-tool";
import { BudgetOverview } from "./budget-overview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { InventoryActions } from "./inventory-actions";
import { Button } from "../ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { getStatus } from "@/lib/utils";
import { InventoryUpdateModal } from "./inventory-update-modal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../auth/auth-provider";
import { motion } from "framer-motion";

const ALL_CATEGORIES = ['Protein', 'Dairy', 'Produce', 'Sauce', 'Tortilla', 'Packaging', 'Drink'];

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdateDay, setIsUpdateDay] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isTrainee = user?.role === 'Team Training';

  useEffect(() => {
    const today = new Date().getDay();
    // Monday is 1, Thursday is 4
    if (today === 1 || today === 4) {
      setIsUpdateDay(true);
    }
    
    const unsubscribe = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const inventoryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setInventory(inventoryData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddItem = async (newItem: Omit<InventoryItem, 'id'>) => {
    if(isTrainee) {
      toast({ variant: "destructive", title: "Permission Denied", description: "You are not authorized to add items."});
      return;
    }
    try {
      await addDoc(collection(db, "inventory"), newItem);
      await addDoc(collection(db, "auditLogs"), {
        user: user?.name || 'System',
        action: "added_item",
        item: newItem.name,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new item.",
      });
    }
  };

  const handleUpdateInventory = async (updatedItems: Record<string, number>) => {
    if(isTrainee) {
      toast({ variant: "destructive", title: "Permission Denied", description: "You are not authorized to update inventory."});
      return;
    }
    const batch = writeBatch(db);
    const updatedItemNames: string[] = [];

    inventory.forEach(item => {
      if (updatedItems[item.id] !== undefined && item.stock !== updatedItems[item.id]) {
        const itemDocRef = doc(db, "inventory", item.id);
        batch.update(itemDocRef, { stock: updatedItems[item.id] });
        updatedItemNames.push(item.name);
      }
    });

    if (updatedItemNames.length > 0) {
       try {
        await batch.commit();
        await addDoc(collection(db, "auditLogs"), {
            user: user?.name || 'System',
            action: "updated_stock",
            item: `${updatedItemNames.length} items`,
            timestamp: serverTimestamp(),
        });
        toast({
            title: "Inventory Updated",
            description: "Stock levels have been successfully updated.",
        });
      } catch (error) {
        console.error("Error updating inventory:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update inventory.",
        });
      }
    }
  };
  
  const filteredInventory = useMemo(() => {
    return inventory
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        const status = getStatus(item.stock, item.threshold).label;
        const matchesStatus = statusFilter === 'All' || status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
      });
  }, [inventory, searchQuery, categoryFilter, statusFilter]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <>
      <InventoryUpdateModal
        isOpen={isUpdateModalOpen}
        setIsOpen={setIsUpdateModalOpen}
        inventory={inventory}
        onUpdate={handleUpdateInventory}
        isTrainee={isTrainee}
      />
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <motion.div variants={itemVariants} className="col-span-1 lg:col-span-7 space-y-6">
              <Card className="bg-card">
                <CardHeader className="flex flex-col gap-4">
                  <div className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle>Inventory</CardTitle>
                      <CardDescription>Real-time stock levels for all items.</CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setIsUpdateModalOpen(true)}
                      aria-label="Update Inventory"
                      disabled={loading || isTrainee}
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
                    categories={ALL_CATEGORIES}
                  />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center h-[480px]">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <InventoryTable inventory={filteredInventory} />
                  )}
                </CardContent>
              </Card>
          </motion.div>
          <motion.div variants={itemVariants} className="col-span-1 lg:col-span-3 space-y-6">
            <PredictionTool />
          </motion.div>
          <motion.div variants={itemVariants} className="col-span-1 lg:col-span-4 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <BudgetOverview />
                <AuditLog />
            </div>
          </motion.div>
      </motion.div>
    </>
  );
}
