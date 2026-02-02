import React from 'react';
import { ViewMode } from '../types';
import { LayoutDashboard, List, Box, Menu, X, ArrowRightLeft, Tags } from 'lucide-react';

interface LayoutProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  children: React.ReactNode;
  isDemo: boolean;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children, isDemo }) => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: ViewMode, icon: any, label: string }) => (
    <button
      onClick={() => {
        onChangeView(view);
        setSidebarOpen(false);
      }}
      className={`w-full flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 border-l-4 ${
        currentView === view
          ? 'bg-blue-50 text-blue-700 border-blue-600'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${currentView === view ? 'text-blue-600' : 'text-gray-400'}`} />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Box className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">Estoque Simples</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          <NavItem view={ViewMode.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem view={ViewMode.LIST} icon={List} label="Produtos" />
          <NavItem view={ViewMode.CATEGORIES} icon={Tags} label="Categorias" />
          <NavItem view={ViewMode.REPORTS} icon={ArrowRightLeft} label="Movimentações" />
        </nav>
        
        <div className="absolute bottom-0 w-full p-6 bg-gray-50 border-t border-gray-100">
             <div className="flex items-center gap-3 text-xs text-gray-500">
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 <span>Conectado (Local)</span>
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Mobile Only */}
        <header className="md:hidden flex items-center justify-between bg-white h-16 px-4 shadow-sm z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-gray-800">Estoque Simples</span>
          <div className="w-6"></div> {/* Spacer */}
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;