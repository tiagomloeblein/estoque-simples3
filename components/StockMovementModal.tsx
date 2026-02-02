import React, { useState } from 'react';
import { X, ArrowDown, ArrowUp } from 'lucide-react';
import { Product } from '../types';

interface StockMovementModalProps {
  product: Product;
  type: 'IN' | 'OUT';
  onConfirm: (quantity: number, reason: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ product, type, onConfirm, onCancel, isLoading }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > 0) {
      onConfirm(quantity, reason);
    }
  };

  const isOut = type === 'OUT';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className={`p-4 text-white flex justify-between items-center ${isOut ? 'bg-red-600' : 'bg-green-600'}`}>
          <div className="flex items-center gap-2 font-bold text-lg">
            {isOut ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
            {isOut ? 'Saída de Estoque' : 'Entrada de Estoque'}
          </div>
          <button onClick={onCancel} className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Produto</p>
            <p className="font-medium text-gray-800">{product.name}</p>
            <p className="text-xs text-gray-400">Atual: {product.quantity} unidades</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade a {isOut ? 'remover' : 'adicionar'}
            </label>
            <input
              type="number"
              min="1"
              max={isOut ? product.quantity : undefined}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg font-bold text-center"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo (Opcional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isOut ? "Ex: Venda, Avaria..." : "Ex: Compra, Devolução..."}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          <div className="flex gap-3">
             <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || quantity <= 0 || (isOut && quantity > product.quantity)}
              className={`flex-1 py-2.5 rounded-lg text-white font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                isOut ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Confirmar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementModal;