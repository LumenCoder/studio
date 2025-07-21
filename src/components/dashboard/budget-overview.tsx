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

  if (loading || !budgetData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-2 w-full mt-4" />
          <Skeleton className="h-3 w-2/3 mt-2" />
        </CardContent>
      </Card>
    )
  }

  const percentage = budgetData.budget > 0 ? (budgetData.spent / budgetData.budget) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Budget Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {budgetData.period || 'Weekly'} Spending
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold">
            ${budgetData.spent.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">
            of ${budgetData.budget.toLocaleString()}
          </span>
        </div>
        <Progress value={percentage} className="mt-4 h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {percentage > 90
            ? "Warning: Approaching budget limit."
            : "Budget is within normal range."}
        </p>
      </CardContent>
    </Card>
  );
}
