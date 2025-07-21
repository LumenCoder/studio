"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingDown, TrendingUp, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { InventoryItem } from '@/lib/types';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';

export function StockOverview() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const inventoryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setInventory(inventoryData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const totalStock = inventory.reduce((acc, item) => acc + item.stock, 0);
  const lowStockItems = inventory.filter(item => item.stock < item.threshold);
  const overStockItems = inventory.filter(item => item.stock > item.threshold * 3).length;

  const chartData = inventory.map(item => ({
    name: item.name,
    stock: item.stock,
    threshold: item.threshold,
  })).slice(0, 7);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };
  
  const StatCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-4 rounded-sm" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-3 w-2/3 mt-1" />
      </CardContent>
    </Card>
  );

  return (
    <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
    >
        <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Admin</h1>
            <p className="text-muted-foreground">Here's your inventory at a glance.</p>
        </motion.div>

        {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <StatCardSkeleton/>
                <StatCardSkeleton/>
                <StatCardSkeleton/>
            </div>
        ) : (
        <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <motion.div variants={itemVariants}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{totalStock}</div>
                <p className="text-xs text-muted-foreground">units across all items</p>
                </CardContent>
            </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="hover:border-primary/50 transition-colors">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                      <TrendingDown className="h-4 w-4 text-destructive" />
                      </CardHeader>
                      <CardContent>
                      <div className="text-2xl font-bold">{lowStockItems.length}</div>
                      <p className="text-xs text-muted-foreground">items below reorder threshold</p>
                      </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  {lowStockItems.length > 0 ? (
                    <ul className="space-y-1">
                      {lowStockItems.map(item => (
                        <li key={item.id} className="text-sm">
                          <span className="font-semibold">{item.name}</span>: {item.stock}/{item.threshold}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No items are low on stock.</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            </motion.div>
            <motion.div variants={itemVariants}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overstocked Items</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{overStockItems}</div>
                <p className="text-xs text-muted-foreground">items with excess inventory</p>
                </CardContent>
            </Card>
            </motion.div>
        </motion.div>
        )}

        <motion.div variants={itemVariants}>
            <Card>
            <CardHeader>
                <CardTitle>Current Stock Levels</CardTitle>
                <CardDescription>A snapshot of your current inventory items.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-[350px]">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ): (
                <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                        cursor={{ fill: 'hsl(var(--accent))' }}
                        contentStyle={{
                            background: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                        }}
                    />
                    <Bar dataKey="stock" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="threshold" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
                )}
            </CardContent>
            </Card>
        </motion.div>
    </motion.div>
  );
}
