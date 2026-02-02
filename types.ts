export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  category: string; // Keep for legacy display
  category_id?: number;
  quantity: number;
  price: number;
  min_stock: number;
  description?: string;
  image?: string;
  updated_at?: string;
}

export interface ProductFormData {
  name: string;
  category_id: string; // Form uses string for select inputs
  quantity: number;
  price: number;
  min_stock: number;
  description: string;
  image?: File | null;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  category?: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
}

export enum ViewMode {
  DASHBOARD = 'dashboard',
  LIST = 'list',
  CATEGORIES = 'categories',
  REPORTS = 'reports'
}