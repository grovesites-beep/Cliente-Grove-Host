
-- Tabela de Clientes
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  company text,
  email text unique not null,
  site_url text,
  site_type text,
  hosting_expiry text,
  maintenance_mode boolean default false
);

-- Tabela de Analytics (Simples)
create table public.client_analytics (
  client_id uuid references public.clients(id) on delete cascade not null,
  visits_data jsonb, -- Armazena array de números [120, 140, ...]
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (client_id)
);

-- Tabela de Posts do Blog
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  title text not null,
  status text check (status in ('draft', 'published', 'scheduled')),
  date text,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Integrações
create table public.integrations (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  name text not null,
  icon text,
  status text check (status in ('connected', 'disconnected', 'pending')),
  last_sync text
);

-- Habilitar RLS (Row Level Security)
alter table public.clients enable row level security;
alter table public.client_analytics enable row level security;
alter table public.posts enable row level security;
alter table public.integrations enable row level security;

-- Políticas de Segurança (Simplificado para Demo: Acesso total se tiver a chave anon, 
-- mas idealmente deve ser restrito por UID do Auth)

-- Permitir leitura pública (para simplificar o login de demonstração)
-- Em produção real, você restringiria isso para auth.uid()
create policy "Enable read access for all users" on public.clients for select using (true);
create policy "Enable insert for all users" on public.clients for insert with check (true);
create policy "Enable update for all users" on public.clients for update using (true);

create policy "Enable read access for all users" on public.client_analytics for select using (true);
create policy "Enable insert for all users" on public.client_analytics for insert with check (true);
create policy "Enable update for all users" on public.client_analytics for update using (true);

create policy "Enable read access for all users" on public.posts for select using (true);
create policy "Enable insert for all users" on public.posts for insert with check (true);

create policy "Enable read access for all users" on public.integrations for select using (true);
create policy "Enable insert for all users" on public.integrations for insert with check (true);
create policy "Enable update for all users" on public.integrations for update using (true);

-- Inserir Dados Mockados Iniciais (Opcional, para não começar vazio)
insert into public.clients (name, company, email, site_url, site_type, hosting_expiry, maintenance_mode)
values 
('Alice Johnson', 'Bloom Boutique', 'alice@bloom.com', 'bloomboutique.com.br', 'E-commerce', '15/12/2024', false),
('Marcos Silva', 'TechFlow Soluções', 'marcos@techflow.io', 'techflow.io', 'Landing Page', '20/01/2025', false);
