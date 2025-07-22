
import { Timestamp } from "firebase/firestore";
import type { ScheduleEntry } from "@/ai/flows/schedule-ocr";

export type InventoryItem = {
  id: string;
  name: string;
  category: 'Protein' | 'Dairy' | 'Produce' | 'Sauce' | 'Tortilla' | 'Packaging' | 'Drink';
  stock: number;
  threshold: number;
  type: 'Permanent' | 'Limited Time';
};

export type AuditLog = {
  id: string;
  user: string;
  action: string;
  item: string;
  timestamp: Timestamp;
};

export type User = {
  docId: string; // Firestore document ID
  id: string; // User's public ID
  name: string;
  role: 'Team Training' | 'Manager' | 'Admin Manager';
  lastLogin: Timestamp;
  pin: string;
};

export type Schedule = {
  id: string;
  entries: ScheduleEntry[];
  uploadedAt: Timestamp;
}
