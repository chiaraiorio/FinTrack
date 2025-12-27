
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout.tsx';
import Auth from './components/Auth.tsx';
import ExpenseForm from './components/ExpenseForm.tsx';
import IncomeForm from './components/IncomeForm.tsx';
import Dashboard from './components/Dashboard.tsx';
import AccountManager from './components/AccountManager.tsx';
import Sidebar from './components/Sidebar.tsx';
import Settings from './components/Settings.tsx';
import ProfileView from './components/ProfileView.tsx';
import SecurityView from './components/SecurityView.tsx';
import IncomeList from './components/IncomeList.tsx';
import ExpenseList from './components/ExpenseList.tsx';
import AiAdvisor from './components/AiAdvisor.tsx';
import BankSync from './components/BankSync.tsx';
import SearchView from './components/SearchView.tsx';
import MonthlyReports from './components/MonthlyReports.tsx';
import CategoryManager from './components/CategoryManager.tsx';
import ExportManager from './components/ExportManager.tsx';
import BudgetSummary from './components/BudgetSummary.tsx';
import { Expense, Income, Category, Account, ViewType, User, IncomeCategory, Language, AppSettings, SavingsJar, Repeatability } from './types.ts';
import { INITIAL_CATEGORIES, INITIAL_ACCOUNTS, INITIAL_INCOME_CATEGORIES } from './constants.ts';

export type ThemePalette = {
  name: string;
  primary: string;
  bg: string;
  border: string;
  card: string;
  subBg: string;
};

const PALETTES: ThemePalette[] = [
  { name: 'Beige Classico', primary: '#8E7C68', bg: '#FAF7F2', border: '#EBE4D8', card: '#FFFFFF', subBg: '#FAF7F2' },
  { name: 'Oceano Profondo', primary: '#3B82F6', bg: '#F0F7FF', border: '#D1E2F5', card: '#FFFFFF', subBg: '#F0F7FF' },
  { name: 'Sottobosco', primary: '#2D6A4F', bg: '#F1F7F4', border: '#D8E5DF', card: '#FFFFFF', subBg: '#F1F7F4' },
  { name: 'Rosa Rubino', primary: '#9D446E', bg: '#FDF2F7', border: '#F5E1EC', card: '#FFFFFF', subBg: '#FDF2F7' },
  { name: 'Mezzanotte', primary: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE', card: '#FFFFFF', subBg: '#EEF2FF' },
];

const DEFAULT_SETTINGS: AppSettings = {
  monthlyBudget: 0,
  firstDayOfMonth: 1,
  defaultAccountId: '',
  showDecimals: true,
  textSize: 'medium'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [viewHistory, setViewHistory] = useState<ViewType[]>(['dashboard']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<Language>((localStorage.getItem('app_language') as Language) || 'it');
  const [currentTheme, setCurrentTheme] = useState<ThemePalette>(() => {
    const saved = localStorage.getItem('app_theme');
    return PALETTES.find(p => p.name === saved) || PALETTES[0];
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES.map(c => ({...c, updatedAt: Date.now()})));
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>(INITIAL_INCOME_CATEGORIES.map(c => ({...c, updatedAt: Date.now()})));
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS.map(a => ({...a, updatedAt: Date.now()})));
  const [savingsJars, setSavingsJars] = useState<SavingsJar[]>([]);
  const [hideBalances, setHideBalances] = useState(localStorage.getItem('hide_balances') === 'true');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const view = viewHistory[viewHistory.length - 1];

  const getUserKey = useCallback((base: string) => currentUser ? `user_${currentUser.id}_${base}` : null, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const load = (key: string | null, fallback: any) => {
        if (!key) return fallback;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
      };
      setExpenses(load(getUserKey('expenses'), []));
      setIncomes(load(getUserKey('incomes'), []));
      setCategories(load(getUserKey('categories'), categories));
      setIncomeCategories(load(getUserKey('income_categories'), incomeCategories));
      setAccounts(load(getUserKey('accounts'), accounts));
      setSavingsJars(load(getUserKey('savings_jars'), []));
    }
  }, [currentUser, getUserKey]);

  useEffect(() => {
    if (!currentUser) return;
    const save = (key: string | null, data: any) => { if (key) localStorage.setItem(key, JSON.stringify(data)); };
    save(getUserKey('expenses'), expenses);
    save(getUserKey('incomes'), incomes);
    save(getUserKey('categories'), categories);
    save(getUserKey('income_categories'), incomeCategories);
    save(getUserKey('accounts'), accounts);
    save(getUserKey('savings_jars'), savingsJars);
    localStorage.setItem('current_user', JSON.stringify(currentUser));
  }, [expenses, incomes, categories, incomeCategories, accounts, savingsJars, currentUser, getUserKey]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.primary);
    root.style.setProperty('--bg-app', currentTheme.bg);
    root.style.setProperty('--border', currentTheme.border);
    root.style.setProperty('--card-bg', currentTheme.card);
    root.style.setProperty('--secondary-bg', currentTheme.subBg);
    const settings = currentUser?.settings || DEFAULT_SETTINGS;
    root.style.fontSize = { small: '14px', medium: '16px', large: '18px' }[settings.textSize];
  }, [currentTheme, currentUser?.settings]);

  const generateSyncCode = (): string => {
    const bundle = {
      user: currentUser,
      expenses,
      incomes,
      categories,
      incomeCategories,
      accounts,
      savingsJars,
      theme: currentTheme.name,
      lang: language,
      timestamp: Date.now()
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(bundle))));
  };

  const smartMerge = (local: any[], remote: any[]): any[] => {
    const merged = [...local];
    remote.forEach(remoteItem => {
      const index = merged.findIndex(l => l.id === remoteItem.id);
      if (index === -1) {
        merged.push(remoteItem);
      } else {
        if ((remoteItem.updatedAt || 0) > (merged[index].updatedAt || 0)) {
          merged[index] = remoteItem;
        }
      }
    });
    return merged;
  };

  const importFromSyncCode = (code: string, mode: 'merge' | 'replace'): boolean => {
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(code))));
      if (!decoded.user || !decoded.expenses) return false;
      
      if (mode === 'replace') {
        setCurrentUser(decoded.user);
        setExpenses(decoded.expenses);
        setIncomes(decoded.incomes);
        setCategories(decoded.categories);
        setIncomeCategories(decoded.incomeCategories);
        setAccounts(decoded.accounts);
        setSavingsJars(decoded.savingsJars);
      } else {
        setExpenses(prev => smartMerge(prev, decoded.expenses));
        setIncomes(prev => smartMerge(prev, decoded.incomes));
        setCategories(prev => smartMerge(prev, decoded.categories));
        setIncomeCategories(prev => smartMerge(prev, decoded.incomeCategories));
        setAccounts(prev => smartMerge(prev, decoded.accounts));
        setSavingsJars(prev => smartMerge(prev, decoded.savingsJars));
        if ((decoded.user.updatedAt || 0) > (currentUser?.updatedAt || 0)) {
          setCurrentUser(decoded.user);
        }
      }

      setLanguage(decoded.lang || 'it');
      const theme = PALETTES.find(p => p.name === decoded.theme) || PALETTES[0];
      setCurrentTheme(theme);
      
      return true;
    } catch (e) {
      return false;
    }
  };

  const navigateTo = (newView: ViewType) => setViewHistory(prev => [...prev, newView]);

  const handleUpdateUser = (updatedUser: User) => {
    const userWithTs = { ...updatedUser, updatedAt: Date.now() };
    setCurrentUser(userWithTs);
    const registered: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');
    localStorage.setItem('registered_users', JSON.stringify(registered.map(u => u.id === updatedUser.id ? userWithTs : u)));
  };

  const handleSaveExpense = (newExpense: Omit<Expense, 'id' | 'updatedAt'>) => {
    const expense: Expense = { ...newExpense, id: crypto.randomUUID(), updatedAt: Date.now() };
    setExpenses(prev => [expense, ...prev]);
    setAccounts(prev => prev.map(a => {
      if (a.id !== expense.accountId) return a;
      const updatedAccount = { ...a, updatedAt: Date.now() };
      if (expense.cardId) {
        updatedAccount.cards = a.cards.map(c => c.id === expense.cardId ? {...c, balance: c.balance - expense.amount, updatedAt: Date.now()} : c);
      } else {
        updatedAccount.balance = a.balance - expense.amount;
      }
      return updatedAccount;
    }));
    setIsFormOpen(false); setIsFabOpen(false);
  };

  const handleSaveIncome = (newIncome: Omit<Income, 'id' | 'updatedAt'>) => {
    const income: Income = { ...newIncome, id: crypto.randomUUID(), updatedAt: Date.now() };
    setIncomes(prev => [income, ...prev]);
    setAccounts(prev => prev.map(a => {
      let balance = a.balance;
      if (a.id === income.accountId) balance += income.amount;
      if (income.isInternalTransfer && income.fromAccountId === a.id) balance -= income.amount;
      return { ...a, balance, updatedAt: Date.now() };
    }));
    setIsIncomeFormOpen(false); setIsFabOpen(false);
  };

  if (!currentUser) return <Auth onLogin={setCurrentUser} onImportSync={(code) => importFromSyncCode(code, 'merge')} />;

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} incomeCategories={incomeCategories} onOpenSidebar={() => setIsSidebarOpen(true)} onNavigate={navigateTo} savingsJars={savingsJars} />;
      case 'accounts':
        return <AccountManager accounts={accounts} onAdd={a => setAccounts([...accounts, { ...a, id: crypto.randomUUID(), updatedAt: Date.now() }])} onUpdate={a => setAccounts(accounts.map(acc => acc.id === a.id ? {...a, updatedAt: Date.now()} : acc))} onDelete={id => setAccounts(accounts.filter(a => a.id !== id))} hideBalances={hideBalances} onToggleHideBalances={() => setHideBalances(!hideBalances)} onOpenSidebar={() => setIsSidebarOpen(true)} jars={savingsJars} onAddJar={j => setSavingsJars([...savingsJars, { ...j, id: crypto.randomUUID(), updatedAt: Date.now() }])} onUpdateJar={j => setSavingsJars(savingsJars.map(jar => jar.id === j.id ? {...j, updatedAt: Date.now()} : jar))} onDeleteJar={id => setSavingsJars(savingsJars.filter(j => j.id !== id))} onMoveFunds={() => {}} />;
      case 'settings':
        return <Settings expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onClearData={() => setExpenses([])} onNavigate={navigateTo} onGoToMenu={() => setViewHistory(['dashboard'])} palettes={PALETTES} currentPalette={currentTheme} onPaletteChange={setCurrentTheme} language={language} onLanguageChange={setLanguage} settings={currentUser.settings || DEFAULT_SETTINGS} onUpdateSettings={s => handleUpdateUser({...currentUser, settings: s})} onGetSyncCode={generateSyncCode} onImportSync={importFromSyncCode} />;
      default:
        return <Dashboard expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} incomeCategories={incomeCategories} onOpenSidebar={() => setIsSidebarOpen(true)} onNavigate={navigateTo} savingsJars={savingsJars} />;
    }
  };

  const Fab = (
    <button onClick={() => setIsFabOpen(!isFabOpen)} className={`w-16 h-16 theme-bg-primary rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl transition-all active:scale-90 z-[60] ${isFabOpen ? 'rotate-45' : ''}`}>
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
    </button>
  );

  return (
    <Layout activeView={view} onViewChange={navigateTo} centerButton={Fab} language={language}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onViewChange={navigateTo} currentView={view} user={currentUser} onLogout={() => setCurrentUser(null)} language={language} />
      {renderView()}
      {isFabOpen && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-[55] animate-in fade-in slide-in-from-bottom-10">
          <button onClick={() => { setIsIncomeFormOpen(true); setIsFabOpen(false); }} className="bg-white px-8 py-4 rounded-[1.5rem] shadow-xl font-black text-emerald-500 text-sm border theme-border active:scale-95 transition-all">Nuova Entrata</button>
          <button onClick={() => { setIsFormOpen(true); setIsFabOpen(false); }} className="bg-white px-8 py-4 rounded-[1.5rem] shadow-xl font-black text-rose-500 text-sm border theme-border active:scale-95 transition-all">Nuova Spesa</button>
        </div>
      )}
      {(isFormOpen || editingExpense) && <ExpenseForm categories={categories} accounts={accounts} onSave={handleSaveExpense} onClose={() => { setIsFormOpen(false); setEditingExpense(null); }} initialData={editingExpense || undefined} />}
      {(isIncomeFormOpen || editingIncome) && <IncomeForm accounts={accounts} incomeCategories={incomeCategories} onSave={handleSaveIncome} onClose={() => { setIsIncomeFormOpen(false); setEditingIncome(null); }} initialData={editingIncome || undefined} />}
    </Layout>
  );
};

export default App;
