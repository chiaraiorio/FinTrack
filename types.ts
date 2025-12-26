
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
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface IncomeCategory {
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
  categoryId: string;
  date: string;
  notes: string;
}

export type ViewType = 'list' | 'dashboard' | 'categories' | 'accounts' | 'settings' | 'export' | 'monthly_reports' | 'auth' | 'profile' | 'security' | 'financial_analysis' | 'income_list' | 'income_categories' | 'ai_advisor' | 'search';
