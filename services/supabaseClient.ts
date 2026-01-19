
import { createClient } from '@supabase/supabase-js';
import { ClientData, BlogPost, Integration, UserRole, SiteType } from '../types';

// Tipos para o Banco de Dados (mapeamento das tabelas do Supabase)
export type Database = {
    public: {
        Tables: {
            clients: {
                Row: {
                    id: string;
                    created_at: string;
                    name: string;
                    company: string;
                    email: string;
                    site_url: string;
                    site_type: string;
                    hosting_expiry: string;
                    maintenance_mode: boolean;
                };
                Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['clients']['Insert']>;
            };
            client_analytics: { // Tabela para armazenar as visitas (array simplificado no JSONB ou tabela relacional)
                Row: {
                    client_id: string;
                    visits_data: number[]; // Armazenando como array JSON por simplicidade na migração do mock
                    updated_at: string;
                };
                Insert: { client_id: string; visits_data: number[] };
                Update: { visits_data: number[] };
            };
            posts: {
                Row: {
                    id: string;
                    client_id: string;
                    title: string;
                    status: string;
                    date: string;
                    content: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['posts']['Insert']>;
            };
            integrations: {
                Row: {
                    id: string;
                    client_id: string;
                    name: string;
                    icon: string;
                    status: string;
                    last_sync: string | null;
                };
                Insert: Omit<Database['public']['Tables']['integrations']['Row'], 'id'>;
                Update: Partial<Database['public']['Tables']['integrations']['Insert']>;
            };
        };
    };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Faltam variáveis de ambiente do Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// --- Funções Auxiliares de Serviço ---

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
};

export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

// Busca o Role do usuário na tabela profiles
export const getUserRole = async (userId: string): Promise<'admin' | 'client' | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (error || !data) return null;
    return data.role as 'admin' | 'client';
};

// Busca todos os clientes (Admin)
export const fetchClients = async (): Promise<ClientData[]> => {
    const { data: clientsData, error } = await supabase
        .from('clients')
        .select(`
      *,
      posts (*),
      integrations (*),
      client_analytics (visits_data)
    `);

    if (error) {
        console.error('Erro ao buscar clientes:', error);
        return [];
    }

    // Mapear dados do DB para o tipo ClientData da aplicação
    return clientsData.map((client: any) => ({
        id: client.id,
        name: client.name,
        company: client.company,
        email: client.email,
        siteUrl: client.site_url,
        siteType: client.site_type as SiteType,
        hostingExpiry: client.hosting_expiry,
        maintenanceMode: client.maintenance_mode,
        visits: client.client_analytics?.[0]?.visits_data || [],
        posts: client.posts.map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            date: p.date,
            content: p.content
        })),
        integrations: client.integrations.map((i: any) => ({
            id: i.id,
            name: i.name,
            icon: i.icon,
            status: i.status,
            lastSync: i.last_sync
        }))
    }));
};

// Busca um único cliente pelo Email (Login de Cliente)
export const fetchClientByEmail = async (email: string): Promise<ClientData | null> => {
    const { data: client, error } = await supabase
        .from('clients')
        .select(`
      *,
      posts (*),
      integrations (*),
      client_analytics (visits_data)
    `)
        .eq('email', email)
        .single();

    if (error || !client) {
        return null;
    }

    return {
        id: client.id,
        name: client.name,
        company: client.company,
        email: client.email,
        siteUrl: client.site_url,
        siteType: client.site_type as SiteType,
        hostingExpiry: client.hosting_expiry,
        maintenanceMode: client.maintenance_mode,
        visits: client.client_analytics?.[0]?.visits_data || [],
        posts: client.posts.map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            date: p.date,
            content: p.content
        })),
        integrations: client.integrations.map((i: any) => ({
            id: i.id,
            name: i.name,
            icon: i.icon,
            status: i.status,
            lastSync: i.last_sync
        }))
    };
};

export const createClientInDb = async (client: Omit<ClientData, 'id' | 'visits' | 'posts' | 'integrations'>) => {
    // 1. Inserir Cliente
    const { data, error } = await supabase
        .from('clients')
        .insert({
            name: client.name,
            company: client.company,
            email: client.email,
            site_url: client.siteUrl,
            site_type: client.siteType,
            hosting_expiry: client.hostingExpiry,
            maintenance_mode: client.maintenanceMode
        })
        .select()
        .single();

    if (error) throw error;

    // 2. Inicializar Analytics Vazio
    await supabase.from('client_analytics').insert({
        client_id: data.id,
        visits_data: [0, 0, 0, 0, 0, 0, 0] // Inicializa com zeros
    });

    // 3. Inicializar Integrações Padrão
    const defaultIntegrations = [
        { client_id: data.id, name: 'Google Analytics 4', icon: 'https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg', status: 'disconnected' },
        { client_id: data.id, name: 'WordPress', icon: 'https://s.w.org/style/images/about/WordPress-logotype-wmark.png', status: 'disconnected' }
    ];
    await supabase.from('integrations').insert(defaultIntegrations);

    return data.id;
};

/**
 * Update an existing client in Supabase
 */
export const updateClientInDb = async (clientId: string, updates: Partial<ClientData>) => {
    const dbUpdates: any = {};

    if (updates.name) dbUpdates.name = updates.name;
    if (updates.company) dbUpdates.company = updates.company;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.siteUrl) dbUpdates.site_url = updates.siteUrl;
    if (updates.siteType) dbUpdates.site_type = updates.siteType;
    if (updates.hostingExpiry) dbUpdates.hosting_expiry = updates.hostingExpiry;
    if (updates.maintenanceMode !== undefined) dbUpdates.maintenance_mode = updates.maintenanceMode;

    const { data, error } = await supabase
        .from('clients')
        .update(dbUpdates)
        .eq('id', clientId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Delete a client and all related data from Supabase
 */
export const deleteClientFromDb = async (clientId: string) => {
    // Delete in order: posts, integrations, analytics, then client
    // (Assuming CASCADE is not set up, we delete manually)

    // 1. Delete posts
    await supabase.from('posts').delete().eq('client_id', clientId);

    // 2. Delete integrations
    await supabase.from('integrations').delete().eq('client_id', clientId);

    // 3. Delete analytics
    await supabase.from('client_analytics').delete().eq('client_id', clientId);

    // 4. Delete client
    const { error } = await supabase.from('clients').delete().eq('id', clientId);

    if (error) throw error;
    return true;
};

export const updateClientPost = async (clientId: string, post: BlogPost) => {
    // Se o ID for numérico novo (Date.now()), é um insert. Se for UUID, é update.
    // Para simplificar, vamos assumir que ids numéricos grandes são novos inserts locais não persistidos

    // Na verdade, a abstração deve ser: Salvar Post
    const { data, error } = await supabase
        .from('posts')
        .insert({
            client_id: clientId,
            title: post.title,
            status: post.status,
            date: post.date,
            content: post.content
        })
        .select()
        .single();

    return { data, error };
};

export const updateIntegrationStatus = async (integrationId: string, status: string, lastSync: string) => {
    return await supabase
        .from('integrations')
        .update({ status, last_sync: lastSync })
        .eq('id', integrationId);
};

// --- Função de Seed (Povoar Banco) ---
export const seedDatabase = async () => {
    // Dados Iniciais de Teste
    const seeds = [
        {
            name: 'Alice Johnson',
            company: 'Bloom Boutique',
            email: 'alice@bloom.com',
            siteUrl: 'bloomboutique.com.br',
            siteType: SiteType.ECOMMERCE,
            hostingExpiry: '15/12/2024',
            maintenanceMode: false,
            visits: [120, 145, 132, 190, 210, 180, 250],
            posts: [
                { title: 'Prévia da Coleção de Verão', status: 'published', date: '01/10/2023', content: 'Conteúdo de teste...' },
                { title: 'Dicas de Moda Sustentável', status: 'draft', date: '05/10/2023', content: 'Rascunho...' }
            ],
            integrations: [
                { name: 'Google Analytics 4', status: 'connected', lastSync: '10 min atrás' },
                { name: 'Meta Pixel', status: 'connected', lastSync: '1 hora atrás' },
                { name: 'Mailchimp', status: 'disconnected', lastSync: null },
                { name: 'WordPress', status: 'disconnected', lastSync: null }
            ]
        },
        {
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
                { name: 'Google Analytics 4', status: 'pending', lastSync: null }
            ]
        },
        {
            name: 'Sara Lima',
            company: 'Arquitetura Urbana',
            email: 'sara@urbanarch.net',
            siteUrl: 'urbanarch.net',
            siteType: SiteType.INSTITUTIONAL,
            hostingExpiry: '05/11/2024',
            maintenanceMode: true,
            visits: [300, 280, 310, 290, 320, 310, 340],
            posts: [
                { title: 'Brutalismo Moderno em 2024', status: 'published', date: '15/09/2023', content: 'Texto sobre arquitetura...' }
            ],
            integrations: [
                { name: 'Google Analytics 4', status: 'connected', lastSync: null },
                { name: 'HubSpot CRM', status: 'connected', lastSync: '1 dia atrás' }
            ]
        }
    ];

    for (const seed of seeds) {
        // Verifica se já existe
        const existing = await fetchClientByEmail(seed.email);
        if (existing) continue;

        // Cria Cliente Base (já cria integrações padrão e analytics zerado)
        const newClient = await createClientInDb({
            name: seed.name,
            company: seed.company,
            email: seed.email,
            siteUrl: seed.siteUrl,
            siteType: seed.siteType,
            hostingExpiry: seed.hostingExpiry,
            maintenanceMode: seed.maintenanceMode
        });

        // Atualiza Analytics
        await supabase
            .from('client_analytics')
            .update({ visits_data: seed.visits })
            .eq('client_id', newClient.id);

        // Insere Posts
        if (seed.posts.length > 0) {
            const postsToInsert = seed.posts.map(p => ({
                client_id: newClient.id,
                title: p.title,
                status: p.status,
                date: p.date,
                content: p.content
            }));
            await supabase.from('posts').insert(postsToInsert);
        }

        // Atualiza/Insere Integrações Extras
        // Observação: createClientInDb cria GA4 e WordPress por padrão.
        // Vamos limpar e recriar as integrações para bater com o seed exato, ou atualizar.
        // Simplificação: vamos apagar as padrões e inserir as do seed.
        await supabase.from('integrations').delete().eq('client_id', newClient.id);

        const integrationsToInsert = seed.integrations.map(i => ({
            client_id: newClient.id,
            name: i.name,
            // icon: ... vamos simplificar, o frontend já tem ícones mockados se vier vazio? 
            // O createClientInDb tinha URLs de icon. Vamos pegar de lá ou hardcoded aqui para o seed ficar bonito.
            icon: HelperGetIconUrl(i.name),
            status: i.status,
            last_sync: i.lastSync
        }));

        await supabase.from('integrations').insert(integrationsToInsert);
    }
};

const HelperGetIconUrl = (name: string) => {
    if (name.includes('Google')) return 'https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg';
    if (name.includes('Meta') || name.includes('Facebook')) return 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Facebook_Logo_2023.png';
    if (name.includes('Mailchimp')) return 'https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon-5.svg';
    if (name.includes('WordPress')) return 'https://s.w.org/style/images/about/WordPress-logotype-wmark.png';
    if (name.includes('HubSpot')) return 'https://cdn.worldvectorlogo.com/logos/hubspot-1.svg';
    return '';
};
