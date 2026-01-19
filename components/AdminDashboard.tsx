import React, { useState, useEffect } from 'react';
import { ClientData, SiteType } from '../types';
import {
  Users, LayoutDashboard, Settings, LogOut, Search, Bell,
  Menu, ChevronRight, DollarSign, Briefcase, Plus, MoreVertical, ExternalLink, X, Save, FileText, ArrowUpRight, Database, Star, Mail, Phone, Package, Edit2, Trash2
} from 'lucide-react';
import { formatDateBR, formatDateTimeBR, formatPhoneBR, formatCurrencyBR, getRelativeTimeBR } from '../utils/formatters';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

interface AdminDashboardProps {
  clients: ClientData[];
  onSelectClient: (client: ClientData) => void;
  onSwitchToClientView: (client: ClientData) => void;
  onAddClient: (client: Omit<ClientData, 'id'>) => void;
  onUpdateClient: (clientId: string, updates: Partial<ClientData>) => void;
  onDeleteClient: (clientId: string) => void;
  onLogout: () => void;
  onSeedDatabase: () => void;
}


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ clients, onSelectClient, onSwitchToClientView, onAddClient, onLogout, onSeedDatabase }) => {
  // Load saved tab from localStorage
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'finance' | 'settings'>(() => {
    const saved = localStorage.getItem('adminActiveTab');
    return (saved as 'overview' | 'clients' | 'finance' | 'settings') || 'overview';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

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

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

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
    // Calculate real data from clients
    const activeClients = clients.filter(c => !c.maintenanceMode).length;
    const newClientsThisMonth = clients.filter(c => {
      // Assuming clients created in the last 30 days are "new"
      // Since we don't have created_at in the type, we'll use a simple heuristic
      return true; // For now, showing all as potential new
    }).length;

    // Calculate projected revenue based on client types
    const revenueByType = {
      [SiteType.ECOMMERCE]: 2500,
      [SiteType.INSTITUTIONAL]: 1500,
      [SiteType.LANDING_PAGE]: 800,
    };
    const projectedRevenue = clients.reduce((sum, client) => {
      return sum + (revenueByType[client.siteType] || 1000);
    }, 0);

    // Calculate weekly activity from client visits data
    const barData = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => {
      const totalVisits = clients.reduce((sum, client) => {
        return sum + (client.visits[index] || 0);
      }, 0);
      return { name: day, value: totalVisits };
    });

    // Calculate service distribution
    const serviceDistribution = {
      [SiteType.ECOMMERCE]: clients.filter(c => c.siteType === SiteType.ECOMMERCE).length,
      [SiteType.INSTITUTIONAL]: clients.filter(c => c.siteType === SiteType.INSTITUTIONAL).length,
      [SiteType.LANDING_PAGE]: clients.filter(c => c.siteType === SiteType.LANDING_PAGE).length,
    };

    const serviceData = [
      { name: 'E-commerce', value: serviceDistribution[SiteType.ECOMMERCE] },
      { name: 'Institucional', value: serviceDistribution[SiteType.INSTITUTIONAL] },
      { name: 'Landing Page', value: serviceDistribution[SiteType.LANDING_PAGE] },
    ].filter(item => item.value > 0); // Only show services with clients

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B'];

    return (
      <div className="space-y-6 animate-fadeIn text-slate-800 font-sans">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Visão Geral da Agência</h2>
            <p className="text-slate-400 mt-1">Última atualização: {formatDateTimeBR(new Date())}</p>
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
                  <span className="p-1 bg-green-100 text-green-600 rounded-full text-xs font-bold px-2">+{Math.min(newClientsThisMonth, 5)} novos</span>
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
                <div className="text-4xl font-bold mb-2">{formatCurrencyBR(projectedRevenue)}</div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-indigo-900/50 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${Math.min((projectedRevenue / 20000) * 100, 100)}%` }}></div>
                  </div>
                  <span className="text-xs text-indigo-300">{Math.round((projectedRevenue / 20000) * 100)}%</span>
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
    const clientsFiltered = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(clientSearchTerm.toLowerCase());
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
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{clientsFiltered.length} Clientes</h2>
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
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <MoreVertical size={18} />
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
                {clientsFiltered.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => onSwitchToClientView(client)}
                  >
                    {/* Cliente */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${getAvatarColor(client.name)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                          {getInitials(client.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{client.name}</p>
                          <p className="text-xs text-slate-500">Cliente desde {formatDateBR(new Date())}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contato */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {formatPhoneBR('11999999999')}
                        </div>
                      </div>
                    </td>

                    {/* Empresa */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-slate-400" />
                        <span className="font-medium text-slate-700">{client.company}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(client)}
                    </td>

                    {/* Site */}
                    <td className="px-6 py-4">
                      <a
                        href={`https://${client.siteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {client.siteUrl}
                        <ExternalLink size={14} />
                      </a>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Abrir modal de edição
                            console.log('Edit client:', client.id);
                          }}
                          className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                          title="Editar cliente"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClient(client.id);
                          }}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Excluir cliente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {clientsFiltered.length === 0 && (
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
        {clientsFiltered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-600">
              Mostrando <span className="font-bold">{clientsFiltered.length}</span> de <span className="font-bold">{clients.length}</span> resultados
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

      {/* Modern Sidebar - X Wallet Style */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0F0F0F] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Star size={24} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-bold">NexusHub</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview'
              ? 'bg-white/10 text-white'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'clients'
              ? 'bg-white/10 text-white'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
          >
            <Users size={20} />
            <span className="font-medium">Clientes</span>
            <span className="ml-auto bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {clients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'finance'
              ? 'bg-white/10 text-white'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
          >
            <DollarSign size={20} />
            <span className="font-medium">Financeiro</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
          >
            <Package size={20} />
            <span className="font-medium">Produtos</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
          >
            <FileText size={20} />
            <span className="font-medium">Contratos</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all relative"
          >
            <Bell size={20} />
            <span className="font-medium">Notificações</span>
            <span className="ml-auto w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings'
              ? 'bg-white/10 text-white'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
          >
            <Settings size={20} />
            <span className="font-medium">Configurações</span>
          </button>
        </nav>

        {/* Promotional Card */}
        <div className="m-4 p-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <Star size={24} className="text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              Novidades!
            </h3>
            <p className="text-white/80 text-sm mb-4">
              Confira as novas funcionalidades do sistema
            </p>
            <button className="w-full bg-white text-indigo-600 font-bold py-2 px-4 rounded-xl hover:bg-white/90 transition-colors text-sm flex items-center justify-center gap-2">
              Ver Agora
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all">
            <FileText size={20} />
            <span className="font-medium">Ajuda</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="px-8 py-6 flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800">Bem-vindo, Admin</h2>
            <p className="text-slate-400 text-sm">Gerencie sua agência com eficiência</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors shadow-sm"
            >
              <Menu size={20} />
            </button>

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