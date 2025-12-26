
export enum Repeatability {
  NONE = 'Nessuna',
  DAILY = 'Giornaliera',
  WEEKLY = 'Settimanale',
  MONTHLY = 'Mensile',
  BIMONTHLY = 'Bimestrale',
  SEMIANNUAL = 'Semestrale',
  YEARLY = 'Annuale'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'Banca' | 'Contanti' | 'Carta' | 'Altro';
  color: string;
  linkedCardName?: string;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  accountId: string;
  date: string; // ISO format: YYYY-MM-DD
  notes: string;
  repeatability: Repeatability;
  isRecurringSource?: boolean;
  parentExpenseId?: string;
  lastProcessedDate?: string;
  usedLinkedCard?: boolean;
}

export interface Income {
  id: string;
  amount: number;
  accountId: string;
  date: string;
  notes: string;
}

export type ViewType = 'list' | 'dashboard' | 'categories' | 'accounts' | 'settings' | 'export' | 'monthly_reports' | 'auth' | 'profile' | 'security';
