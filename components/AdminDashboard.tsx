import React, { useState } from 'react';
import { ClientData, SiteType } from '../types';
import {
  Users, LayoutDashboard, Settings, LogOut, Search, Bell,
  Menu, ChevronRight, DollarSign, Briefcase, Plus, MoreVertical, ExternalLink, X, Save, FileText, ArrowUpRight, Database, Star, Mail, Phone
} from 'lucide-react';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

interface AdminDashboardProps {
  clients: ClientData[];
  onSelectClient: (client: ClientData) => void;
  onSwitchToClientView: (client: ClientData) => void;
  onAddClient: (client: Omit<ClientData, 'id'>) => void;
  onLogout: () => void;
  onSeedDatabase: () => void;
}


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ clients, onSelectClient, onSwitchToClientView, onAddClient, onLogout, onSeedDatabase }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'finance' | 'settings'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New Client Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    email: '',
    siteUrl: '',
    siteType: SiteType.INSTITUTIONAL,
    hostingExpiry: '',
    maintenanceMode: false
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClient(newClient);
    setIsModalOpen(false);
    setNewClient({
      name: '', company: '', email: '', siteUrl: '', siteType: SiteType.INSTITUTIONAL, hostingExpiry: '', maintenanceMode: false
    });
  };

  // Mock data for Admin Charts
  const revenueData = [
    { month: 'Jan', revenue: 4500 },
    { month: 'Fev', revenue: 5200 },
    { month: 'Mar', revenue: 4800 },
    { month: 'Abr', revenue: 6100 },
    { month: 'Mai', revenue: 5900 },
    { month: 'Jun', revenue: 7500 },
  ];

  // --- Components ---

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

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between group hover:shadow-md transition-shadow">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        <p className="text-xs text-slate-400 mt-1">{subtext}</p>
      </div>
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );


  const renderNewClientModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Adicionar Novo Cliente</h3>
          <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nome do Cliente</label>
              <input required className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 mt-1"
                value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Empresa</label>
              <input required className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 mt-1"
                value={newClient.company} onChange={e => setNewClient({ ...newClient, company: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Email de Acesso</label>
            <input required type="email" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 mt-1"
              value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">URL do Site</label>
            <input required className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 mt-1" placeholder="ex: meusite.com"
              value={newClient.siteUrl} onChange={e => setNewClient({ ...newClient, siteUrl: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
              <select className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 mt-1"
                value={newClient.siteType} onChange={e => setNewClient({ ...newClient, siteType: e.target.value as SiteType })}>
                <option value={SiteType.INSTITUTIONAL}>Institucional</option>
                <option value={SiteType.LANDING_PAGE}>Landing Page</option>
                <option value={SiteType.ECOMMERCE}>E-commerce</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Vencimento Hosp.</label>
              <input type="date" required className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 mt-1"
                value={newClient.hostingExpiry} onChange={e => setNewClient({ ...newClient, hostingExpiry: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 mt-4">
            Criar Cliente
          </button>
        </form>
      </div>
    </div>
  );

  const renderOverview = () => {
    // Mock Data for new charts
    const barData = [
      { name: 'S', value: 20 }, { name: 'T', value: 45 }, { name: 'Q', value: 30 },
      { name: 'Q', value: 50 }, { name: 'S', value: 70 }, { name: 'S', value: 40 }, { name: 'D', value: 60 }
    ];

    const serviceData = [
      { name: 'E-commerce', value: 40 },
      { name: 'Inst.', value: 35 },
      { name: 'Landing', value: 25 },
    ];
    const COLORS = ['#4F46E5', '#10B981', '#F59E0B'];

    return (
      <div className="space-y-6 animate-fadeIn text-slate-800 font-sans">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Visão Geral da Agência</h2>
            <p className="text-slate-400 mt-1">Última atualização: Hoje, 14:30</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-white rounded-full text-slate-400 hover:text-indigo-600 shadow-sm border border-slate-100 hover:border-indigo-100 transition-colors"><ArrowUpRight size={20} /></button>
          </div>
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Col - Stats & Dark Card */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Total Active Clients */}
            <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex flex-col justify-between h-64 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-600 group-hover:scale-110 transition-transform duration-500">
                <Users size={120} />
              </div>
              <div>
                <h3 className="text-slate-500 font-medium mb-1">Clientes Ativos</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">{clients.length}</span>
                  <span className="p-1 bg-green-100 text-green-600 rounded-full text-xs font-bold px-2">+2 novos</span>
                </div>
                <p className="text-slate-400 text-sm mt-2 max-w-[150px]">Crescimento constante neste mês.</p>
              </div>
              <button onClick={() => setActiveTab('clients')} className="w-fit px-5 py-2 rounded-full bg-slate-50 text-slate-600 text-sm font-bold mt-4 hover:bg-slate-100 border border-slate-200 transition-colors">Ver Detalhes</button>
            </div>

            {/* Dark Card - Revenue/Finance */}
            <div className="bg-[#1E1B4B] p-6 rounded-[30px] shadow-xl text-white flex flex-col justify-between h-64 relative">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <DollarSign size={24} className="text-indigo-300" />
                </div>
                <span className="text-indigo-300 text-xs font-medium">Hoje</span>
              </div>
              <div>
                <h3 className="text-indigo-200 text-sm font-medium mb-1">Receita Projetada</h3>
                <div className="text-4xl font-bold mb-2">R$ 14.500</div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-indigo-900/50 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-400 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-xs text-indigo-300">65%</span>
                </div>
              </div>
            </div>

            {/* Sales Total / Bar Chart */}
            <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm md:col-span-2 h-72">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Atividade Semanal</h3>
                  <p className="text-xs text-slate-400">Interações e updates dos clientes</p>
                </div>
                <button className="text-xs font-bold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full">Ver Relatório</button>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={12}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#E2E8F0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Col - Donut & List */}
          <div className="lg:col-span-4 space-y-6">

            {/* Donut Chart - Services */}
            <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm h-80 flex flex-col items-center justify-center relative">
              <h3 className="text-lg font-bold absolute top-6 left-6">Serviços</h3>
              <div className="w-full h-48 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Centro do Donut */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pt-4 text-center">
                <p className="text-2xl font-bold text-slate-800">100%</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Capacidade</p>
              </div>
              <div className="flex gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-600"></div> E-comm</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Inst.</div>
              </div>
            </div>

            {/* Top Items List */}
            <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Solicitações Recentes</h3>
                <button className="p-1 hover:bg-slate-50 rounded-full"><MoreVertical size={16} className="text-slate-400" /></button>
              </div>
              <div className="space-y-5">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
                        <span className="text-xs font-bold text-slate-600">CJ</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Code Journey</p>
                        <p className="text-xs text-slate-400">Novo Post Blog</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg">+12%</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors">
                Ver Todas
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const renderClients = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, company, contact

    const filteredClients = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (name: string) => {
      const colors = [
        'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500',
        'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-teal-500',
        'bg-cyan-500', 'bg-blue-500'
      ];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    };

    const getStatusBadge = (client: ClientData) => {
      // Logic based on maintenance mode or other criteria
      if (client.maintenanceMode) {
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-200">• Manutenção</span>;
      }
      if (client.posts.length > 0) {
        return <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-200">• Ativo</span>;
      }
      return <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-200">• Novo</span>;
    };

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{filteredClients.length} Clientes</h2>
            <p className="text-slate-500 mt-1">Gerencie todos os seus clientes em um só lugar</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105"
          >
            <Plus size={20} /> Novo Cliente
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar cliente, email ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <MoreVertical size={18} />
              </button>
              <button
                onClick={() => onSeedDatabase()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
              >
                <Database size={18} /> Seed DB
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => onSwitchToClientView(client)}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${getAvatarColor(client.name)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                          {getInitials(client.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{client.name}</p>
                          <p className="text-xs text-slate-500">Cliente desde {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          (11) 9999-9999
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-slate-400" />
                        <span className="font-medium text-slate-700">{client.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(client)}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://${client.siteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {client.siteUrl}
                        <ExternalLink size={14} />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSwitchToClientView(client);
                        }}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Acessar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredClients.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum cliente encontrado</h3>
              <p className="text-slate-500 mb-6">Comece adicionando seu primeiro cliente ou ajuste os filtros</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Adicionar Cliente
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredClients.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-600">
              Mostrando <span className="font-bold">{filteredClients.length}</span> de <span className="font-bold">{clients.length}</span> resultados
            </p>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Anterior
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">
                1
              </button>
              <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-700">

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Modern Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-[280px] bg-white m-4 rounded-[30px] border border-slate-100 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl shadow-slate-200/50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">N</div>
            <div>
              <h1 className="font-bold text-xl text-slate-800 tracking-tight">NexusHub</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-2">
            <div className="pb-4">
              <p className="text-xs font-bold text-slate-300 uppercase px-4 mb-2">Menu</p>
              <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                <LayoutDashboard size={20} /> Visão Geral
              </button>
              <button onClick={() => setActiveTab('clients')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'clients' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                <Users size={20} /> Clientes
              </button>
              <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'finance' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                <DollarSign size={20} /> Financeiro
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-300 uppercase px-4 mb-2">Geral</p>
              <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                <Settings size={20} /> Configurações
              </button>
            </div>
          </nav>
        </div>

        <div className="mt-auto p-8">
          <div className="bg-slate-900 rounded-2xl p-4 relative overflow-hidden group cursor-pointer mb-4">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Star size={16} fill="white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Pro Plan</p>
                <p className="text-white/60 text-xs">Acesso total</p>
              </div>
            </div>
          </div>

          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold">
            <LogOut size={20} /> Sair da conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="px-8 py-6 flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800">Bem-vindo, Admin</h2>
            <p className="text-slate-400 text-sm">Gerencie sua agência com eficiência</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Inspiration Pill Menu */}
            <div className="hidden md:flex bg-white p-1.5 rounded-full border border-slate-100 shadow-sm">
              <button className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold shadow-md">Dashboard</button>
              <button className="px-4 py-1.5 text-slate-500 hover:bg-slate-50 rounded-full text-xs font-bold transition-colors">Alertas</button>
              <button className="px-4 py-1.5 text-slate-500 hover:bg-slate-50 rounded-full text-xs font-bold transition-colors">Suporte</button>
            </div>

            <div className="w-px h-8 bg-slate-200 mx-2"></div>

            <button className="relative w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-white/50 p-2 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                AD
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-slate-800">Admin User</p>
                <p className="text-xs text-slate-400">admin@nexushub.com</p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 pb-8">
          {/* Dynamic Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'clients' && renderClients()}
          {activeTab === 'finance' && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4"><DollarSign size={32} className="text-slate-400" /></div>
              <h3 className="text-xl font-bold text-slate-800">Módulo Financeiro</h3>
              <p className="text-slate-500">Em desenvolvimento</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4"><Settings size={32} className="text-slate-400" /></div>
              <h3 className="text-xl font-bold text-slate-800">Configurações</h3>
              <p className="text-slate-500">Em desenvolvimento</p>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && renderNewClientModal()}
    </div>
  );
};