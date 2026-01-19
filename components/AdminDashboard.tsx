import React, { useState, useEffect } from 'react';
import { ClientData, SiteType } from '../types';
import {
  Users, LayoutDashboard, Settings, LogOut, Search, Bell,
  Menu, ChevronRight, DollarSign, Briefcase, Plus, MoreVertical, ExternalLink, X, Save, FileText, ArrowUpRight, Database, Star, Mail, Phone, Package, Edit2, Trash2, ShieldCheck
} from 'lucide-react';
import { formatDateBR, formatDateTimeBR, formatPhoneBR, formatCurrencyBR, getRelativeTimeBR } from '../utils/formatters';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { ClientDetails } from './ClientDetails';
import { ClientEditModal } from './ClientEditModal';
import { ContractManager } from './ContractManager';
import { ProductManager } from './ProductManager';
import { ConfirmationModal } from './ConfirmationModal';
import { useToastContext } from '../contexts/ToastContext';
import { notificationService } from '../services/notificationService';

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


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ clients, onSelectClient, onSwitchToClientView, onAddClient, onUpdateClient, onDeleteClient, onLogout, onSeedDatabase }) => {
  // Load saved tab from localStorage
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'finance' | 'products' | 'contracts' | 'settings'>(() => {
    const saved = localStorage.getItem('adminActiveTab');
    return (saved as 'overview' | 'clients' | 'finance' | 'products' | 'contracts' | 'settings') || 'overview';
  });
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'security' | 'notifications' | 'integrations' | 'branding'>('general');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('nexusHub_settings');
    return saved ? JSON.parse(saved) : {
      agencyName: 'NexusHub Digital',
      adminEmail: 'admin@nexushub.com',
      whiteLabel: true,
      autoRegister: false,
      twoFactor: false,
      auditLogs: true,
      resendApiKey: '',
      resendFromEmail: 'notifications@nexushub.digital',
      resendFromName: 'NexusHub Support',
      evolutionApiUrl: '',
      evolutionApiKey: '',
      evolutionInstance: 'NexusHub_Principal'
    };
  });

  const toast = useToastContext();

  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isFetchingQr, setIsFetchingQr] = useState(false);

  const handleGenerateQrCode = async () => {
    if (!settings.evolutionApiUrl || !settings.evolutionApiKey || !settings.evolutionInstance) {
      toast.error("Configure a API Evolution nas configurações primeiro.");
      setSettingsSubTab('notifications');
      return;
    }

    setIsFetchingQr(true);
    try {
      // Simulação de chamada real para a Evolution API
      // Em produção: 
      // const res = await fetch(`${settings.evolutionApiUrl}/instance/connect/${settings.evolutionInstance}`, { headers: { apikey: settings.evolutionApiKey } });
      // const data = await res.json();

      await new Promise(r => setTimeout(r, 1500)); // Simula delay
      setQrCodeData('https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=NexusHub_WP_Connect_Demo');
      toast.success("QR Code gerado com sucesso!");
    } catch (err) {
      toast.error("Erro ao conectar com a API Evolution.");
    } finally {
      setIsFetchingQr(false);
    }
  };

  const handleSendInvoiceNotification = async (client: any) => {
    toast.info(`Enviando fatura para ${client.company}...`);
    try {
      // Usando o serviço de notificação
      await notificationService.sendEmail(
        client.email,
        "Sua Fatura NexusHub está disponível",
        `<h1>Olá ${client.name}</h1><p>Sua fatura do mês de Jan/2026 já está disponível no portal.</p>`
      );
      toast.success("Notificação de fatura enviada!");
    } catch (e) {
      toast.error("Erro ao enviar notificação.");
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('nexusHub_settings', JSON.stringify(settings));
    toast.success("Configurações salvas com sucesso!");
  };

  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    email: '',
    siteUrl: '',
    siteType: SiteType.INSTITUTIONAL,
    hostingExpiry: '',
    maintenanceMode: false
  });

  // Client Details Modal State
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<ClientData | null>(null);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);

  // Client FULL Edit Modal State
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<ClientData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Deletion/Logout Confirmation State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: () => { }
  });

  // Column Widths for Resizable Columns
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
    cliente: 250,
    contato: 250,
    empresa: 180,
    status: 120,
    site: 200,
    acoes: 100
  });

  const [resizing, setResizing] = useState<string | null>(null);

  const startResizing = (columnId: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(columnId);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;

      const deltaX = e.movementX;
      setColumnWidths(prev => ({
        ...prev,
        [resizing!]: Math.max(80, prev[resizing!] + deltaX)
      }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

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
    { month: 'Jan', revenue: 12000 },
    { month: 'Fev', revenue: 13500 },
    { month: 'Mar', revenue: 15000 },
    { month: 'Abr', revenue: 16200 },
    { month: 'Mai', revenue: 18000 },
    { month: 'Jun', revenue: 21000 },
    { month: 'Jul', revenue: 23500 },
    { month: 'Ago', revenue: 25000 },
    { month: 'Set', revenue: 28000 },
    { month: 'Out', revenue: 31000 },
    { month: 'Nov', revenue: 33500 },
    { month: 'Dez', revenue: 36000 },
  ];

  // --- Components ---

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
    const newClientsThisMonth = clients.length; // Simplified

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
    ].filter(item => item.value > 0);

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
      if (client.maintenanceMode) {
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-200">• Manutenção</span>;
      }
      if (client.posts?.length > 0) {
        return <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-200">• Ativo</span>;
      }
      return <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-200">• Novo</span>;
    };

    return (
      <div className="space-y-6 animate-fadeIn">
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

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th style={{ width: columnWidths.cliente }} className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider relative group border-r border-slate-100 last:border-r-0">
                    Cliente
                    <div onMouseDown={startResizing('cliente')} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-indigo-500 transition-colors" />
                  </th>
                  <th style={{ width: columnWidths.contato }} className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider relative group border-r border-slate-100 last:border-r-0">
                    Contato
                    <div onMouseDown={startResizing('contato')} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-indigo-500 transition-colors" />
                  </th>
                  <th style={{ width: columnWidths.empresa }} className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider relative group border-r border-slate-100 last:border-r-0">
                    Empresa
                    <div onMouseDown={startResizing('empresa')} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-indigo-500 transition-colors" />
                  </th>
                  <th style={{ width: columnWidths.status }} className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider relative group border-r border-slate-100 last:border-r-0">
                    Status
                    <div onMouseDown={startResizing('status')} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-indigo-500 transition-colors" />
                  </th>
                  <th style={{ width: columnWidths.site }} className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider relative group border-r border-slate-100 last:border-r-0">
                    Site
                    <div onMouseDown={startResizing('site')} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-indigo-500 transition-colors" />
                  </th>
                  <th style={{ width: columnWidths.acoes }} className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientsFiltered.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedClientForDetails(client);
                      setIsClientDetailsOpen(true);
                    }}
                  >
                    <td className="px-6 py-4 truncate">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`shrink-0 w-10 h-10 rounded-full ${getAvatarColor(client.name)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                          {getInitials(client.name)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-800 truncate">{client.name}</p>
                          <p className="text-xs text-slate-500 truncate">Cliente desde {formatDateBR(new Date())}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate">
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
                          <Mail size={14} className="shrink-0 text-slate-400" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
                          <Phone size={14} className="shrink-0 text-slate-400" />
                          <span className="truncate">{formatPhoneBR(client.phone || '')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Briefcase size={16} className="shrink-0 text-slate-400" />
                        <span className="font-medium text-slate-700 truncate">{client.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(client)}
                    </td>
                    <td className="px-6 py-4 truncate">
                      <a
                        href={`https://${client.siteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm hover:underline truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="truncate">{client.siteUrl}</span>
                        <ExternalLink size={14} className="shrink-0" />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClientForEdit(client);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 bg-indigo-50 lg:bg-transparent hover:bg-white rounded-lg text-indigo-600 lg:text-indigo-400 lg:hover:text-indigo-600 transition-all shadow-sm border border-transparent hover:border-slate-100"
                          title="Editar Cadastro Completo"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModal({
                              isOpen: true,
                              type: 'danger',
                              title: 'Excluir Cliente',
                              message: `Tem certeza que deseja remover ${client.name}? Esta ação não pode ser desfeita.`,
                              onConfirm: () => {
                                onDeleteClient(client.id);
                                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                              }
                            });
                          }}
                          className="p-2 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-lg transition-colors"
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
        </div>
      </div>
    );
  };

  const renderFinance = () => {
    const totalMRR = clients.reduce((acc, c) => acc + (c.products?.reduce((pAcc, p) => pAcc + (p.active ? p.price : 0), 0) || 1500), 0);
    const growth = 12.5;

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center text-slate-800">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Painel Financeiro</h2>
            <p className="text-slate-500 mt-1">Acompanhe a saúde financeira da sua agência</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Save size={18} /> Exportar Relatório
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="MRR Atual" value={formatCurrencyBR(totalMRR)} subtext="+R$ 1.250 este mês" icon={DollarSign} colorClass="bg-indigo-600" />
          <StatCard title="Crescimento" value={`${growth}%`} subtext="Em relação ao mês anterior" icon={ArrowUpRight} colorClass="bg-emerald-500" />
          <StatCard title="Churn Rate" value="2.4%" subtext="1 cliente perdido" icon={Users} colorClass="bg-rose-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm h-96">
            <h3 className="text-lg font-bold mb-6 text-slate-800">Projeção de Receita (12 meses)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-slate-800">Últimas Transações</h3>
            <div className="space-y-4">
              {clients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{client.company}</p>
                      <p className="text-xs text-slate-400">Mensalidade • 15/05/2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">+{formatCurrencyBR(1500)}</p>
                      <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">Pago</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendInvoiceNotification(client);
                      }}
                      className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-transparent hover:border-slate-100"
                      title="Notificar Fatura"
                    >
                      <Bell size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    return (
      <ProductManager
        clients={clients}
        onUpdateClient={onUpdateClient}
      />
    );
  };

  const renderContracts = () => {
    return (
      <ContractManager
        clients={clients}
        onUpdateClient={onUpdateClient}
      />
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-8 text-slate-800">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Configurações de Administrador</h2>
            <p className="text-slate-500 mt-1">Ajuste os parâmetros globais do sistema NexusHub</p>
          </div>
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
          >
            <Save size={20} /> Salvar Tudo
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-2">
            {[
              { id: 'general', name: 'Geral', icon: Settings },
              { id: 'security', name: 'Segurança', icon: ShieldCheck },
              { id: 'notifications', name: 'Notificações', icon: Bell },
              { id: 'integrations', name: 'APIs & Integrações', icon: Database },
              { id: 'branding', name: 'Identidade Visual', icon: LayoutDashboard },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSettingsSubTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${settingsSubTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <item.icon size={20} />
                {item.name}
              </button>
            ))}
          </div>

          <div className="lg:col-span-9 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-10">
            {settingsSubTab === 'general' && (
              <>
                <section className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                    Informações da Agência
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nome da Agência</label>
                      <input
                        type="text"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={settings.agencyName}
                        onChange={e => setSettings({ ...settings, agencyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Principal (Admin)</label>
                      <input
                        type="email"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={settings.adminEmail}
                        onChange={e => setSettings({ ...settings, adminEmail: e.target.value })}
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                    Personalização do Portal do Cliente
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[30px] border border-slate-100 group hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl text-yellow-500 shadow-sm"><Star size={24} /></div>
                        <div>
                          <p className="font-bold text-slate-800">Modo White Label</p>
                          <p className="text-xs text-slate-500">Remova a marca NexusHub de todos os portais de clientes</p>
                        </div>
                      </div>
                      <div
                        onClick={() => setSettings({ ...settings, whiteLabel: !settings.whiteLabel })}
                        className={`w-14 h-8 ${settings.whiteLabel ? 'bg-indigo-600' : 'bg-slate-300'} rounded-full flex items-center px-1 cursor-pointer transition-colors`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${settings.whiteLabel ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[30px] border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl text-indigo-500 shadow-sm"><LayoutDashboard size={24} /></div>
                        <div>
                          <p className="font-bold text-slate-800">Auto-registro de Clientes</p>
                          <p className="text-xs text-slate-500">Permite que novos clientes criem contas sozinhos</p>
                        </div>
                      </div>
                      <div
                        onClick={() => setSettings({ ...settings, autoRegister: !settings.autoRegister })}
                        className={`w-14 h-8 ${settings.autoRegister ? 'bg-indigo-600' : 'bg-slate-300'} rounded-full flex items-center px-1 cursor-pointer transition-colors`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${settings.autoRegister ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {settingsSubTab === 'security' && (
              <section className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                  Segurança & Acesso
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[30px] border border-slate-100 group hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl text-emerald-500 shadow-sm"><ShieldCheck size={24} /></div>
                      <div>
                        <p className="font-bold text-slate-800">Autenticação em Dois Fatores (2FA)</p>
                        <p className="text-xs text-slate-500">Exige verificação extra para todos os usuários admin</p>
                      </div>
                    </div>
                    <div className="w-14 h-8 bg-slate-300 rounded-full flex items-center px-1 cursor-pointer">
                      <div
                        onClick={() => setSettings({ ...settings, twoFactor: !settings.twoFactor })}
                        className={`w-14 h-8 ${settings.twoFactor ? 'bg-indigo-600' : 'bg-slate-300'} rounded-full flex items-center px-1 cursor-pointer transition-colors`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${settings.twoFactor ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[30px] border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl text-blue-500 shadow-sm"><Database size={24} /></div>
                      <div>
                        <p className="font-bold text-slate-800">Logs de Auditoria</p>
                        <p className="text-xs text-slate-500">Rastreie todas as ações importantes realizadas no sistema</p>
                      </div>
                    </div>
                    <div
                      onClick={() => setSettings({ ...settings, auditLogs: !settings.auditLogs })}
                      className={`w-14 h-8 ${settings.auditLogs ? 'bg-indigo-600' : 'bg-slate-300'} rounded-full flex items-center px-1 cursor-pointer transition-colors`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${settings.auditLogs ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {settingsSubTab === 'notifications' && (
              <div className="space-y-10">
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                      E-mail (Resend)
                    </h3>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-200">Ativo</span>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[30px] border border-slate-100 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">API Key Resend</label>
                        <div className="relative">
                          <input
                            type="password"
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                            value={settings.resendApiKey}
                            onChange={e => setSettings({ ...settings, resendApiKey: e.target.value })}
                            placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                          />
                          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 text-xs font-bold hover:underline">Verificar Conexão</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">E-mail do Remetente</label>
                          <input
                            type="text"
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={settings.resendFromEmail}
                            onChange={e => setSettings({ ...settings, resendFromEmail: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nome do Remetente</label>
                          <input
                            type="text"
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={settings.resendFromName}
                            onChange={e => setSettings({ ...settings, resendFromName: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                      WhatsApp (Evolution API)
                    </h3>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-amber-200">Aguardando Conexão</span>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[30px] border border-slate-100 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">URL da API (Evolution)</label>
                        <input
                          type="text"
                          className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          placeholder="https://api.evolution.io"
                          value={settings.evolutionApiUrl}
                          onChange={e => setSettings({ ...settings, evolutionApiUrl: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Global API Key</label>
                          <input
                            type="password"
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                            placeholder="apikey-xxxx"
                            value={settings.evolutionApiKey}
                            onChange={e => setSettings({ ...settings, evolutionApiKey: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Instância</label>
                          <input
                            type="text"
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="NexusHub_Principal"
                            value={settings.evolutionInstance}
                            onChange={e => setSettings({ ...settings, evolutionInstance: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 space-y-4">
                      {qrCodeData ? (
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 inline-block">
                          <img src={qrCodeData} alt="WhatsApp QR Code" className="w-48 h-48 mx-auto" />
                          <p className="text-[10px] text-slate-400 mt-4 text-center">Escaneie com seu WhatsApp para conectar</p>
                          <button
                            onClick={() => setQrCodeData(null)}
                            className="w-full mt-4 text-xs font-bold text-red-500 hover:underline"
                          >
                            Limpar QR Code
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleGenerateQrCode}
                          disabled={isFetchingQr}
                          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                          {isFetchingQr ? (
                            <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></span>
                          ) : (
                            <ExternalLink size={18} />
                          )}
                          {isFetchingQr ? 'Gerando...' : 'Gerar QR Code para WhatsApp'}
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {settingsSubTab === 'integrations' && (
              <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                <Database size={48} className="mx-auto text-slate-300 mb-4" />
                <h4 className="text-lg font-bold text-slate-800">Explore novas conexões</h4>
                <p className="text-slate-500">Integrações avançadas estarão disponíveis em breve.</p>
              </div>
            )}

            {settingsSubTab === 'branding' && (
              <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                <LayoutDashboard size={48} className="mx-auto text-slate-300 mb-4" />
                <h4 className="text-lg font-bold text-slate-800">Identidade Visual</h4>
                <p className="text-slate-500">Configure logos, cores e fontes customizadas.</p>
              </div>
            )}
          </div>

          <section className="pt-6 border-t border-slate-50">
            <button
              onClick={onSeedDatabase}
              className="flex items-center gap-2 text-rose-600 font-bold hover:underline"
              title="CUIDADO: Isso irá resetar os dados para demonstração"
            >
              <Database size={18} />
              Reinicializar Banco de Dados (Demo)
            </button>
          </section>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-700">

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0F0F0F] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } flex flex-col`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Star size={24} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-bold">NexusHub</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard size={20} /> <span className="font-medium">Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('clients')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'clients' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
            <Users size={20} /> <span className="font-medium">Clientes</span>
            <span className="ml-auto bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">{clients.length}</span>
          </button>
          <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'finance' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
            <DollarSign size={20} /> <span className="font-medium">Financeiro</span>
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
            <Package size={20} /> <span className="font-medium">Produtos</span>
          </button>
          <button onClick={() => setActiveTab('contracts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'contracts' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
            <FileText size={20} /> <span className="font-medium">Contratos</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
            <Settings size={20} /> <span className="font-medium">Configurações</span>
          </button>
        </nav>

        <div className="m-4 p-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-white font-bold text-lg mb-2 text-slate-800">Novidades!</h3>
            <p className="text-white/80 text-sm mb-4">Confira as novas funcionalidades</p>
            <button className="w-full bg-white text-indigo-600 font-bold py-2 px-4 rounded-xl text-sm">Ver Agora</button>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => setConfirmModal({
              isOpen: true,
              type: 'warning',
              title: 'Sair do Sistema',
              message: 'Tem certeza que deseja encerrar sua sessão?',
              onConfirm: onLogout
            })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium"
          >
            <LogOut size={20} /> Sair
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="px-8 py-6 flex justify-between items-center bg-white/50 backdrop-blur-md">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800">Bem-vindo, Admin</h2>
            <p className="text-slate-400 text-sm">Gerencie sua agência com eficiência</p>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm"><Menu size={20} /></button>
            <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-white/50 p-2 rounded-xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">AD</div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-slate-800">Admin User</p>
                <p className="text-xs text-slate-400 text-slate-800">admin@nexushub.com</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 pb-8 pt-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'clients' && renderClients()}
          {activeTab === 'finance' && renderFinance()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'contracts' && renderContracts()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>

      {isModalOpen && renderNewClientModal()}

      {isClientDetailsOpen && selectedClientForDetails && (
        <ClientDetails
          client={selectedClientForDetails}
          onClose={() => setIsClientDetailsOpen(false)}
          onUpdate={(updated) => onUpdateClient(updated.id, updated)}
        />
      )}

      {isEditModalOpen && selectedClientForEdit && (
        <ClientEditModal
          client={selectedClientForEdit}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updated) => {
            onUpdateClient(updated.id, updated);
            setIsEditModalOpen(false);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};