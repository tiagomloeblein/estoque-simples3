import { Product, ProductFormData, StockMovement, Category, PaginatedResponse } from '../types';

const API_URL = '/api';

class ApiService {
  // System Setup
  async getSystemStatus(): Promise<{ installed: boolean }> {
    try {
        const res = await fetch(`${API_URL}/setup/status`);
        if (!res.ok) return { installed: false };
        return res.json();
    } catch (e) {
        return { installed: false };
    }
  }

  async installSystem(): Promise<void> {
    const res = await fetch(`${API_URL}/setup/install`, { method: 'POST' });
    if (!res.ok) throw new Error('Falha na instalação do sistema');
  }

  // Products
  async getProducts(page = 1, limit = 10, search = '', categoryId = '', lowStock = false): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      ...(categoryId && { category_id: categoryId }),
      low_stock: lowStock.toString()
    });
    
    const res = await fetch(`${API_URL}/products?${params}`);
    if (!res.ok) throw new Error('Falha ao buscar produtos');
    return res.json();
  }

  async createProduct(data: ProductFormData): Promise<Product> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category_id', data.category_id);
    formData.append('quantity', data.quantity.toString());
    formData.append('price', data.price.toString());
    formData.append('min_stock', data.min_stock.toString());
    formData.append('description', data.description);
    if (data.image) {
      formData.append('image', data.image);
    }

    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      body: formData, // No Content-Type header needed, browser sets it for FormData
    });
    if (!res.ok) throw new Error('Falha ao criar produto');
    return res.json();
  }

  async updateProduct(id: number, data: ProductFormData): Promise<Product> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category_id', data.category_id);
    formData.append('quantity', data.quantity.toString());
    formData.append('price', data.price.toString());
    formData.append('min_stock', data.min_stock.toString());
    formData.append('description', data.description);
    if (data.image) {
      formData.append('image', data.image);
    }

    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!res.ok) throw new Error('Falha ao atualizar produto');
    return res.json();
  }

  async deleteProduct(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao deletar produto');
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) throw new Error('Falha ao buscar categorias');
    return res.json();
  }

  async createCategory(name: string): Promise<Category> {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Falha ao criar categoria');
    return res.json();
  }

  async deleteCategory(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao remover categoria');
    }
  }

  // Movements
  async registerMovement(productId: number, type: 'IN' | 'OUT', quantity: number, reason: string): Promise<void> {
    const res = await fetch(`${API_URL}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, type, quantity, reason }),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Falha ao registrar movimentação');
    }
  }

  async getReports(): Promise<StockMovement[]> {
    const res = await fetch(`${API_URL}/reports`);
    if (!res.ok) throw new Error('Falha ao buscar relatórios');
    return res.json();
  }
  
  // Helper for isDemo (always false now as we expect backend)
  isDemoMode() {
    return false; 
  }
}

export const api = new ApiService();