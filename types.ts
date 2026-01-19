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

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

export interface Contract {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  value: number;
  status: 'active' | 'expired' | 'pending';
  fileUrl?: string;
}

export interface PasswordVaultItem {
  id: string;
  service: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export interface ClientData {
  id: string;
  // Basic Info
  name: string;
  company: string;
  email: string;
  phone?: string;
  avatar?: string;

  // Responsible Person
  responsiblePerson?: string;

  // Address
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };

  // Website
  siteUrl: string;
  siteType: SiteType;
  hostingExpiry: string;
  maintenanceMode: boolean;

  // Access
  password?: string; // For client portal login

  // Notes
  notes?: string;

  // Relations
  integrations: Integration[];
  posts: BlogPost[];
  products?: Product[];
  contracts?: Contract[];
  passwordVault?: PasswordVaultItem[];

  // Analytics
  visits: number[];

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateBlogParams {
  topic: string;
  tone: string;
  keywords: string;
}