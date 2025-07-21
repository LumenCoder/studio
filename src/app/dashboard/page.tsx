import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuditLog } from "@/components/dashboard/audit-log";
import { BudgetOverview } from "@/components/dashboard/budget-overview";
import { InventoryTable } from "@/components/dashboard/inventory-table";
import { PredictionTool } from "@/components/dashboard/prediction-tool";
import { AlertCircle } from "lucide-react";

function SchedulingAlert() {
  const day = new Date().getDay();
  const isAlertDay = day === 1 || day === 4; // Monday or Thursday

  if (!isAlertDay) {
    return null;
  }

  return (
    <Alert className="mb-6 bg-primary/10 border-primary/20 text-primary-foreground">
      <AlertCircle className="h-4 w-4 !text-primary" />
      <AlertTitle className="font-semibold !text-primary">
        {day === 1 ? "Monday" : "Thursday"} Inventory Alert
      </AlertTitle>
      <AlertDescription className="!text-foreground/80">
        Time for your scheduled inventory check! Review current stock and use the prediction tool to plan your next order.
      </AlertDescription>
    </Alert>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <SchedulingAlert />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4">
          <InventoryTable />
        </div>
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <PredictionTool />
          <BudgetOverview />
          <AuditLog />
        </div>
      </div>
    </div>
  );
}
