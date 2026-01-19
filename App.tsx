import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientPortal } from './components/ClientPortal';
import { AuthPages } from './components/AuthPages';
import { ClientData, UserRole, SiteType } from './types';
import { ArrowLeft } from 'lucide-react';
import { fetchClients, createClientInDb, fetchClientByEmail, seedDatabase } from './services/supabaseClient';

type AuthState = 'unauthenticated' | 'authenticated';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('unauthenticated');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // O cliente selecionado pode ser o próprio usuário logado (se for CLIENTE)
  // ou um cliente que o Admin está visualizando (Impersonation)
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  // Flag para saber se é um admin visualizando como cliente
  const [isImpersonating, setIsImpersonating] = useState(false);

  // Carregar dados iniciais do Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      const data = await fetchClients();
      if (data) {
        setClients(data);
      }
      setIsLoadingData(false);
    };
    loadData();
  }, []); // Executa apenas na montagem

  // --- Handlers de Autenticação ---

  const handleAdminLogin = () => {
    setAuthState('authenticated');
    setCurrentUserRole(UserRole.ADMIN);
    setIsImpersonating(false);
    // Recarrega clientes ao logar como admin para garantir dados frescos
    fetchClients().then(setClients);
  };

  const handleClientLogin = async (email: string) => {
    setIsLoadingData(true);
    // Busca o cliente real no banco de dados
    const client = await fetchClientByEmail(email);

    if (client) {
      setAuthState('authenticated');
      setCurrentUserRole(UserRole.CLIENT);
      setSelectedClient(client);
      setIsImpersonating(false);
    } else {
      alert('Cliente não encontrado. Verifique o e-mail ou contate o suporte.');
    }
    setIsLoadingData(false);
  };

  const handleLogout = () => {
    setAuthState('unauthenticated');
    setCurrentUserRole(null);
    setSelectedClient(null);
    setIsImpersonating(false);
  };

  // --- Handlers de Dados ---

  const createNewClient = async (newClientData: Omit<ClientData, 'id'>) => {
    try {
      // Salva no Supabase
      await createClientInDb(newClientData);

      // Atualiza a lista local
      const updatedList = await fetchClients();
      setClients(updatedList);
      alert('Cliente cadastrado com sucesso!');
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      alert('Erro ao salvar no banco de dados.');
    }
  };

  const handleSeedDatabase = async () => {
    if (confirm('Deseja popular o banco de dados com dados de teste?')) {
      setIsLoadingData(true);
      await seedDatabase();
      const updated = await fetchClients();
      setClients(updated);
      setIsLoadingData(false);
      alert('Banco de dados povoado!');
    }
  };

  const handleUpdateClient = (updatedClient: ClientData) => {
    // A atualização real no DB deve ser feita nos componentes filhos (ClientPortal) 
    // ou implementada aqui. Por enquanto, atualizamos o estado local para refletir na UI.
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
        onAddClient={createNewClient}
        onLogout={handleLogout}
      />
    );
  }

  return <div>Erro de Estado</div>;
};

export default App;