
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

/**
 * Calculates the start of the week for a given date.
 * @param date The date to find the start of the week for.
 * @param startOfWeekDay The day the week starts on (0=Sun, 1=Mon, ..., 6=Sat).
 * @returns A new Date object set to the start of the week.
 */
export const getStartOfWeek = (date: Date, startOfWeekDay: number): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < startOfWeekDay ? day + 7 : day) - startOfWeekDay;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0); // Set to the beginning of the day
  return d;
};


/**
 * Parses a time string (e.g., "9:00 AM") and returns a Date object.
 * Returns null if the format is invalid.
 */
export const parseTime = (timeRange: string): Date | null => {
    const startTimeStr = timeRange.split(' - ')[0];
    const match = startTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

    if (!match) {
        return null;
    }

    let [_, hours, minutes, period] = match;
    let hoursNum = parseInt(hours, 10);

    if (period.toUpperCase() === 'PM' && hoursNum !== 12) {
        hoursNum += 12;
    }
    if (period.toUpperCase() === 'AM' && hoursNum === 12) {
        hoursNum = 0; // Midnight case
    }

    const date = new Date();
    date.setHours(hoursNum, parseInt(minutes, 10), 0, 0);
    return date;
}
