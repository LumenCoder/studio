import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getStatus = (stock: number, threshold: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    const ratio = stock / threshold;
    if (ratio < 1) return { label: "Low Stock", variant: "destructive" as const };
    if (ratio < 1.2) return { label: "Needs Restock", variant: "secondary" as const };
    if (ratio > 3) return { label: "Overstock", variant: "outline" as const };
    return { label: "OK", variant: "default" as const };
};
