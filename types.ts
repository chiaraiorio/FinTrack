
export enum Repeatability {
  NONE = 'Nessuna',
  DAILY = 'Giornaliera',
  WEEKLY = 'Settimanale',
  MONTHLY = 'Mensile',
  BIMONTHLY = 'Bimestrale',
  SEMIANNUAL = 'Semestrale',
  YEARLY = 'Annuale'
}

export type Language = 'it' | 'en';
export type TextSize = 'small' | 'medium' | 'large';

export interface AppSettings {
  monthlyBudget: number;
  firstDayOfMonth: number;
  defaultAccountId: string;
  showDecimals: boolean;
  textSize: TextSize;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  language?: Language;
  settings?: AppSettings;
  isVerified?: boolean;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  updatedAt: number;
}

export interface IncomeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  updatedAt: number;
}

export interface LinkedCard {
  id: string;
  name: string;
  balance: number;
  type: 'Credito' | 'Prepagata' | 'Debito';
  lastFour?: string;
  updatedAt: number;
}

export interface Account {
  id: string;
  name: string;
  balance: number; 
  type: 'Banca' | 'Contanti' | 'Carta' | 'Altro';
  color: string;
  cards: LinkedCard[];
  updatedAt: number;
}

export interface SavingsJar {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  accountId: string;
  color: string;
  icon: string;
  updatedAt: number;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  accountId: string;
  cardId?: string;
  date: string;
  notes: string;
  repeatability: Repeatability;
  usedLinkedCard?: boolean;
  isInternalTransfer?: boolean;
  updatedAt: number;
}

export interface Income {
  id: string;
  amount: number;
  accountId: string;
  categoryId: string;
  date: string;
  notes: string;
  isInternalTransfer?: boolean;
  fromAccountId?: string;
  updatedAt: number;
}

export type ViewType = 'list' | 'dashboard' | 'categories' | 'income_categories' | 'accounts' | 'settings' | 'export' | 'monthly_reports' | 'auth' | 'profile' | 'security' | 'bank_sync' | 'ai_advisor' | 'search' | 'income_list' | 'budget_summary';
