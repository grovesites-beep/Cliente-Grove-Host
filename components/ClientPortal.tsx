import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  LayoutDashboard, FileText, Layers, Settings, LogOut, Bell, Search,
  Menu, X, ChevronRight, Zap, ArrowUpRight, Globe, ShieldCheck, Clock
} from 'lucide-react';
import { ClientData, BlogPost } from '../types';
import { generateBlogOutline, generateFullPost } from '../services/geminiService';
import { updateIntegrationStatus } from '../services/supabaseClient';
import { useToastContext } from '../contexts/ToastContext';
import { notificationService } from '../services/notificationService';

interface ClientPortalProps {
  client: ClientData;
  onUpdateClient: (updated: ClientData) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ client, onUpdateClient }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'blog' | 'integrations' | 'settings'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toast = useToastContext();

  // Estados do Blog (Mantidos da versão anterior)
  const [isGenerating, setIsGenerating] = useState(false);
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [blogTopic, setBlogTopic] = useState('');
  const [blogTone, setBlogTone] = useState('Profissional');
  const [generatedContent, setGeneratedContent] = useState('');

  const [step, setStep] = useState<1 | 2>(1);

  // Estados de Configuração do WordPress
  const [wpModalOpen, setWpModalOpen] = useState(false);
  const [wpConfig, setWpConfig] = useState({ url: '', username: '', appPassword: '' });
  const [isConnectingWp, setIsConnectingWp] = useState(false);

  // Dados Mockados para o Gráfico (Convertendo visitas em "Leads" fictícios para o visual)
  const analyticsData = client.visits.map((v, i) => ({
    day: `Dia ${i + 1}`,
    visits: v,
    leads: Math.floor(v * 0.08)
  }));

  // --- Funções do Blog (Mantidas) ---
  const handleGenerateClick = async () => {
    if (!blogTopic) return;
    setIsGenerating(true);
    const outline = await generateBlogOutline({
      topic: blogTopic,
      tone: blogTone,
      keywords: blogTopic.split(' ').join(', ')
    });
    setGeneratedContent(outline);
    setIsGenerating(false);
    setStep(2);
  };

  const handleFullPostGeneration = async () => {
    setIsGenerating(true);
    const fullPost = await generateFullPost(generatedContent, {
      topic: blogTopic,
      tone: blogTone,
      keywords: blogTopic.split(' ').join(', ')
    });
    setGeneratedContent(fullPost);
    setIsGenerating(false);
  };

  const handlePublish = () => {
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: blogTopic || 'Novo Post Sem Título',
      status: 'published',
      date: new Date().toLocaleDateString('pt-BR'),
      content: generatedContent
    };
    onUpdateClient({ ...client, posts: [newPost, ...client.posts] });

    // Notificar cliente sobre a nova publicação
    try {
      notificationService.sendEmail(
        client.email,
        `Seu novo artigo foi publicado: ${newPost.title}`,
        `<h1>Sucesso!</h1><p>Seu novo artigo "<strong>${newPost.title}</strong>" acaba de ser publicado no seu site.</p>`
      );
    } catch (e) {
      console.error(e);
    }

    setBlogModalOpen(false);
    setStep(1);
    setBlogTopic('');
    setGeneratedContent('');
    toast.success("Artigo publicado e notificações enviadas!");
  };

  // --- Funções de Integração (WordPress) ---
  const handleConnectIntegration = (integration: any) => {
    if (integration.name === 'WordPress') {
      setWpConfig({
        url: client.siteUrl ? `https://${client.siteUrl}` : '',
        username: '',
        appPassword: ''
      });
      setWpModalOpen(true);
    } else {
      alert(`Configuração de ${integration.name} em breve.`);
    }
  };

  const handleSaveWordPress = async () => {
    setIsConnectingWp(true);

    // 1. Encontrar o ID da integração do WordPress para este cliente
    const wpIntegration = client.integrations.find(i => i.name === 'WordPress');

    if (wpIntegration) {
      try {
        // 2. Salvar no Supabase
        await updateIntegrationStatus(wpIntegration.id, 'connected', 'Agora');

        // 3. Atualizar Estado Local
        const updatedIntegrations = client.integrations.map(i =>
          i.id === wpIntegration.id ? { ...i, status: 'connected' as const, lastSync: 'Agora' } : i
        );

        onUpdateClient({ ...client, integrations: updatedIntegrations });
        setWpModalOpen(false);
        toast.success("WordPress conectado com sucesso!");

      } catch (error) {
        console.error("Erro ao salvar integração:", error);
        toast.error("Erro ao salvar conexão no banco.");
      }
    } else {
      // Caso de fallback se não achar o ID (para mocks antigos)
      toast.error("Integração WordPress não encontrada.");
    }

    setIsConnectingWp(false);
  };

  // --- Componentes Internos de UI ---

  const StatCard = ({ title, value, subtext, icon: Icon, trend, colorClass }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-110 transition-transform ${colorClass}`}></div>
      <div className="flex justify-between items-start z-10">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${colorClass.replace('bg-', 'bg-opacity-20 text-')}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-center gap-2 z-10">
        {trend && (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
            <ArrowUpRight size={12} /> {trend}
          </span>
        )}
        <span className="text-slate-400 text-xs">{subtext}</span>
      </div>
    </div>
  );

  // --- Renderização das Páginas ---

  const renderOverview = () => (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        <div className="flex-1 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Bem-vindo de volta, {client.name.split(' ')[0]}! 👋</h2>
            <p className="text-blue-100 mb-6 max-w-md">O site <strong>{client.siteUrl}</strong> está performando muito bem esta semana. Você tem novas atualizações de segurança.</p>
            <button
              onClick={() => setActiveTab('blog')}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg"
            >
              Criar Novo Conteúdo
            </button>
          </div>
          {/* Decorative Circles */}
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl"></div>
          <div className="absolute top-0 right-10 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-xl"></div>
        </div>

        <div className="w-full md:w-1/3 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-4 ring-8 ring-green-50/50">
            <ShieldCheck size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Site Seguro</h3>
          <p className="text-slate-400 text-sm mt-2">SSL Ativo • Backup Diário</p>
          <div className="mt-4 px-3 py-1 bg-slate-100 rounded-full text-xs font-mono text-slate-600">
            v2.4.0 (Atualizado)
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Visitas"
          value={client.visits.reduce((a, b) => a + b, 0).toLocaleString('pt-BR')}
          subtext="Últimos 7 dias"
          icon={Globe}
          trend="+12%"
          colorClass="bg-blue-500"
        />
        <StatCard
          title="Leads Gerados"
          value={Math.floor(client.visits.reduce((a, b) => a + b, 0) * 0.08)}
          subtext="Taxa conv. 8%"
          icon={Zap}
          trend="+5%"
          colorClass="bg-yellow-500"
        />
        <StatCard
          title="Artigos Publicados"
          value={client.posts.filter(p => p.status === 'published').length}
          subtext="No blog"
          icon={FileText}
          colorClass="bg-purple-500"
        />
        <StatCard
          title="Vencimento Hosp."
          value={client.hostingExpiry.split('/')[0] + '/Dez'}
          subtext="Renovação Auto"
          icon={Clock}
          colorClass="bg-pink-500"
        />
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Relatório de Tráfego</h3>
            <select className="bg-slate-50 border-none text-slate-500 text-sm rounded-lg px-3 py-1 focus:ring-0 cursor-pointer">
              <option>Últimos 7 dias</option>
              <option>Este Mês</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#4f46e5"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Status dos Serviços</h3>
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Wordpress</p>
                  <p className="text-xs text-slate-500">Núcleo v6.4</p>
                </div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Elementor Pro</p>
                  <p className="text-xs text-slate-500">Licença Ativa</p>
                </div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-medium hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                <Settings size={18} /> Solicitar Manutenção
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBlog = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-fadeIn min-h-[600px]">
      <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciador de Blog</h2>
          <p className="text-slate-500 mt-1">Gerencie seus posts e use IA para criar conteúdo novo.</p>
        </div>
        <button
          onClick={() => setBlogModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-200"
        >
          <Zap size={18} /> Criar com IA
        </button>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-100">
                <th className="px-6 py-4 font-medium">Título do Artigo</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {client.posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-6">
                    <p className="font-bold text-slate-800">{post.title}</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${post.status === 'published' ? 'bg-green-100 text-green-700' :
                      post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                      {post.status === 'published' ? 'Publicado' :
                        post.status === 'scheduled' ? 'Agendado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-slate-500 text-sm">{post.date}</td>
                  <td className="px-6 py-6 text-right">
                    <button className="text-slate-400 hover:text-indigo-600 font-medium">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {client.posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>Nenhum artigo encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
      {client.integrations.map((integration) => (
        <div key={integration.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
          <div className={`absolute top-0 left-0 w-full h-2 ${integration.status === 'connected' ? 'bg-green-500' : 'bg-slate-200'}`}></div>
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
            <img src={integration.icon} alt={integration.name} className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{integration.name}</h3>
          <p className="text-sm text-slate-400 mb-6">
            {integration.status === 'connected' ? `Sincronizado: ${integration.lastSync}` : 'Integração disponível'}
          </p>
          <button
            onClick={() => handleConnectIntegration(integration)}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${integration.status === 'connected'
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
              }`}>
            {integration.status === 'connected' ? 'Configurar' : 'Conectar Agora'}
          </button>
        </div>
      ))}
    </div>
  );

  // --- Layout Principal (Sidebar + Content) ---

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group ${activeTab === id
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
        }`}
    >
      <Icon size={20} className={activeTab === id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
      <span className="font-semibold text-sm">{label}</span>
      {activeTab === id && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden font-sans">

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="flex flex-col h-full p-6">
          {/* Logo Area */}
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">N</div>
            <div>
              <h1 className="font-bold text-xl text-slate-800 tracking-tight">NexusHub</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Portal do Cliente</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-2">
            <p className="px-4 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Menu Principal</p>
            <SidebarItem id="overview" label="Painel (Dashboard)" icon={LayoutDashboard} />
            <SidebarItem id="blog" label="Artigos & Blog" icon={FileText} />
            <SidebarItem id="integrations" label="Integrações" icon={Layers} />

            <div className="pt-8 pb-2">
              <p className="px-4 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Sistema</p>
              <SidebarItem id="settings" label="Configurações" icon={Settings} />
            </div>
          </nav>

          {/* User Profile Snippet at Bottom */}
          <div className="mt-auto pt-6 border-t border-slate-50">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <img
                src={`https://ui-avatars.com/api/?name=${client.name}&background=4f46e5&color=fff`}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{client.name}</p>
                <p className="text-xs text-slate-400 truncate">{client.siteUrl}</p>
              </div>
            </div>
            <button className="mt-4 w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-500 text-sm font-medium py-2">
              <LogOut size={16} /> Sair do Portal
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-8 py-4 flex justify-between items-center border-b border-slate-200/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
              <span>Portal</span>
              <ChevronRight size={14} />
              <span className="text-slate-800 font-medium capitalize">{activeTab === 'overview' ? 'Visão Geral' : activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-9 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-64 outline-none transition-all"
              />
            </div>
            <button className="relative p-2.5 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 hover:shadow-md transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-20">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'blog' && renderBlog()}
            {activeTab === 'integrations' && renderIntegrations()}
            {activeTab === 'settings' && (
              <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-white rounded-3xl border border-slate-100">
                <Settings size={48} className="mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-slate-600">Configurações</h3>
                <p>Funcionalidade em desenvolvimento.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- MODAL DO BLOG (Mantido funcionalmente, atualizado visualmente) --- */}
      {blogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Zap size={20} /></div>
                Editor de Blog com IA
              </h2>
              <button onClick={() => setBlogModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {step === 1 ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Sobre o que vamos escrever hoje?</label>
                    <input
                      type="text"
                      className="w-full border-2 border-slate-100 rounded-xl p-4 focus:border-indigo-500 focus:ring-0 outline-none text-lg transition-colors"
                      placeholder="ex: 5 Dicas para E-commerce"
                      value={blogTopic}
                      onChange={(e) => setBlogTopic(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Qual o tom de voz?</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Profissional', 'Descontraído', 'Vendedor', 'Técnico'].map(tone => (
                        <button
                          key={tone}
                          onClick={() => setBlogTone(tone)}
                          className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${blogTone === tone
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-100 text-slate-500 hover:border-slate-200'
                            }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex-1 relative bg-slate-50 rounded-xl border border-slate-200 p-1">
                    {isGenerating && (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                          <p className="font-bold text-indigo-600 animate-pulse">A IA está criando...</p>
                        </div>
                      </div>
                    )}
                    <textarea
                      className="w-full h-80 bg-transparent p-4 outline-none resize-none font-mono text-sm leading-relaxed text-slate-700"
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                    />
                  </div>
                  <button onClick={handleFullPostGeneration} disabled={isGenerating} className="text-indigo-600 text-sm font-bold hover:underline self-end">
                    {isGenerating ? '' : 'Refazer / Expandir Texto'}
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              {step === 1 ? (
                <button
                  onClick={handleGenerateClick}
                  disabled={!blogTopic || isGenerating}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                >
                  {isGenerating ? 'Processando...' : 'Gerar Esboço'}
                  {!isGenerating && <ChevronRight size={18} />}
                </button>
              ) : (
                <>
                  <button onClick={() => setStep(1)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800">Voltar</button>
                  <button
                    onClick={handlePublish}
                    className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200 flex items-center gap-2"
                  >
                    <Globe size={18} /> Publicar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIGURAÇÃO WORDPRESS --- */}
      {wpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <img src="https://s.w.org/style/images/about/WordPress-logotype-wmark.png" className="w-6 h-6" alt="WP" />
                Conectar WordPress
              </h3>
              <button onClick={() => setWpModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <p className="text-sm text-slate-500 mb-4">Insira os dados do seu site WordPress para habilitar a publicação automática de artigos.</p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL do Site</label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                  placeholder="https://seusite.com"
                  value={wpConfig.url}
                  onChange={e => setWpConfig({ ...wpConfig, url: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome de Usuário</label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                  placeholder="admin"
                  value={wpConfig.username}
                  onChange={e => setWpConfig({ ...wpConfig, username: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Senha de Aplicativo</label>
                <input
                  type="password"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                  placeholder="Gere em Usuários > Perfil"
                  value={wpConfig.appPassword}
                  onChange={e => setWpConfig({ ...wpConfig, appPassword: e.target.value })}
                />
                <p className="text-[10px] text-slate-400 mt-1">Não use sua senha de login normal. Crie uma Application Password no painel do WP.</p>
              </div>

              <button
                onClick={handleSaveWordPress}
                disabled={isConnectingWp || !wpConfig.url || !wpConfig.username || !wpConfig.appPassword}
                className="w-full py-4 mt-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isConnectingWp ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Testar e Salvar Conexão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};