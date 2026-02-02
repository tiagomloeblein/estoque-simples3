import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastNotification';
import { Trash2, Plus, Tag } from 'lucide-react';

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      addToast('Erro ao carregar categorias', 'error');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      await api.createCategory(newCategoryName);
      addToast('Categoria adicionada!', 'success');
      setNewCategoryName('');
      loadCategories();
    } catch (error) {
      addToast('Erro ao criar categoria', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir esta categoria? Produtos vinculados podem ficar sem categoria.')) return;
    try {
      await api.deleteCategory(id);
      addToast('Categoria removida!', 'success');
      loadCategories();
    } catch (error: any) {
      addToast(error.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Tag className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Gerenciar Categorias</h2>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="flex gap-4 mb-8">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nova Categoria..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={loading || !newCategoryName.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center font-medium"
          >
            {loading ? '...' : <Plus className="w-5 h-5 mr-2" />}
            Adicionar
          </button>
        </form>

        {/* List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 group hover:border-purple-200 transition-all">
              <span className="font-medium text-gray-700">{cat.name}</span>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Excluir Categoria"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              Nenhuma categoria cadastrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryList;