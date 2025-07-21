import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { inventoryData } from "@/lib/data";
import { InventoryActions } from "./inventory-actions";
import { ScrollArea } from "../ui/scroll-area";

export function InventoryTable() {
  const getStatus = (stock: number, threshold: number) => {
    const ratio = stock / threshold;
    if (ratio < 1) return { label: "Low Stock", variant: "destructive" as const };
    if (ratio < 1.2) return { label: "Needs Restock", variant: "secondary" as const };
    if (ratio > 3) return { label: "Overstock", variant: "outline" as const };
    return { label: "OK", variant: "default" as const };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Real-time stock levels for all items.</CardDescription>
        </div>
        <InventoryActions />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">In Stock</TableHead>
                <TableHead className="text-center">Threshold</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.map((item) => {
                const status = getStatus(item.stock, item.threshold);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-center">{item.stock}</TableCell>
                    <TableCell className="text-center">{item.threshold}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
