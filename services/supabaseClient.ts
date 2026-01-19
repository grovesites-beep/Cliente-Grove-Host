
import { createClient } from '@supabase/supabase-js';
import { ClientData, BlogPost, Integration, UserRole, SiteType, ContractCycle } from '../types';

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
      products (*),
      contracts (*),
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
        phone: client.phone,
        responsiblePerson: client.responsible_person,
        notes: client.notes,
        address: client.address,
        passwordVault: client.password_vault || [],
        siteUrl: client.site_url,
        siteType: client.site_type as SiteType,
        hostingExpiry: client.hosting_expiry,
        maintenanceMode: client.maintenance_mode,
        visits: client.client_analytics?.[0]?.visits_data || [0, 0, 0, 0, 0, 0, 0],
        posts: client.posts?.map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            date: p.date,
            content: p.content
        })) || [],
        integrations: client.integrations?.map((i: any) => ({
            id: i.id,
            name: i.name,
            icon: i.icon,
            status: i.status,
            lastSync: i.last_sync
        })) || [],
        products: client.products?.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            active: p.active,
            cycle: p.cycle,
            startDate: p.start_date,
            endDate: p.end_date
        })) || [],
        contracts: client.contracts?.map((c: any) => ({
            id: c.id,
            title: c.title,
            startDate: c.start_date,
            endDate: c.end_date,
            value: c.value,
            status: c.status,
            cycle: c.cycle,
            fileUrl: c.file_url
        })) || []
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
      products (*),
      contracts (*),
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
        phone: client.phone,
        responsiblePerson: client.responsible_person,
        notes: client.notes,
        address: client.address,
        passwordVault: client.password_vault || [],
        siteUrl: client.site_url,
        siteType: client.site_type as SiteType,
        hostingExpiry: client.hosting_expiry,
        maintenanceMode: client.maintenance_mode,
        visits: client.client_analytics?.[0]?.visits_data || [0, 0, 0, 0, 0, 0, 0],
        posts: client.posts?.map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            date: p.date,
            content: p.content
        })) || [],
        integrations: client.integrations?.map((i: any) => ({
            id: i.id,
            name: i.name,
            icon: i.icon,
            status: i.status,
            lastSync: i.last_sync
        })) || [],
        products: client.products?.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            active: p.active,
            cycle: p.cycle,
            startDate: p.start_date,
            endDate: p.end_date
        })) || [],
        contracts: client.contracts?.map((c: any) => ({
            id: c.id,
            title: c.title,
            startDate: c.start_date,
            endDate: c.end_date,
            value: c.value,
            status: c.status,
            cycle: c.cycle,
            fileUrl: c.file_url
        })) || []
    };
};

export const createClientInDb = async (client: Partial<ClientData>) => {
    // 1. Inserir Cliente com todos os campos básicos e novos
    const { data, error } = await supabase
        .from('clients')
        .insert({
            name: client.name,
            company: client.company,
            email: client.email,
            phone: client.phone,
            responsible_person: client.responsiblePerson,
            notes: client.notes,
            address: client.address,
            password_vault: client.passwordVault,
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
        visits_data: client.visits || [0, 0, 0, 0, 0, 0, 0]
    });

    // 3. Inicializar Integrações Padrão
    const defaultIntegrations = [
        { client_id: data.id, name: 'Google Analytics 4', icon: 'https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg', status: 'disconnected' },
        { client_id: data.id, name: 'WordPress', icon: 'https://s.w.org/style/images/about/WordPress-logotype-wmark.png', status: 'disconnected' }
    ];
    await supabase.from('integrations').insert(defaultIntegrations);

    // 4. Inserir Produtos Iniciais (se houver)
    if (client.products && client.products.length > 0) {
        const prodData = client.products.map(p => ({
            client_id: data.id,
            name: p.name,
            description: p.description,
            price: p.price,
            active: p.active,
            cycle: p.cycle,
            start_date: p.startDate,
            end_date: p.endDate
        }));
        await supabase.from('products').insert(prodData);
    }

    return data.id;
};

/**
 * Update an existing client in Supabase
 */
export const updateClientInDb = async (clientId: string, updates: Partial<ClientData>) => {
    const dbUpdates: any = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.company !== undefined) dbUpdates.company = updates.company;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.responsiblePerson !== undefined) dbUpdates.responsible_person = updates.responsiblePerson;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.passwordVault !== undefined) dbUpdates.password_vault = updates.passwordVault;
    if (updates.siteUrl !== undefined) dbUpdates.site_url = updates.siteUrl;
    if (updates.siteType !== undefined) dbUpdates.site_type = updates.siteType;
    if (updates.hostingExpiry !== undefined) dbUpdates.hosting_expiry = updates.hostingExpiry;
    if (updates.maintenanceMode !== undefined) dbUpdates.maintenance_mode = updates.maintenanceMode;

    const { data, error } = await supabase
        .from('clients')
        .update(dbUpdates)
        .eq('id', clientId)
        .select()
        .single();

    if (error) throw error;

    // Handle products/contracts sub-updates if needed
    // In many cases, we manage these via separate flows, but let's ensure they are updated if provided
    if (updates.products) {
        // Simple strategy: delete and re-insert for products owned by client
        await supabase.from('products').delete().eq('client_id', clientId);
        const prodData = updates.products.map(p => ({
            client_id: clientId,
            name: p.name,
            description: p.description,
            price: p.price,
            active: p.active,
            cycle: p.cycle,
            start_date: p.startDate,
            end_date: p.endDate
        }));
        if (prodData.length > 0) await supabase.from('products').insert(prodData);
    }

    if (updates.contracts) {
        await supabase.from('contracts').delete().eq('client_id', clientId);
        const contData = updates.contracts.map(c => ({
            client_id: clientId,
            title: c.title,
            start_date: c.startDate,
            end_date: c.endDate,
            value: c.value,
            status: c.status,
            cycle: c.cycle,
            file_url: c.fileUrl
        }));
        if (contData.length > 0) await supabase.from('contracts').insert(contData);
    }

    return data;
};

/**
 * Update the status of an integration in Supabase
 */
export const updateIntegrationStatus = async (integrationId: string, status: 'connected' | 'disconnected', lastSync?: string) => {
    const { data, error } = await supabase
        .from('integrations')
        .update({ status, last_sync: lastSync || new Date().toISOString() })
        .eq('id', integrationId)
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


// --- Função de Seed (Povoar Banco) ---
export const seedDatabase = async () => {
    // Dados Iniciais de Teste
    const seeds = [
        {
            name: 'Alice Johnson',
            company: 'Bloom Boutique',
            email: 'alice@bloom.com',
            phone: '(11) 98765-4321',
            responsiblePerson: 'Alice J.',
            siteUrl: 'bloomboutique.com.br',
            siteType: SiteType.ECOMMERCE,
            hostingExpiry: '2024-12-15',
            maintenanceMode: false,
            notes: 'Cliente VIP desde o início.',
            address: { street: 'Av. Paulista', number: '1000', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', zipCode: '01310-100' },
            visits: [420, 545, 632, 790, 810, 980, 1250],
            posts: [
                { title: 'Coleção de Verão 2026', status: 'published', date: '2026-01-10', content: 'Lançamento exclusivo...' },
                { title: 'Moda Sustentável', status: 'draft', date: '2026-01-15', content: 'Rascunho...' }
            ],
            products: [
                { name: 'Manutenção E-commerce Plus', description: 'Suporte 24/7 e updates', price: 1200, active: true, cycle: ContractCycle.MONTHLY, startDate: '2026-01-01' },
                { name: 'Hospedagem Dedicada', description: 'Servidor otimizado', price: 300, active: true, cycle: ContractCycle.MONTHLY, startDate: '2026-01-01' }
            ],
            contracts: [
                { title: 'Contrato de Manutenção 2026', startDate: '2026-01-01', endDate: '2026-12-31', value: 14400, status: 'active', cycle: ContractCycle.ANNUAL }
            ],
            integrations: [
                { name: 'Google Analytics 4', status: 'connected', lastSync: '10 min atrás' },
                { name: 'Meta Pixel', status: 'connected', lastSync: '1 hora atrás' }
            ]
        },
        {
            name: 'Marcos Silva',
            company: 'TechFlow Soluções',
            email: 'marcos@techflow.io',
            phone: '(21) 91234-5678',
            responsiblePerson: 'Marcos S.',
            siteUrl: 'techflow.io',
            siteType: SiteType.LANDING_PAGE,
            hostingExpiry: '2025-01-20',
            maintenanceMode: false,
            visits: [40, 35, 60, 80, 75, 90, 110],
            products: [
                { name: 'Gestão de Tráfego', description: 'Google e Meta Ads', price: 2500, active: true, cycle: ContractCycle.MONTHLY, startDate: '2026-01-01' }
            ],
            posts: [],
            integrations: [
                { name: 'Google Analytics 4', status: 'pending', lastSync: null }
            ]
        },
        {
            name: 'Sara Lima',
            company: 'Arquitetura Urbana',
            email: 'sara@urbanarch.net',
            phone: '(31) 99988-7766',
            responsiblePerson: 'Sara L.',
            siteUrl: 'urbanarch.net',
            siteType: SiteType.INSTITUTIONAL,
            hostingExpiry: '2024-11-05',
            maintenanceMode: true,
            visits: [300, 280, 310, 290, 320, 310, 340],
            products: [
                { name: 'Manutenção Institucional', description: 'Atualizações mensais', price: 800, active: true, cycle: ContractCycle.MONTHLY, startDate: '2026-01-01' }
            ],
            posts: [
                { title: 'Arquitetura em 2026', status: 'published', date: '2025-09-15', content: 'Tendências...' }
            ],
            integrations: [
                { name: 'Google Analytics 4', status: 'connected', lastSync: null },
                { name: 'HubSpot CRM', status: 'connected', lastSync: '1 dia atrás' }
            ]
        }
    ];

    for (const seed of seeds) {
        // Verifica se já existe
        const { data: existing } = await supabase.from('clients').select('id').eq('email', seed.email).single();
        if (existing) continue;

        // Cria Cliente Base com novos campos
        const clientId = await createClientInDb({
            name: seed.name,
            company: seed.company,
            email: seed.email,
            phone: seed.phone,
            responsiblePerson: seed.responsiblePerson,
            notes: seed.notes,
            address: seed.address,
            siteUrl: seed.siteUrl,
            siteType: seed.siteType,
            hostingExpiry: seed.hostingExpiry,
            maintenanceMode: seed.maintenanceMode,
            visits: seed.visits,
            products: seed.products as any[]
        });

        // Insere Posts
        if (seed.posts.length > 0) {
            const postsToInsert = seed.posts.map(p => ({
                client_id: clientId,
                title: p.title,
                status: p.status,
                date: p.date,
                content: p.content
            }));
            await supabase.from('posts').insert(postsToInsert);
        }

        // Insere Contratos
        if (seed.contracts && seed.contracts.length > 0) {
            const contractsToInsert = seed.contracts.map(c => ({
                client_id: clientId,
                title: c.title,
                start_date: c.startDate,
                end_date: c.endDate,
                value: c.value,
                status: c.status,
                cycle: c.cycle
            }));
            await supabase.from('contracts').insert(contractsToInsert);
        }

        // Atualiza Integrações
        await supabase.from('integrations').delete().eq('client_id', clientId);
        const integrationsToInsert = seed.integrations.map(i => ({
            client_id: clientId,
            name: i.name,
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
