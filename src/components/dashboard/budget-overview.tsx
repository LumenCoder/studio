import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { budgetData } from "@/lib/data";
import { DollarSign } from "lucide-react";

export function BudgetOverview() {
  const percentage = (budgetData.spent / budgetData.budget) * 100;

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
          {budgetData.period} Spending
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
