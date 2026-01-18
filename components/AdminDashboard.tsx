import React, { useState } from 'react';
import { ClientData } from '../types';
import { 
  Users, LayoutDashboard, Settings, LogOut, Search, Bell, 
  Menu, ChevronRight, DollarSign, Briefcase, Plus, MoreVertical, ExternalLink 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface AdminDashboardProps {
  clients: ClientData[];
  onSelectClient: (client: ClientData) => void;
  onSwitchToClientView: (client: ClientData) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ clients, onSelectClient, onSwitchToClientView, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'finance'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group ${
        activeTab === id 
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
          value="14" 
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
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Meus Clientes</h2>
            <p className="text-slate-500">Gerencie acessos e visualize os projetos.</p>
         </div>
         <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
            <Plus size={18} /> Novo Cliente
         </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input type="text" placeholder="Buscar por nome ou empresa..." className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                   <th className="px-6 py-4">Cliente</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Tipo de Site</th>
                   <th className="px-6 py-4">Hospedagem</th>
                   <th className="px-6 py-4 text-right">Ações</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 text-sm">
                {clients.map(client => (
                   <tr key={client.id} className="hover:bg-slate-50 group transition-colors">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                               {client.name.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-slate-800">{client.name}</p>
                               <p className="text-slate-400 text-xs">{client.company}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 ${
                            client.maintenanceMode ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                         }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${client.maintenanceMode ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                            {client.maintenanceMode ? 'Manutenção' : 'Ativo'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{client.siteType}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{client.hostingExpiry}</td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button 
                               onClick={() => onSwitchToClientView(client)}
                               className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                            >
                               Acessar Portal
                            </button>
                            <a href={`https://${client.siteUrl}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                               <ExternalLink size={16} />
                            </a>
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

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden font-sans">
       {/* Sidebar Overlay */}
       {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
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
                  <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-white rounded-3xl border border-slate-100">
                     <DollarSign size={48} className="mb-4 opacity-20" />
                     <h3 className="text-lg font-bold text-slate-600">Módulo Financeiro</h3>
                     <p>Em desenvolvimento.</p>
                  </div>
               )}
            </div>
         </main>
      </div>
    </div>
  );
};