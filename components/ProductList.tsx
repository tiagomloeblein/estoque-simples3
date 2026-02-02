import React, { useState, useEffect } from 'react';
import { Product, Category, PaginatedResponse } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastNotification';
import { Edit2, Trash2, Search, AlertTriangle, Plus, Minus, ImageOff, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductListProps {
  products?: Product[]; // Optional now as we fetch internally for pagination
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onStockIn: (product: Product) => void;
  onStockOut: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ onEdit, onDelete, onStockIn, onStockOut }) => {
  const [productsData, setProductsData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [page, setPage] = useState(1);

  const { addToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts(page, 10, search, selectedCategory, lowStockFilter);
      setProductsData(data);
    } catch (error) {
      addToast('Erro ao carregar produtos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCats = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch (e) {}
    };
    loadCats();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategory, lowStockFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        if (page !== 1) setPage(1);
        else fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
                <option value="">Todas Categorias</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <button
                onClick={() => { setLowStockFilter(!lowStockFilter); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-sm border flex items-center gap-2 transition-colors ${
                    lowStockFilter ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
                <AlertTriangle className="w-4 h-4" />
                Estoque Baixo
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Estoque</th>
                <th className="px-6 py-4 text-right">Preço</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                    <td colSpan={5} className="p-8 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </td>
                </tr>
              ) : !productsData?.data.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                productsData.data.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <ImageOff className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <div className="font-medium text-gray-800">{product.name}</div>
                            {product.description && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{product.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-medium ${product.quantity <= product.min_stock ? 'text-red-600' : 'text-gray-700'}`}>
                        {product.quantity}
                      </div>
                      {product.quantity <= product.min_stock && (
                          <span className="text-[10px] text-red-500">Mín: {product.min_stock}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                         <button
                          onClick={() => onStockIn(product)}
                          className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors mr-1"
                          title="Entrada"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onStockOut(product)}
                          className="p-1.5 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors mr-2"
                          title="Saída"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {productsData && productsData.pagination.pages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
                <span className="text-xs text-gray-500">
                    Página {productsData.pagination.page} de {productsData.pagination.pages} ({productsData.pagination.total} itens)
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(productsData.pagination.pages, p + 1))}
                        disabled={page === productsData.pagination.pages}
                        className="p-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;