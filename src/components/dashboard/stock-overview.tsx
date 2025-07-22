
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingDown, TrendingUp, Info, CalendarCheck, Clock, CalendarX } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { InventoryItem, Schedule } from '@/lib/types';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '../auth/auth-provider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Progress } from '../ui/progress';
import { getStartOfWeek } from '@/lib/utils';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function StockOverview() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [overstockMultiplier, setOverstockMultiplier] = useState(3);
  const { user } = useAuth();

  useEffect(() => {
    let inventoryUnsub: () => void;
    let settingsUnsub: () => void;
    let scheduleUnsub: () => void;
    
    let loadedCount = 0;
    const checkAllLoaded = () => {
        loadedCount++;
        if(loadedCount === 3) {
            setLoading(false);
        }
    }

    inventoryUnsub = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const inventoryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setInventory(inventoryData);
      checkAllLoaded();
    });

    settingsUnsub = onSnapshot(doc(db, "settings", "budget"), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setOverstockMultiplier(data.overstockThreshold || 3);
        }
        checkAllLoaded();
    });

    const today = new Date();
    const startOfWeek = getStartOfWeek(today, 3); // 3 for Wednesday
    const weekId = `week-${startOfWeek.getFullYear()}-${(startOfWeek.getMonth() + 1).toString().padStart(2, '0')}-${startOfWeek.getDate().toString().padStart(2, '0')}`;
    const scheduleDocRef = doc(db, "schedules", weekId);

    scheduleUnsub = onSnapshot(scheduleDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const latestSchedule = docSnap.data() as Schedule;
        latestSchedule.id = docSnap.id;
        setSchedule(latestSchedule);
      } else {
        setSchedule(null);
      }
      checkAllLoaded();
    }, (error) => {
      console.error("Error fetching schedule: ", error);
      checkAllLoaded();
    });

    return () => {
        inventoryUnsub && inventoryUnsub();
        settingsUnsub && settingsUnsub();
        scheduleUnsub && scheduleUnsub();
    };
  }, []);

  const totalStock = inventory.reduce((acc, item) => acc + item.stock, 0);
  const lowStockItems = inventory.filter(item => item.stock < item.threshold);
  const overStockItems = inventory.filter(item => item.threshold > 0 && item.stock > item.threshold * overstockMultiplier).length;

  const todayShift = useMemo(() => {
    if (!schedule || !user) return null;
    const today = DAYS_OF_WEEK[new Date().getDay()];
    return schedule.entries.find(entry => entry.userId === user.id && entry.dayOfWeek === today) || null;
  }, [schedule, user]);

  const inventoryByCategory = useMemo(() => {
    return inventory.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {} as Record<string, InventoryItem[]>);
  }, [inventory]);

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
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name.split(' ')[0]}</h1>
            <p className="text-muted-foreground">Here's your inventory and schedule at a glance.</p>
        </motion.div>

        {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCardSkeleton/>
                <StatCardSkeleton/>
                <StatCardSkeleton/>
                <StatCardSkeleton/>
            </div>
        ) : (
        <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Shift</CardTitle>
                        {todayShift ? <CalendarCheck className="h-4 w-4 text-primary" /> : <CalendarX className="h-4 w-4 text-muted-foreground" />}
                    </CardHeader>
                    <CardContent>
                    {todayShift ? (
                        <>
                            <div className="text-2xl font-bold">{todayShift.timeRange}</div>
                            <p className="text-xs text-muted-foreground">({todayShift.hoursWorked} hours)</p>
                        </>
                    ) : (
                        <>
                             <div className="text-2xl font-bold">Off Today</div>
                             <p className="text-xs text-muted-foreground">No shifts scheduled.</p>
                        </>
                    )}
                    </CardContent>
                </Card>
            </motion.div>
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
                <CardDescription>A snapshot of your current inventory items by category.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-[350px]">
                      <Skeleton className="h-8 w-8 animate-spin" />
                    </div>
                ) : inventory.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                       {Object.entries(inventoryByCategory).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]) => (
                            <AccordionItem value={category} key={category}>
                                <AccordionTrigger>{category}</AccordionTrigger>
                                <AccordionContent>
                                    <ul className='space-y-4 pt-2'>
                                    {items.map(item => {
                                        const percentage = item.threshold > 0 ? (item.stock / item.threshold) * 100 : 0;
                                        return (
                                            <li key={item.id} className="space-y-2">
                                                 <div className="flex justify-between items-center text-sm">
                                                    <span className="font-medium">{item.name}</span>
                                                    <span className="text-muted-foreground">
                                                        {item.stock} / <span className="text-xs"> {item.threshold}</span>
                                                    </span>
                                                 </div>
                                                 <Progress value={percentage} className="h-2"/>
                                            </li>
                                        )
                                    })}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                       ))}
                    </Accordion>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[350px] text-center bg-muted/50 rounded-lg">
                        <Info className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">No Inventory Data</h3>
                        <p className="text-muted-foreground mt-1">Add items in the Inventory tab to see your stock overview here.</p>
                    </div>
                )}
            </CardContent>
            </Card>
        </motion.div>
    </motion.div>
  );
}
