
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

    return data;
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
