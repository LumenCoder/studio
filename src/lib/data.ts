export type InventoryItem = {
  id: string;
  name: string;
  category: 'Protein' | 'Dairy' | 'Produce' | 'Sauce' | 'Tortilla' | 'Packaging' | 'Drink';
  stock: number;
  threshold: number;
};

export const inventoryData: InventoryItem[] = [
  { id: '1', name: 'Seasoned Beef', category: 'Protein', stock: 50, threshold: 20 },
  { id: '2', name: 'Shredded Chicken', category: 'Protein', stock: 45, threshold: 20 },
  { id: '3', name: 'Nacho Cheese Sauce', category: 'Sauce', stock: 80, threshold: 30 },
  { id: '4', name: '6" Flour Tortillas', category: 'Tortilla', stock: 200, threshold: 100 },
  { id: '5', name: 'Crunchy Taco Shells', category: 'Tortilla', stock: 150, threshold: 75 },
  { id: '6', name: 'Shredded Lettuce', category: 'Produce', stock: 30, threshold: 15 },
  { id: '7', name: 'Diced Tomatoes', category: 'Produce', stock: 25, threshold: 15 },
  { id: '8', name: 'Cheddar Cheese', category: 'Dairy', stock: 60, threshold: 25 },
  { id: '9', name: 'Sour Cream', category: 'Dairy', stock: 40, threshold: 20 },
  { id: '10', name: 'Taco Wrappers', category: 'Packaging', stock: 500, threshold: 200 },
  { id: '11', name: 'Medium Drink Cups', category: 'Drink', stock: 400, threshold: 150 },
  { id: '12', name: 'Steak', category: 'Protein', stock: 15, threshold: 20 },
  { id: '13', name: 'Black Beans', category: 'Produce', stock: 70, threshold: 25 },
];

export type AuditLog = {
  id: string;
  user: string;
  action: string;
  item: string;
  timestamp: Date;
};

export const auditLogs: AuditLog[] = [
  { id: '1', user: 'admin', action: 'updated_stock', item: 'Seasoned Beef', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: '2', user: 'admin', action: 'added_item', item: 'Black Beans', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
  { id: '3', user: 'jane.doe', action: 'updated_stock', item: 'Crunchy Taco Shells', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { id: '4', user: 'admin', action: 'flagged_low', item: 'Steak', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
];

export const budgetData = {
  budget: 5000,
  spent: 3750,
  period: 'Weekly',
};
