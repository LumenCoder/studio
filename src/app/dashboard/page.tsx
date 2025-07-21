import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AuditLog } from "@/components/dashboard/audit-log";
import { BudgetOverview } from "@/components/dashboard/budget-overview";
import { InventoryTable } from "@/components/dashboard/inventory-table";
import { PredictionTool } from "@/components/dashboard/prediction-tool";
import { AlertCircle } from "lucide-react";
import { UserManagement } from "@/components/dashboard/user-management";

function WelcomeHeader() {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight">Welcome back, Admin</h1>
      <p className="text-muted-foreground">Here's what's happening with your inventory today.</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <WelcomeHeader />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <InventoryTable />
        </div>
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <PredictionTool />
          <BudgetOverview />
          <AuditLog />
        </div>
      </div>
      <div className="mt-6">
        <UserManagement />
      </div>
    </div>
  );
}
