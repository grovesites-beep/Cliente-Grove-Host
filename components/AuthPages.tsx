import React, { useState } from 'react';
import { User, ShieldCheck, ArrowRight, Lock, Mail, Layout, ArrowLeft, Star, Phone } from 'lucide-react';

interface AuthPagesProps {
  onLoginAdmin: () => void;
  onLoginClient: (email: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ onLoginAdmin, onLoginClient }) => {
  // 'client' é agora a visualização padrão pública
  const [view, setView] = useState<'admin' | 'client'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginAdmin();
    }, 1000);
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginClient(email); 
    }, 1000);
  };

  // --- TELA PÚBLICA (Login Cliente + Marketing) ---
  if (view === 'client') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* Lado Esquerdo: Área de Login do Cliente */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-white relative z-10">
          <div className="w-full max-w-md space-y-8 animate-fadeIn">
            <div className="text-center lg:text-left">
               <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 mb-6 mx-auto lg:mx-0">N</div>
               <h1 className="text-3xl font-bold text-slate-900">Bem-vindo de volta</h1>
               <p className="text-slate-500 mt-2">Acesse o painel do seu projeto para ver métricas e gerenciar conteúdo.</p>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="email" 
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    placeholder="voce@suaempresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-slate-400">Demo: alice@bloom.com</p>
                  <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">Esqueceu a senha?</a>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : 'Acessar Área do Cliente'}
              </button>
            </form>

            <div className="pt-8 border-t border-slate-100">
               <button 
                 onClick={() => setView('admin')}
                 className="text-xs text-slate-400 hover:text-slate-600 font-medium flex items-center justify-center gap-1 w-full"
               >
                 <ShieldCheck size={12} /> Acesso da Equipe (Admin)
               </button>
            </div>
          </div>
        </div>

        {/* Lado Direito: Marketing / "Ainda não é cliente?" */}
        <div className="hidden lg:flex w-1/2 bg-slate-900 text-white p-16 flex-col justify-center relative overflow-hidden">
           {/* Imagem de Fundo Decorativa */}
           <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center mix-blend-overlay"></div>
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20"></div>

           <div className="relative z-10 max-w-lg">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-3 py-1 mb-6">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-medium text-indigo-200">Web Design Premium</span>
              </div>
              
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Ainda não tem um site de alta conversão?
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Transformamos sua presença digital com sites institucionais e landing pages otimizadas. Tenha acesso a um painel exclusivo com IA integrada.
              </p>

              <div className="space-y-4">
                 <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                       <Layout size={24} />
                    </div>
                    <div>
                       <h3 className="font-bold">Landing Pages</h3>
                       <p className="text-sm text-slate-400">Focadas em conversão e vendas.</p>
                    </div>
                 </div>
                 
                 <button className="w-full py-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                    <Phone size={20} /> Falar com um Especialista
                 </button>
              </div>
           </div>

           <div className="absolute bottom-8 right-8 text-right">
              <p className="text-sm font-bold">NexusHub Agency</p>
              <p className="text-xs text-slate-500">© 2024</p>
           </div>
        </div>
      </div>
    );
  }

  // --- TELA ADMIN (Escondida/Secundária) ---
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 relative">
       {/* Background Grid sutil para dar ar técnico */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
       
       <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative z-10 animate-fadeIn">
         <button 
            onClick={() => setView('client')}
            className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors"
         >
            <ArrowLeft size={20} />
         </button>

         <div className="text-center mb-8 pt-4">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-slate-200">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Painel do Designer</h2>
            <p className="text-slate-500 mt-2 text-sm">Acesso restrito para administração.</p>
         </div>

         <form onSubmit={handleAdminSubmit} className="space-y-5">
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-1.5">ID do Admin</label>
             <div className="relative">
               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <input 
                 type="email" 
                 required
                 autoFocus
                 className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all"
                 placeholder="admin@nexushub.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
               />
             </div>
           </div>
           
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-1.5">Chave de Acesso</label>
             <div className="relative">
               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <input 
                 type="password" 
                 required
                 className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all"
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
               />
             </div>
           </div>

           <button 
             type="submit"
             disabled={isLoading}
             className="w-full py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-300 transition-all flex items-center justify-center gap-2"
           >
             {isLoading ? (
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
             ) : 'Entrar no Sistema'}
           </button>
         </form>
       </div>
    </div>
  );
};