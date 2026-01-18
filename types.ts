export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT'
}

export enum SiteType {
  INSTITUTIONAL = 'Institucional',
  LANDING_PAGE = 'Landing Page',
  ECOMMERCE = 'E-commerce'
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'pending';
  lastSync?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'scheduled';
  date: string;
  content?: string;
}

export interface ClientData {
  id: string;
  name: string;
  company: string;
  email: string;
  siteUrl: string;
  siteType: SiteType;
  hostingExpiry: string;
  maintenanceMode: boolean;
  integrations: Integration[];
  posts: BlogPost[];
  visits: number[]; // Simple analytics data
}

export interface GenerateBlogParams {
  topic: string;
  tone: string;
  keywords: string;
}