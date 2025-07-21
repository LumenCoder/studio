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
import { getStatus } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

type InventoryTableProps = {
  inventory: InventoryItem[];
};

export function InventoryTable({ inventory }: InventoryTableProps) {
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
          <AnimatePresence>
            {inventory.length > 0 ? (
              inventory.map((item) => {
                const status = getStatus(item.stock, item.threshold);
                return (
                  <motion.tr
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-center">{item.stock}</TableCell>
                    <TableCell className="text-center">{item.threshold}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={status.variant} className="transition-colors duration-300">{status.label}</Badge>
                    </TableCell>
                  </motion.tr>
                );
              })
            ) : (
               <TableRow>
                 <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No items match your search.
                 </TableCell>
               </TableRow>
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
