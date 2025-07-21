import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import type { InventoryItem } from "@/lib/data";

type InventoryTableProps = {
  inventory: InventoryItem[];
};

export function InventoryTable({ inventory }: InventoryTableProps) {
  const getStatus = (stock: number, threshold: number) => {
    const ratio = stock / threshold;
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (ratio < 1) return { label: "Low Stock", variant: "destructive" as const };
    if (ratio < 1.2) return { label: "Needs Restock", variant: "secondary" as const };
    if (ratio > 3) return { label: "Overstock", variant: "outline" as const };
    return { label: "OK", variant: "default" as const };
  };

  return (
    <ScrollArea className="h-[480px]">
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
          {inventory.map((item) => {
            const status = getStatus(item.stock, item.threshold);
            return (
              <TableRow key={item.id} className="transition-all duration-300">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-center">{item.stock}</TableCell>
                <TableCell className="text-center">{item.threshold}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={status.variant} className="transition-colors duration-300">{status.label}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
