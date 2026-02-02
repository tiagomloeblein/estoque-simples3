import React, { useEffect, useState } from 'react';
import { StockMovement } from '../types';
import { api } from '../services/api';
import { ArrowDown, ArrowUp, Calendar, ArrowRightLeft, Download, FileText, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type FilterType = 'ALL' | 'IN' | 'OUT';

const Reports: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await api.getReports();
        setMovements(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const filteredMovements = movements.filter(m => {
    if (filter === 'ALL') return true;
    return m.type === filter;
  });

  const getFilteredDataForExport = () => {
    return filteredMovements.map(m => ({
      Data: new Date(m.created_at).toLocaleString('pt-BR'),
      Produto: m.product_name || 'Desconhecido',
      Categoria: m.category || '-',
      Tipo: m.type === 'IN' ? 'Entrada' : 'Saída',
      Qtd: m.quantity,
      Motivo: m.reason || '-'
    }));
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToCSV = () => {
    const data = getFilteredDataForExport();
    const headers = ['Data', 'Produto', 'Categoria', 'Tipo', 'Qtd', 'Motivo'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        Object.values(row).map(value => `"${value}"`).join(',')
      )
    ].join('\n');
    
    downloadFile(csvContent, 'relatorio_estoque.csv', 'text/csv;charset=utf-8;');
  };

  const exportToTXT = () => {
    const data = getFilteredDataForExport();
    const txtContent = data.map(row => 
      `Data: ${row.Data} | Produto: ${row.Produto} | Tipo: ${row.Tipo} | Qtd: ${row.Qtd} | Motivo: ${row.Motivo}`
    ).join('\n----------------------------------------\n');

    downloadFile(
      `Relatório de Estoque\nGerado em: ${new Date().toLocaleString()}\n\n${txtContent}`, 
      'relatorio_estoque.txt', 
      'text/plain;charset=utf-8;'
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Movimentações de Estoque', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Filtro: ${filter === 'ALL' ? 'Todos' : filter === 'IN' ? 'Apenas Entradas' : 'Apenas Saídas'}`, 14, 36);

    const data = getFilteredDataForExport();
    const tableData = data.map(row => Object.values(row));
    const headers = [['Data', 'Produto', 'Categoria', 'Tipo', 'Qtd', 'Motivo']];

    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 44,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }, // Blue-500
    });

    doc.save('relatorio_estoque.pdf');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ArrowRightLeft className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Histórico de Movimentações</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            {/* Filter Buttons */}
            <div className="flex bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === 'ALL' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('IN')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                  filter === 'IN' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ArrowUp className="w-3 h-3" /> Entradas
              </button>
              <button
                onClick={() => setFilter('OUT')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                  filter === 'OUT' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ArrowDown className="w-3 h-3" /> Saídas
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2 self-start sm:self-auto">
              <button
                onClick={exportToTXT}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                title="Exportar para TXT"
              >
                <FileText className="w-4 h-4 mr-2" />
                TXT
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                title="Exportar para CSV"
              >
                <Table className="w-4 h-4 mr-2" />
                CSV
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                title="Exportar para PDF"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Quantidade</th>
                <th className="px-6 py-4">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma movimentação encontrada com este filtro.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(movement.created_at).toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{movement.product_name}</div>
                      <div className="text-xs text-gray-500">{movement.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      {movement.type === 'IN' ? (
                        <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <ArrowUp className="w-3 h-3 mr-1" /> Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <ArrowDown className="w-3 h-3 mr-1" /> Saída
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-gray-700">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 italic">
                      {movement.reason || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;