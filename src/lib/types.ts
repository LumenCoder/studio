import { Timestamp } from "firebase/firestore";

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
  id: string;
  name: string;
  role: 'Team Training' | 'Manager' | 'Admin Manager';
  lastLogin: Timestamp;
  pin: string;
};