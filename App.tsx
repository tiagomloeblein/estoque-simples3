import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider, useToast } from './components/ToastNotification';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import CategoryList from './components/CategoryList';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import StockMovementModal from './components/StockMovementModal';
import Reports from './components/Reports';
import WelcomeInstaller from './components/WelcomeInstaller';
import { ViewMode, Product, ProductFormData } from './types';
import { api } from './services/api';
import { Plus } from 'lucide-react';

// Main Content Wrapper to access Toast Context
const MainContent = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [productsForDashboard, setProductsForDashboard] = useState<Product[]>([]);
  const [needsInstall, setNeedsInstall] = useState<boolean | null>(null); // null = checking
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete Modal State
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Stock Movement State
  const [stockModalData, setStockModalData] = useState<{product: Product, type: 'IN' | 'OUT'} | null>(null);
  const [stockSubmitting, setStockSubmitting] = useState(false);

  const { addToast } = useToast();

  // Check system status on mount
  useEffect(() => {
    const checkStatus = async () => {
        try {
            const status = await api.getSystemStatus();
            setNeedsInstall(!status.installed);
        } catch (e) {
            console.error("Failed to check status", e);
            // If failed to check, assume installed to show error on dashboard or retry
            setNeedsInstall(false); 
        }
    };
    checkStatus();
  }, []);

  // Load basic product list just for Dashboard stats
  const loadDashboardData = useCallback(async () => {
    try {
      if (needsInstall === false) { // Only load if installed
          const res = await api.getProducts(1, 1000); 
          setProductsForDashboard(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [needsInstall]);

  useEffect(() => {
    if (currentView === ViewMode.DASHBOARD) {
       loadDashboardData();
    }
  }, [loadDashboardData, currentView]);

  const handleCreate = async (data: ProductFormData) => {
    setFormSubmitting(true);
    try {
      await api.createProduct(data);
      addToast('Produto criado com sucesso!', 'success');
      setIsFormOpen(false);
      loadDashboardData(); // Refresh dashboard stats
    } catch (error) {
      addToast('Erro ao criar produto', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdate = async (data: ProductFormData) => {
    if (!editingProduct) return;
    setFormSubmitting(true);
    try {
      await api.updateProduct(editingProduct.id, data);
      addToast('Produto atualizado!', 'success');
      setIsFormOpen(false);
      setEditingProduct(undefined);
      loadDashboardData();
    } catch (error) {
      addToast('Erro ao atualizar produto', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const onRequestDelete = (id: number) => {
    setProductToDelete(id);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteSubmitting(true);
    try {
      await api.deleteProduct(productToDelete);
      addToast('Produto excluído!', 'success');
      setProductToDelete(null);
      loadDashboardData();
    } catch (error) {
      addToast('Erro ao excluir produto', 'error');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleStockMovement = async (quantity: number, reason: string) => {
    if (!stockModalData) return;
    setStockSubmitting(true);
    try {
      await api.registerMovement(stockModalData.product.id, stockModalData.type, quantity, reason);
      addToast('Movimentação registrada!', 'success');
      setStockModalData(null);
      loadDashboardData();
    } catch (error: any) {
      addToast(error.message || 'Erro ao registrar movimentação', 'error');
    } finally {
      setStockSubmitting(false);
    }
  };

  const openNewProductForm = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const openEditProductForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleInstallComplete = () => {
    setNeedsInstall(false);
    loadDashboardData();
    addToast('Sistema iniciado e pronto para uso!', 'success');
  };

  if (needsInstall === null) {
      return <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>;
  }

  return (
    <>
      {needsInstall && <WelcomeInstaller onComplete={handleInstallComplete} />}
      
      <Layout 
        currentView={currentView} 
        onChangeView={setCurrentView}
        isDemo={false}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {currentView === ViewMode.DASHBOARD && 'Visão Geral'}
                {currentView === ViewMode.LIST && 'Gerenciar Produtos'}
                {currentView === ViewMode.CATEGORIES && 'Categorias'}
                {currentView === ViewMode.REPORTS && 'Histórico de Movimentações'}
              </h1>
            </div>
            {currentView === ViewMode.LIST && (
              <button
                onClick={openNewProductForm}
                className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-200 transition-all transform hover:scale-105 active:scale-95 font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Produto
              </button>
            )}
          </div>

          {/* Main Content Areas */}
          {currentView === ViewMode.DASHBOARD && <Dashboard products={productsForDashboard} />}
          
          {currentView === ViewMode.LIST && (
            <ProductList
              onEdit={openEditProductForm}
              onDelete={onRequestDelete}
              onStockIn={(p) => setStockModalData({ product: p, type: 'IN' })}
              onStockOut={(p) => setStockModalData({ product: p, type: 'OUT' })}
            />
          )}

          {currentView === ViewMode.CATEGORIES && <CategoryList />}

          {currentView === ViewMode.REPORTS && <Reports />}
        </div>

        {/* Product Form Modal */}
        {isFormOpen && (
          <ProductForm
            initialData={editingProduct}
            onSubmit={editingProduct ? handleUpdate : handleCreate}
            onCancel={() => setIsFormOpen(false)}
            isLoading={formSubmitting}
          />
        )}

        {/* Delete Confirmation Modal */}
        {productToDelete !== null && (
          <DeleteConfirmationModal
            onConfirm={confirmDelete}
            onCancel={() => setProductToDelete(null)}
            isLoading={deleteSubmitting}
          />
        )}

        {/* Stock Movement Modal */}
        {stockModalData !== null && (
          <StockMovementModal
            product={stockModalData.product}
            type={stockModalData.type}
            onConfirm={handleStockMovement}
            onCancel={() => setStockModalData(null)}
            isLoading={stockSubmitting}
          />
        )}
      </Layout>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <MainContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;