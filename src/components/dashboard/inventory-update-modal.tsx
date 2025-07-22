
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { InventoryItem } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type InventoryUpdateModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  inventory: InventoryItem[];
  onUpdate: (updatedStocks: Record<string, number>) => void;
  isTrainee: boolean;
};

export function InventoryUpdateModal({ isOpen, setIsOpen, inventory, onUpdate, isTrainee }: InventoryUpdateModalProps) {
  const [updatedStocks, setUpdatedStocks] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      const initialStocks = inventory.reduce((acc, item) => {
        acc[item.id] = item.stock;
        return acc;
      }, {} as Record<string, number>);
      setUpdatedStocks(initialStocks);
    }
  }, [isOpen, inventory]);

  const handleStockChange = (id: string, value: string) => {
    const numberValue = parseInt(value, 10);
    if (!isNaN(numberValue) && numberValue >= 0) {
      setUpdatedStocks(prev => ({ ...prev, [id]: numberValue }));
    } else if (value === '') {
        setUpdatedStocks(prev => ({ ...prev, [id]: 0 }));
    }
  };

  const handleSaveChanges = () => {
    onUpdate(updatedStocks);
    setIsOpen(false);
  };

  const sortedInventory = useMemo(() => {
    return [...inventory].sort((a, b) => {
      if (a.type === 'Limited Time' && b.type !== 'Limited Time') return -1;
      if (a.type !== 'Limited Time' && b.type === 'Limited Time') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [inventory]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Update Inventory</DialogTitle>
          <DialogDescription>
            Enter the current stock for each item. Changes will be saved upon confirmation.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 py-4">
            <AnimatePresence>
              {sortedInventory.map(item => {
                const currentStock = updatedStocks[item.id] ?? 0;
                const percentage = item.threshold > 0 ? (currentStock / item.threshold) * 100 : 0;
                const isLimited = item.type === 'Limited Time';

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      'p-4 rounded-lg border bg-card/50 transition-all',
                      isLimited && 'border-primary/50 shadow-md shadow-primary/10'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute inset-0 rounded-lg pointer-events-none',
                         isLimited && 'animate-[pulse_4s_ease-in-out_infinite] border-2 border-primary/80'
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="md:col-span-1">
                        <Label htmlFor={`stock-${item.id}`} className="font-semibold">{item.name}</Label>
                        <p className="text-xs text-muted-foreground">{item.category} - {item.type}</p>
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-4">
                          <Input
                            id={`stock-${item.id}`}
                            type="number"
                            value={updatedStocks[item.id] ?? ''}
                            onChange={(e) => handleStockChange(item.id, e.target.value)}
                            className="w-24"
                            placeholder="Stock"
                            readOnly={isTrainee}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-muted-foreground">Threshold: {item.threshold}</span>
                                <span className="text-xs font-medium text-foreground">{Math.round(percentage)}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} disabled={isTrainee}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
