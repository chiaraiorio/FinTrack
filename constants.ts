
import { Category, Account, Repeatability, IncomeCategory } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Spesa', icon: 'cart', color: '#EF4444', updatedAt: Date.now() },
  { id: '2', name: 'Trasporti', icon: 'car', color: '#EF4444', updatedAt: Date.now() },
  { id: '3', name: 'Casa', icon: 'house', color: '#EF4444', updatedAt: Date.now() },
  { id: '4', name: 'Ristoranti', icon: 'fork.knife', color: '#EF4444', updatedAt: Date.now() },
  { id: '5', name: 'Svago', icon: 'play.tv', color: '#EF4444', updatedAt: Date.now() },
  { id: '6', name: 'Salute', icon: 'heart', color: '#EF4444', updatedAt: Date.now() },
];

export const INITIAL_INCOME_CATEGORIES: IncomeCategory[] = [
  { id: 'inc1', name: 'Stipendio', icon: 'briefcase', color: '#10B981', updatedAt: Date.now() },
  { id: 'inc2', name: 'Regalo', icon: 'gift', color: '#8B5CF6', updatedAt: Date.now() },
  { id: 'inc3', name: 'Rimborsi', icon: 'tag', color: '#3B82F6', updatedAt: Date.now() },
  { id: 'inc4', name: 'Altro', icon: 'generic', color: '#6B7280', updatedAt: Date.now() },
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc1', name: 'Conto Corrente', balance: 0, type: 'Banca', color: '#3B82F6', cards: [], updatedAt: Date.now() },
  { id: 'acc4', name: 'Portafoglio', balance: 0, type: 'Contanti', color: '#F59E0B', cards: [], updatedAt: Date.now() },
];

export const REPEAT_OPTIONS = Object.values(Repeatability);

export const CATEGORY_ICON_PATHS: Record<string, string> = {
  'cart': 'M2.25 2.25h1.5l1.35 8.1a2.25 2.25 0 002.25 1.9h9.15a2.25 2.25 0 002.25-1.9l1.35-8.1h-16.5M7.5 18.75a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm9 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  'car': 'M4.5 9h15m-15 0a2.25 2.25 0 012.25-2.25h10.5a2.25 2.25 0 012.25 2.25m-15 0v5.25a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V9m-11.25 4.5h.008v.008h-.008V13.5zm7.5 0h.008v.008h-.008V13.5zM6.75 18h10.5',
  'house': 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  'fork.knife': 'M18 2v10a2 2 0 01-2 2h-1a2 2 0 01-2-2V2M8 2v10a2 2 0 002 2h1a2 2 0 002-2V2M10 2v6m2-6v6m-6-6v6',
  'play.tv': 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z',
  'heart': 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
  'cup': 'M17 8h1a4 4 0 110 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z',
  'dumbbell': 'M18 8a2 2 0 100 4 2 2 0 000-4zM6 8a2 2 0 100 4 2 2 0 000-4zM2 9v2m20-2v2M6 10h12',
  'briefcase': 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 3.75h4M3.375 7.5h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 012.25 10.125v-1.5c0-.621.504-1.125 1.125-1.125z',
  'gift': 'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M2 8.25h20M12 7V3m0 0a1.5 1.5 0 10-3 0c0 1.5 3 4 3 4zm0 0a1.5 1.5 0 113 0c0 1.5-3 4-3 4z',
  'tag': 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.591 0l4.318-4.318a1.125 1.125 0 000-1.591l-9.581-9.581A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z',
  'bolt': 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
  'creditcard': 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  'generic': 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-15v10m-5-5h10'
};
