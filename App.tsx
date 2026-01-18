import React, { useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientPortal } from './components/ClientPortal';
import { AuthPages } from './components/AuthPages';
import { ClientData, UserRole, SiteType } from './types';
import { ArrowLeft } from 'lucide-react';

// Mock Data Initialization
const MOCK_CLIENTS: ClientData[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    company: 'Bloom Boutique',
    email: 'alice@bloom.com',
    siteUrl: 'bloomboutique.com.br',
    siteType: SiteType.ECOMMERCE,
    hostingExpiry: '15/12/2024',
    maintenanceMode: false,
    visits: [120, 145, 132, 190, 210, 180, 250],
    posts: [
      { id: '101', title: 'Prévia da Coleção de Verão', status: 'published', date: '01/10/2023' },
      { id: '102', title: 'Dicas de Moda Sustentável', status: 'draft', date: '05/10/2023' }
    ],
    integrations: [
      { id: 'i1', name: 'Google Analytics 4', icon: 'https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg', status: 'connected', lastSync: '10 min atrás' },
      { id: 'i2', name: 'Meta Pixel', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Facebook_Logo_2023.png', status: 'connected', lastSync: '1 hora atrás' },
      { id: 'i3', name: 'Mailchimp', icon: 'https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon-5.svg', status: 'disconnected' }
    ]
  },
  {
    id: '2',
    name: 'Marcos Silva',
    company: 'TechFlow Soluções',
    email: 'marcos@techflow.io',
    siteUrl: 'techflow.io',
    siteType: SiteType.LANDING_PAGE,
    hostingExpiry: '20/01/2025',
    maintenanceMode: false,
    visits: [40, 35, 60, 80, 75, 90, 110],
    posts: [],
    integrations: [
       { id: 'i1', name: 'Google Analytics 4', icon: 'https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg', status: 'pending' }
    ]
  },
  {
    id: '3',
    name: 'Sara Lima',
    company: 'Arquitetura Urbana',
    email: 'sara@urbanarch.net',
    siteUrl: 'urbanarch.net',
    siteType: SiteType.INSTITUTIONAL,
    hostingExpiry: '05/11/2024',
    maintenanceMode: true,
    visits: [300, 280, 310, 290, 320, 310, 340],
    posts: [
        { id: '301', title: 'Brutalismo Moderno em 2024', status: 'published', date: '15/09/2023' }
    ],
    integrations: [
        { id: 'i1', name: 'Google Analytics 4', icon: 'https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg', status: 'connected' },
        { id: 'i2', name: 'HubSpot CRM', icon: 'https://cdn.worldvectorlogo.com/logos/hubspot-1.svg', status: 'connected', lastSync: '1 dia atrás' }
    ]
  }
];

type AuthState = 'unauthenticated' | 'authenticated';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('unauthenticated');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [clients, setClients] = useState<ClientData[]>(MOCK_CLIENTS);
  
  // O cliente selecionado pode ser o próprio usuário logado (se for CLIENTE)
  // ou um cliente que o Admin está visualizando (Impersonation)
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  
  // Flag para saber se é um admin visualizando como cliente
  const [isImpersonating, setIsImpersonating] = useState(false);

  // --- Handlers de Autenticação ---

  const handleAdminLogin = () => {
    setAuthState('authenticated');
    setCurrentUserRole(UserRole.ADMIN);
    setIsImpersonating(false);
  };

  const handleClientLogin = (email: string) => {
    // Procura o cliente pelo email (Simulação simples)
    // Se o campo estiver vazio na demo, pega o primeiro
    const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase()) || clients[0];
    
    setAuthState('authenticated');
    setCurrentUserRole(UserRole.CLIENT);
    setSelectedClient(client);
    setIsImpersonating(false);
  };

  const handleLogout = () => {
    setAuthState('unauthenticated');
    setCurrentUserRole(null);
    setSelectedClient(null);
    setIsImpersonating(false);
  };

  // --- Handlers de Dados ---

  const handleUpdateClient = (updatedClient: ClientData) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setSelectedClient(updatedClient);
  };

  // Admin clica em "Acessar Portal"
  const switchToClientView = (client: ClientData) => {
    setSelectedClient(client);
    setIsImpersonating(true);
  };

  const backToAdminDashboard = () => {
    setIsImpersonating(false);
    setSelectedClient(null);
  };

  // --- Render Logic ---

  if (authState === 'unauthenticated') {
    return (
      <AuthPages 
        onLoginAdmin={handleAdminLogin}
        onLoginClient={handleClientLogin}
      />
    );
  }

  // Se for CLIENTE logado
  if (currentUserRole === UserRole.CLIENT && selectedClient) {
    return (
      <div className="relative">
         <div className="fixed bottom-4 left-4 z-[100]">
            <button 
              onClick={handleLogout}
              className="bg-white/90 backdrop-blur border border-slate-200 text-slate-500 px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-100 hover:text-red-500 transition-colors shadow-lg"
            >
              Sair
            </button>
         </div>
         <ClientPortal 
            client={selectedClient} 
            onUpdateClient={handleUpdateClient}
          />
      </div>
    );
  }

  // Se for ADMIN
  if (currentUserRole === UserRole.ADMIN) {
    if (isImpersonating && selectedClient) {
      // Modo de Impersonação (Admin vendo visão do cliente)
      return (
        <div className="relative font-sans text-slate-900 bg-slate-50 min-h-screen">
          <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2 animate-fadeIn">
            <div className="bg-slate-900 text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700">
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                 <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Modo Cliente</span>
               </div>
               <div className="h-4 w-px bg-slate-700"></div>
               <span className="font-medium text-sm">{selectedClient?.company}</span>
               <button 
                onClick={backToAdminDashboard}
                className="ml-2 bg-white text-slate-900 px-3 py-1 rounded-full text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={12} /> Sair
              </button>
            </div>
          </div>
          <ClientPortal 
            client={selectedClient} 
            onUpdateClient={handleUpdateClient}
          />
        </div>
      );
    }

    // Dashboard Padrão do Admin
    return (
      <AdminDashboard 
        clients={clients} 
        onSelectClient={setSelectedClient}
        onSwitchToClientView={switchToClientView}
        onLogout={handleLogout}
      />
    );
  }

  return <div>Erro de Estado</div>;
};

export default App;