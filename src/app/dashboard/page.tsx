"use client";

import { useEffect } from 'react';
import { StockOverview } from "@/components/dashboard/stock-overview";
import { useAppContext } from './layout';

export default function DashboardPage() {
  const { setIsNavigating } = useAppContext();

  useEffect(() => {
    setIsNavigating(false);
  }, [setIsNavigating]);
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <StockOverview />
    </div>
  );
}