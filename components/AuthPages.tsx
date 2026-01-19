import React, { useState } from 'react';
import { User, ShieldCheck, ArrowRight, Lock, Mail, Layout, ArrowLeft, Star, Phone, Zap, Clock } from 'lucide-react';

interface AuthPagesProps {
  onLoginAdmin: () => void;
  onLoginClient: (email: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ onLoginAdmin, onLoginClient }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      // Simulação de autenticação inteligente de Papel (Role)
      if (email === 'admin@nexushub.com') {
        if (password === 'admin123') {
          onLoginAdmin();
        } else {
          setError('Senha inválida para administrador.');
          setIsLoading(false);
        }
      } else {
        // Autenticação de Ciente (Simulada)
        onLoginClient(email);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 font-sans relative overflow-x-hidden">
      {/* Background Gradients/Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex flex-col min-h-screen">
        {/* Navbar Simples */}
        <header className="flex justify-between items-center mb-12 lg:mb-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">N</div>
            <span className="font-bold text-xl tracking-tight">NexusHub</span>
          </div>
          <div className="hidden sm:flex px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 text-xs font-medium text-slate-400">
            <span className="w-2 h-2 bg-indigo-500 rounded-full inline-block mr-2 animate-pulse"></span>
            Portal do Cliente ID v2.0
          </div>
        </header>

        {/* Hero Section (Split Layout) */}
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-32">

          {/* Esquerda: Copywriting */}
          <div className="w-full lg:w-1/2 space-y-8 lg:space-y-10 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold uppercase tracking-wider mb-2">
              <Star size={14} fill="currentColor" /> Área Exclusiva
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white">
              Controle total da <br />
              sua presença <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Digital.</span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
              Acompanhe a performance do seu site, gerencie seu blog com Inteligência Artificial e solicite atualizações em um único lugar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 text-sm lg:text-base font-medium text-slate-300 max-w-xl mx-auto lg:mx-0 pt-4">
              <div className="flex items-center justify-center lg:justify-start gap-3"><div className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-400"><ShieldCheck size={18} /></div> Métricas em Tempo Real</div>
              <div className="flex items-center justify-center lg:justify-start gap-3"><div className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-400"><ShieldCheck size={18} /></div> Gestão de Blog (IA)</div>
              <div className="flex items-center justify-center lg:justify-start gap-3"><div className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-400"><ShieldCheck size={18} /></div> Depoimentos & Leads</div>
              <div className="flex items-center justify-center lg:justify-start gap-3"><div className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-400"><ShieldCheck size={18} /></div> Suporte Prioritário</div>
            </div>
          </div>

          {/* Direita: Login Card */}
          <div className="w-full lg:w-[500px] order-1 lg:order-2">
            <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"></div>

              <div className="mb-8 lg:mb-10 text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">Bem-vindo(a)</h2>
                <p className="text-slate-400 text-sm lg:text-base">Digite seu email profissional para acessar o painel.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center animate-shake">
                    {error}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                  <div className="relative mt-1 group-focus-within:text-indigo-400 text-slate-500 transition-colors">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                    <input
                      type="email"
                      required
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="seu@site.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha</label>
                  <div className="relative mt-1 text-slate-500 transition-colors">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                    <input
                      type="password"
                      required
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 mt-4 rounded-xl font-bold text-white text-lg bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/40 transition-all flex items-center justify-center gap-3 group-hover:scale-[1.01]"
                >
                  {isLoading ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Entrar na Plataforma'}
                  {!isLoading && <ArrowRight size={20} />}
                </button>
              </form>

              <div className="mt-8 text-center hidden lg:block">
                <p className="text-xs text-slate-500">Esqueceu sua senha? <a href="#" className="text-indigo-400 hover:text-indigo-300">Recuperar acesso</a></p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 flex justify-center items-center text-xs text-slate-600">
                <span className="flex items-center gap-1"><Lock size={10} /> Ambiente Seguro por NexusHub</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Features - Ocultado em mobile para economizar espaço ou simplificado */}
        <footer className="mt-16 lg:mt-0 pt-16 border-t border-slate-800/50 pb-8 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-indigo-400 mb-4 mx-auto md:mx-0"><Zap size={24} /></div>
            <h3 className="text-lg font-bold text-white">SEO & Performance</h3>
            <p className="text-base text-slate-400">Monitoramos a velocidade e o ranking do seu site constantemente.</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 mb-4 mx-auto md:mx-0"><Clock size={24} /></div>
            <h3 className="text-lg font-bold text-white">Conteúdo Inteligente</h3>
            <p className="text-base text-slate-400">Crie artigos para o blog do seu site usando nossa IA integrada.</p>
          </div>
          <div className="hidden md:block space-y-3">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-green-400 mb-4 mx-auto md:mx-0"><ShieldCheck size={24} /></div>
            <h3 className="text-lg font-bold text-white">Segurança Total</h3>
            <p className="text-base text-slate-400">Seu site protegido contra ataques. Backups diários e SSL ativo.</p>
          </div>
        </footer>

      </div>
    </div>
  );
};