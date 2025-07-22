
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";

type BudgetData = {
  budget: number;
  spent: number;
  period: string;
}

export function BudgetOverview() {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "settings", "budget");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setBudgetData(docSnap.data() as BudgetData);
      } else {
        // Set default data if document doesn't exist to prevent crash
        setBudgetData({ budget: 0, spent: 0, period: 'Weekly' });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const cardContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-2 w-full mt-4" />
          <Skeleton className="h-3 w-2/3 mt-2" />
        </div>
      );
    }
  
    const spent = budgetData?.spent ?? 0;
    const budget = budgetData?.budget ?? 0;
    const period = budgetData?.period ?? 'Weekly';
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  
    return (
      <>
        <div className="text-sm text-muted-foreground">
          {period} Spending
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold">
            ${spent.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">
            of ${budget.toLocaleString()}
          </span>
        </div>
        <Progress value={percentage} className="mt-4 h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {percentage > 90
            ? "Warning: Approaching budget limit."
            : "Budget is within normal range."}
        </p>
      </>
    )
  }

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
    >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cardContent()}
          </CardContent>
        </Card>
    </motion.div>
  );
}
