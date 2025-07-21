export type InventoryItem = {
  id: string;
  name: string;
  category: 'Protein' | 'Dairy' | 'Produce' | 'Sauce' | 'Tortilla' | 'Packaging' | 'Drink';
  stock: number;
  threshold: number;
};

export const inventoryData: InventoryItem[] = [
  { id: '1', name: 'Angus Beef Patty', category: 'Protein', stock: 80, threshold: 40 },
  { id: '2', name: 'Grilled Chicken Breast', category: 'Protein', stock: 60, threshold: 30 },
  { id: '3', name: 'Cheddar Cheese Slices', category: 'Dairy', stock: 120, threshold: 50 },
  { id: '4', name: 'Brioche Buns', category: 'Tortilla', stock: 150, threshold: 75 },
  { id: '5', name: 'Crispy Onion Rings', category: 'Produce', stock: 40, threshold: 20 },
  { id: '6', name: 'Iceberg Lettuce', category: 'Produce', stock: 30, threshold: 15 },
  { id: '7', name: 'Sliced Tomatoes', category: 'Produce', stock: 25, threshold: 15 },
  { id: '8', name: 'Pickle Chips', category: 'Produce', stock: 50, threshold: 25 },
  { id: '9', 'name': 'Ketchup', 'category': 'Sauce', 'stock': 100, 'threshold': 50 },
  { id: '10', name: 'Burger Wrappers', category: 'Packaging', stock: 500, threshold: 200 },
  { id: '11', name: 'Fountain Drink Syrup', category: 'Drink', stock: 30, threshold: 10 },
  { id: '12', name: 'Bacon Strips', category: 'Protein', stock: 35, threshold: 20 },
  { id: '13', name: 'French Fries', category: 'Produce', stock: 200, threshold: 100 },
];

export type AuditLog = {
  id: string;
  user: string;
  action: string;
  item: string;
  timestamp: Date;
};

export const auditLogs: AuditLog[] = [
  { id: '1', user: 'admin', action: 'updated_stock', item: 'Angus Beef Patty', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: '2', user: 'admin', action: 'added_item', item: 'French Fries', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
  { id: '3', user: 'jane.doe', action: 'updated_stock', item: 'Brioche Buns', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { id: '4', user: 'admin', action: 'flagged_low', item: 'Fountain Drink Syrup', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
];

export const budgetData = {
  budget: 10000,
  spent: 7650,
  period: 'Weekly',
};

export type User = {
  id: string;
  name: string;
  role: 'Team Training' | 'Manager' | 'Admin Manager';
  lastLogin: Date;
};

export const userData: User[] = [
    { id: '25', name: 'Admin User', role: 'Admin Manager', lastLogin: new Date() },
    { id: '1001', name: 'John Smith', role: 'Manager', lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { id: '1002', name: 'Jane Doe', role: 'Team Training', lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
];
