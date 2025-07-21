import { StockOverview } from "@/components/dashboard/stock-overview";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <StockOverview />
    </div>
  );
}
