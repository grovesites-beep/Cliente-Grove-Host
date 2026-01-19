import React, { useState } from 'react';
import { ClientData, SiteType } from '../types';
import {
  Users, LayoutDashboard, Settings, LogOut, Search, Bell,
  Menu, ChevronRight, DollarSign, Briefcase, Plus, MoreVertical, ExternalLink, X, Save, FileText, ArrowUpRight
} from 'lucide-react';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface AdminDashboardProps {
  clients: ClientData[];
  onSelectClient: (client: ClientData) => void;
  onSwitchToClientView: (client: ClientData) => void;
  onAddClient: (client: Omit<ClientData, 'id'>) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ clients, onSelectClient, onSwitchToClientView, onAddClient, onLogout }) => {
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

  const renderOverview = () => (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Receita Mensal"
          value="R$ 7.500"
          subtext="+12% vs mês anterior"
          icon={DollarSign}
          colorClass="bg-green-500 shadow-lg shadow-green-200"
        />
        <StatCard
          title="Projetos Ativos"
          value={clients.length}
          subtext="2 entregas esta semana"
          icon={Briefcase}
          colorClass="bg-blue-500 shadow-lg shadow-blue-200"
        />
        <StatCard
          title="Total de Clientes"
          value={clients.length}
          subtext="3 propostas pendentes"
          icon={Users}
          colorClass="bg-indigo-500 shadow-lg shadow-indigo-200"
        />
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Crescimento de Receita</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`R$ ${value}`, 'Receita']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Requests */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Solicitações Recentes</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-2 h-2 mt-2 bg-orange-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Alteração de Banner</p>
                  <p className="text-xs text-slate-500">Bloom Boutique • Há 2 horas</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50">
            Ver Todas
          </button>
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6 animate-fadeIn font-sans text-slate-600">

      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button className="text-red-500 font-bold bg-red-50 px-4 py-2 rounded-lg text-sm whitespace-nowrap border border-red-100 flex items-center gap-2">
            <Users size={16} /> Todos
          </button>
          <button className="text-slate-500 font-medium px-4 py-2 rounded-lg text-sm whitespace-nowrap hover:bg-slate-50 flex items-center gap-2">
            <Briefcase size={16} /> Empresa
          </button>
          <button className="text-slate-500 font-medium px-4 py-2 rounded-lg text-sm whitespace-nowrap hover:bg-slate-50 flex items-center gap-2">
            <Users size={16} /> Contato
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm outline-none focus:ring-1 focus:ring-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <ArrowUpRight size={16} /> Importar
          </button>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            Filtrar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-500 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-red-600 shadow-md shadow-red-200"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Accordion Header */}
        <div className="px-6 py-4 flex items-center gap-2 border-b border-slate-100 cursor-pointer hover:bg-slate-50">
          <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center">
            <div className="transform rotate-45 mb-[2px] ml-[1px] hidden">L</div>
          </div>
          <span className="text-green-600 font-bold text-sm tracking-wide flex items-center gap-2">
            <ChevronRight size={16} className="text-green-600" />
            Contatos ativos ({filteredClients.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-[10px] text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-4 py-4 w-10 text-center"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="px-4 py-4">Contato</th>
                <th className="px-4 py-4">E-mail</th>
                <th className="px-4 py-4">Conta</th>
                <th className="px-4 py-4">Negociação</th>
                <th className="px-4 py-4">Valor Estimado</th>
                <th className="px-4 py-4">Telefone</th>
                <th className="px-4 py-4">Cargo</th>
                <th className="px-4 py-4">Tipo</th>
                <th className="px-4 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {filteredClients.map((client, index) => (
                <tr key={client.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-none group">
                  <td className="px-4 py-5 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-green-500 focus:ring-green-200" />
                  </td>
                  <td className="px-4 py-5 font-bold text-slate-800">{client.name}</td>
                  <td className="px-4 py-5 text-blue-500 hover:underline cursor-pointer">{client.email}</td>
                  <td className="px-4 py-5">
                    <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-600 flex items-center w-fit gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      {client.company}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col">
                      <span className="text-green-700 text-xs font-bold flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-[10px]">▼</div>
                        {client.maintenanceMode ? 'Em Manutenção' : 'Proposta Comercial'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-slate-500">R$ {(1200 + index * 350).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-1">
                      <img src="https://flagcdn.com/w20/br.png" width="16" alt="Brazil" />
                      <span className="text-xs text-slate-600">+55 48 999{index}1-2345</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-cyan-500 font-bold text-xs uppercase">CEO</td>
                  <td className="px-4 py-5">
                    <button
                      onClick={() => onSwitchToClientView(client)}
                      className="px-6 py-1 bg-blue-500 text-white text-xs font-bold rounded shadow-sm shadow-blue-200 hover:bg-blue-600 transition-colors"
                    >
                      Cliente
                    </button>
                  </td>
                  <td className="px-4 py-5 text-center text-slate-300 hover:text-slate-600 cursor-pointer">
                    <MoreVertical size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 border-t border-slate-100 text-sm text-red-400 font-medium flex items-center gap-2 cursor-pointer hover:bg-slate-50">
            <ChevronRight size={16} /> Contatos inativos (0)
          </div>
        </div>
      </div>

      <div className="px-4 py-2 text-xs text-slate-400 flex items-center gap-2 cursor-pointer hover:text-slate-600">
        <Plus size={14} /> Adicionar contato
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden font-sans">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-300">N</div>
            <div>
              <h1 className="font-bold text-xl text-slate-800 tracking-tight">NexusHub</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Admin Panel</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem id="overview" label="Visão Geral" icon={LayoutDashboard} />
            <SidebarItem id="clients" label="Meus Clientes" icon={Users} />
            <SidebarItem id="finance" label="Financeiro" icon={DollarSign} />

            <div className="pt-8 pb-2">
              <p className="px-4 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Sistema</p>
              <SidebarItem id="settings" label="Configurações" icon={Settings} />
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-50">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-500 text-sm font-bold py-3 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={18} /> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-8 py-4 flex justify-between items-center border-b border-slate-200/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab === 'overview' ? 'Visão Geral' : activeTab === 'clients' ? 'Clientes' : activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=0f172a&color=fff" alt="Admin" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-20">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'clients' && renderClients()}

            {activeTab === 'finance' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Faturas Recentes</h3>
                    <button className="text-indigo-600 font-bold text-sm">Ver Todas</button>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg border border-slate-100"><FileText size={16} className="text-slate-400" /></div>
                          <div>
                            <p className="font-bold text-slate-800">Fatura #00{i}2</p>
                            <p className="text-xs text-slate-500">Hospedagem + Manutenção</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-600">R$ 150,00</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg shadow-slate-200">
                  <h3 className="text-xl font-bold mb-4">Resumo Financeiro</h3>
                  <p className="opacity-70 mb-8">Fluxo de caixa previsto para o próximo mês.</p>
                  <div className="text-5xl font-bold mb-2">R$ 12.450</div>
                  <div className="text-green-400 font-medium mb-8 flex items-center gap-2"><ArrowUpRight size={18} /> +18% este mês</div>
                  <button className="w-full py-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors font-bold">Relatório Completo</button>
                </div>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="bg-white max-w-2xl mx-auto p-8 rounded-3xl shadow-sm border border-slate-100 animate-fadeIn">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Settings className="text-slate-400" /> Configurações do Admin</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Agência</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl" defaultValue="NexusHub Agency" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-800">Notificações por Email</p>
                      <p className="text-xs text-slate-500">Receber alertas de novos clientes</p>
                    </div>
                    <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                  </div>
                  <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800">
                    <Save size={18} /> Salvar Alterações
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      {isModalOpen && renderNewClientModal()}
    </div>
  );
};