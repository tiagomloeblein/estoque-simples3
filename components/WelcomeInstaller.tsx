import React, { useState } from 'react';
import { Power, CheckCircle, Server, Database, Play } from 'lucide-react';
import { api } from '../services/api';

interface WelcomeInstallerProps {
  onComplete: () => void;
}

const WelcomeInstaller: React.FC<WelcomeInstallerProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<'idle' | 'installing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const steps = [
    "Verificando integridade do sistema...",
    "Conectando ao banco de dados SQLite...",
    "Criando tabelas de produtos e categorias...",
    "Populando dados iniciais...",
    "Configurando permissões de arquivos...",
    "Iniciando serviços de backend...",
    "Tudo pronto!"
  ];

  const handleStart = async () => {
    setStatus('installing');
    
    // Simulate psychological progress
    const totalDuration = 4000; // 4 seconds total
    const stepDuration = totalDuration / steps.length;
    
    let currentStepIndex = 0;
    
    const interval = setInterval(() => {
        if (currentStepIndex < steps.length) {
            setCurrentStep(steps[currentStepIndex]);
            setProgress(prev => Math.min(prev + (100 / steps.length), 100));
            currentStepIndex++;
        } else {
            clearInterval(interval);
        }
    }, stepDuration);

    // Call actual API in background
    try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Ensure at least 2s of animation
        await api.installSystem();
        
        // Wait for animation to finish if API was too fast
        setTimeout(() => {
            clearInterval(interval);
            setProgress(100);
            setCurrentStep("Sistema Iniciado com Sucesso!");
            setStatus('completed');
            
            // Allow user to appreciate the 100% for a moment before closing
            setTimeout(() => {
                onComplete();
            }, 1000);
        }, Math.max(0, totalDuration - 2000));

    } catch (error) {
        console.error("Install failed", error);
        setCurrentStep("Erro ao instalar. Verifique o console.");
        clearInterval(interval);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-700 relative">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-100 rounded-full opacity-50 blur-xl"></div>

        <div className="p-10 relative z-10 flex flex-col items-center text-center">
          
          <div className="mb-6 relative">
             <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                {status === 'completed' ? (
                    <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />
                ) : (
                    <Power className={`w-12 h-12 ${status === 'installing' ? 'text-blue-500 animate-pulse' : 'text-slate-700'}`} />
                )}
             </div>
             {status === 'installing' && (
                 <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
             )}
          </div>

          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Bem-vindo ao Estoque Simples
          </h1>
          <p className="text-slate-500 mb-8 max-w-sm">
            {status === 'idle' 
                ? "O sistema precisa realizar a configuração inicial do banco de dados para começar." 
                : status === 'installing'
                ? "Por favor, aguarde enquanto preparamos seu ambiente..."
                : "Instalação concluída com sucesso!"}
          </p>

          {status === 'idle' && (
            <button
              onClick={handleStart}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-lg rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 w-full"
            >
              <span className="mr-2 text-xl">INICIAR SISTEMA</span>
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {status !== 'idle' && (
            <div className="w-full space-y-3">
               <div className="flex justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                   <span>Status da Instalação</span>
                   <span>{Math.round(progress)}%</span>
               </div>
               
               <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out flex items-center justify-center"
                    style={{ width: `${progress}%` }}
                  >
                     <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
                  </div>
               </div>

               <div className="h-6 flex items-center justify-center">
                  <span className="text-sm text-slate-500 animate-pulse font-medium">
                      {currentStep}
                  </span>
               </div>
            </div>
          )}

          {/* Info footer */}
          <div className="mt-8 flex items-center gap-4 text-xs text-slate-400">
             <div className="flex items-center gap-1">
                 <Server className="w-3 h-3" />
                 Localhost:3000
             </div>
             <div className="flex items-center gap-1">
                 <Database className="w-3 h-3" />
                 SQLite Persistent
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeInstaller;