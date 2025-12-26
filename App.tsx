
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout.tsx';
import Auth from './components/Auth.tsx';
import ExpenseForm from './components/ExpenseForm.tsx';
import IncomeForm from './components/IncomeForm.tsx';
import TransferForm from './components/TransferForm.tsx';
import Dashboard from './components/Dashboard.tsx';
import CategoryManager from './components/CategoryManager.tsx';
import IncomeCategoryManager from './components/IncomeCategoryManager.tsx';
import AccountManager from './components/AccountManager.tsx';
import ExportManager from './components/ExportManager.tsx';
import MonthlyReports from './components/MonthlyReports.tsx';
import Sidebar from './components/Sidebar.tsx';
import Settings from './components/Settings.tsx';
import ProfileView from './components/ProfileView.tsx';
import SecurityView from './components/SecurityView.tsx';
import IncomeList from './components/IncomeList.tsx';
import ExpenseList from './components/ExpenseList.tsx';
import AiAdvisor from './components/AiAdvisor.tsx';
import SearchView from './components/SearchView.tsx';
import { Expense, Income, Category, Account, ViewType, Repeatability, User, IncomeCategory, Language, AppSettings } from './types.ts';
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
  { name: 'Lavanda Soft', primary: '#8B5CF6', bg: '#F5F3FF', border: '#E9E3FF', card: '#FFFFFF', subBg: '#F5F3FF' },
  { name: 'Menta Fresca', primary: '#10B981', bg: '#F0FDF4', border: '#DCFCE7', card: '#FFFFFF', subBg: '#F0FDF4' },
  { name: 'Giallo Crema', primary: '#D97706', bg: '#FFFBEB', border: '#FEF3C7', card: '#FFFFFF', subBg: '#FFFBEB' },
  { name: 'Tramonto Arancio', primary: '#F97316', bg: '#FFF7ED', border: '#FFEDD5', card: '#FFFFFF', subBg: '#FFF7ED' },
];

const DEFAULT_SETTINGS: AppSettings = {
  monthlyBudget: 0,
  firstDayOfMonth: 1,
  defaultAccountId: '',
  showDecimals: true,
  textSize: 'medium'
};

const App: React.FC = () => {
  // --- AUTH STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- UI STATE ---
  const [viewHistory, setViewHistory] = useState<ViewType[]>(['dashboard']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<Language>((localStorage.getItem('app_language') as Language) || 'it');
  const [currentTheme, setCurrentTheme] = useState<ThemePalette>(() => {
    const saved = localStorage.getItem('app_theme');
    return PALETTES.find(p => p.name === saved) || PALETTES[0];
  });

  // --- DATA STATE (USER-SPECIFIC) ---
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>(INITIAL_INCOME_CATEGORIES);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [hideBalances, setHideBalances] = useState(localStorage.getItem('hide_balances') === 'true');

  // --- FORMS STATE ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const view = viewHistory[viewHistory.length - 1];

  // Helper per chiavi localStorage specifiche per l'utente
  const getUserKey = useCallback((base: string) => {
    return currentUser ? `user_${currentUser.id}_${base}` : null;
  }, [currentUser]);

  // Caricamento dati alla connessione dell'utente
  useEffect(() => {
    if (currentUser) {
      const keys = {
        expenses: getUserKey('expenses'),
        incomes: getUserKey('incomes'),
        categories: getUserKey('categories'),
        income_categories: getUserKey('income_categories'),
        accounts: getUserKey('accounts')
      };

      const load = (key: string | null, fallback: any) => {
        if (!key) return fallback;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
      };

      setExpenses(load(keys.expenses, []));
      setIncomes(load(keys.incomes, []));
      setCategories(load(keys.categories, INITIAL_CATEGORIES));
      setIncomeCategories(load(keys.income_categories, INITIAL_INCOME_CATEGORIES));
      setAccounts(load(keys.accounts, INITIAL_ACCOUNTS));
    }
  }, [currentUser, getUserKey]);

  // Salvataggio dati automatico
  useEffect(() => {
    if (!currentUser) return;
    const save = (key: string | null, data: any) => {
      if (key) localStorage.setItem(key, JSON.stringify(data));
    };
    save(getUserKey('expenses'), expenses);
    save(getUserKey('incomes'), incomes);
    save(getUserKey('categories'), categories);
    save(getUserKey('income_categories'), incomeCategories);
    save(getUserKey('accounts'), accounts);
  }, [expenses, incomes, categories, incomeCategories, accounts, currentUser, getUserKey]);

  // Sincronizzazione profilo utente nel database locale
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('current_user', JSON.stringify(currentUser));
      const allUsers: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const updatedUsers = allUsers.map(u => u.id === currentUser.id ? currentUser : u);
      localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
    } else {
      localStorage.removeItem('current_user');
    }
  }, [currentUser]);

  // Temi e Accessibilità
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.primary);
    root.style.setProperty('--bg-app', currentTheme.bg);
    root.style.setProperty('--border', currentTheme.border);
    root.style.setProperty('--card-bg', currentTheme.card);
    root.style.setProperty('--secondary-bg', currentTheme.subBg);
    
    const settings = currentUser?.settings || DEFAULT_SETTINGS;
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    root.style.fontSize = sizes[settings.textSize];
    localStorage.setItem('app_theme', currentTheme.name);
  }, [currentTheme, currentUser?.settings]);

  const navigateTo = (newView: ViewType) => {
    if (newView === view) return;
    setViewHistory(prev => [...prev, newView]);
  };

  const goBack = () => {
    if (viewHistory.length > 1) {
      setViewHistory(prev => prev.slice(0, -1));
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setViewHistory(['dashboard']);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewHistory(['auth']);
    // Reset data state per sicurezza visuale immediata
    setExpenses([]);
    setIncomes([]);
    setAccounts(INITIAL_ACCOUNTS);
  };

  const handleSaveExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = { ...newExpense, id: crypto.randomUUID() };
    setExpenses(prev => [expense, ...prev]);
    setAccounts(prev => prev.map(a => 
      a.id === expense.accountId ? { ...a, balance: a.balance - expense.amount } : a
    ));
    setIsFormOpen(false);
    setIsFabOpen(false);
  };

  const handleSaveIncome = (newIncome: Omit<Income, 'id'>) => {
    const income: Income = { ...newIncome, id: crypto.randomUUID() };
    setIncomes(prev => [income, ...prev]);
    setAccounts(prev => prev.map(a => 
      a.id === income.accountId ? { ...a, balance: a.balance + income.amount } : a
    ));
    setIsIncomeFormOpen(false);
    setIsFabOpen(false);
  };

  const handleSaveTransfer = (amount: number, fromId: string, toId: string, notes: string, date: string) => {
    const fromAcc = accounts.find(a => a.id === fromId);
    const toAcc = accounts.find(a => a.id === toId);
    
    const transferExpense: Expense = {
      id: crypto.randomUUID(), amount, accountId: fromId, categoryId: 'transfer', date, notes: `Giroconto a ${toAcc?.name}. ${notes}`, repeatability: Repeatability.NONE
    };
    const transferIncome: Income = {
      id: crypto.randomUUID(), amount, accountId: toId, categoryId: 'transfer', date, notes: `Giroconto da ${fromAcc?.name}. ${notes}`
    };
    
    setExpenses(prev => [transferExpense, ...prev]);
    setIncomes(prev => [transferIncome, ...prev]);
    setAccounts(prev => prev.map(a => {
      if (a.id === fromId) return { ...a, balance: a.balance - amount };
      if (a.id === toId) return { ...a, balance: a.balance + amount };
      return a;
    }));
    setIsTransferFormOpen(false);
    setIsFabOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
    setAccounts(prev => prev.map(a => a.id === exp.accountId ? { ...a, balance: a.balance + exp.amount } : a));
  };

  const handleDeleteIncome = (id: string) => {
    const inc = incomes.find(i => i.id === id);
    if (!inc) return;
    setIncomes(prev => prev.filter(i => i.id !== id));
    setAccounts(prev => prev.map(a => a.id === inc.accountId ? { ...a, balance: a.balance - inc.amount } : a));
  };

  const userSettings = currentUser?.settings || DEFAULT_SETTINGS;

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
      case 'financial_analysis':
        return <Dashboard expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} isDetailed={view === 'financial_analysis'} onBack={goBack} onNavigate={navigateTo} />;
      case 'categories':
        return <CategoryManager categories={categories} onAdd={(c) => setCategories([...categories, { ...c, id: crypto.randomUUID() }])} onUpdate={(c) => setCategories(categories.map(cat => cat.id === c.id ? c : cat))} onDelete={(id) => setCategories(categories.filter(c => c.id !== id))} onBack={goBack} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'income_categories':
        return <IncomeCategoryManager categories={incomeCategories} onAdd={(c) => setIncomeCategories([...incomeCategories, { ...c, id: crypto.randomUUID() }])} onUpdate={(c) => setIncomeCategories(incomeCategories.map(cat => cat.id === c.id ? c : cat))} onDelete={(id) => setIncomeCategories(incomeCategories.filter(c => c.id !== id))} onBack={goBack} />;
      case 'accounts':
        return <AccountManager accounts={accounts} onAdd={(a) => setAccounts([...accounts, { ...a, id: crypto.randomUUID() }])} onUpdate={(a) => setAccounts(accounts.map(acc => acc.id === a.id ? a : acc))} onDelete={(id) => setAccounts(accounts.filter(a => a.id !== id))} onAddIncome={() => setIsIncomeFormOpen(true)} hideBalances={hideBalances} onToggleHideBalances={() => setHideBalances(!hideBalances)} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'settings':
        return <Settings expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onClearData={() => { if(window.confirm('Cancellare tutto?')) { setExpenses([]); setIncomes([]); } }} onNavigate={navigateTo} onGoToMenu={() => { setViewHistory(['dashboard']); setIsSidebarOpen(true); }} palettes={PALETTES} currentPalette={currentTheme} onPaletteChange={setCurrentTheme} language={language} onLanguageChange={setLanguage} settings={userSettings} onUpdateSettings={(s) => setCurrentUser({...currentUser, settings: s})} onImportData={() => {}} />;
      case 'export':
        return <ExportManager expenses={expenses} incomes={incomes} categories={categories} incomeCategories={incomeCategories} accounts={accounts} onNavigate={navigateTo} onBack={() => navigateTo('dashboard')} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'monthly_reports':
        return <MonthlyReports expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onNavigate={navigateTo} onBack={goBack} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'profile':
        return <ProfileView user={currentUser} onUpdateUser={setCurrentUser} onNavigate={navigateTo} onBack={goBack} transactionCount={expenses.length + incomes.length} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'security':
        return <SecurityView user={currentUser} onNavigate={navigateTo} onBack={goBack} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'income_list':
        return <IncomeList incomes={incomes} incomeCategories={incomeCategories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} selectedMonth={selectedMonth} selectedYear={selectedYear} onPrevMonth={() => { if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); } else { setSelectedMonth(selectedMonth - 1); } }} onNextMonth={() => { if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); } else { setSelectedMonth(selectedMonth + 1); } }} hideBalances={hideBalances} onToggleHideBalances={() => setHideBalances(!hideBalances)} onNavigate={navigateTo} onDeleteIncome={handleDeleteIncome} showDecimals={userSettings.showDecimals} />;
      case 'ai_advisor':
        return <AiAdvisor expenses={expenses} categories={categories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} language={language} />;
      case 'search':
        return <SearchView expenses={expenses} incomes={incomes} categories={categories} incomeCategories={incomeCategories} accounts={accounts} onBack={goBack} onNavigate={navigateTo} language={language} showDecimals={userSettings.showDecimals} hideBalances={hideBalances} />;
      case 'list':
      default:
        return <ExpenseList expenses={expenses} categories={categories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} selectedMonth={selectedMonth} selectedYear={selectedYear} onPrevMonth={() => { if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); } else { setSelectedMonth(selectedMonth - 1); } }} onNextMonth={() => { if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); } else { setSelectedMonth(selectedMonth + 1); } }} hideBalances={hideBalances} onToggleHideBalances={() => setHideBalances(!hideBalances)} onNavigate={navigateTo} onDeleteExpense={handleDeleteExpense} language={language} showDecimals={userSettings.showDecimals} />;
    }
  };

  const Fab = (
    <div className="relative">
      {isFabOpen && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-300">
          <button onClick={() => { setIsTransferFormOpen(true); setIsFabOpen(false); }} className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xl border theme-border whitespace-nowrap active:scale-95 transition-transform"><span className="text-sky-500 font-bold">{language === 'it' ? 'Trasferimento' : 'Transfer'}</span><div className="w-8 h-8 bg-sky-50 text-sky-500 rounded-lg flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4" /></svg></div></button>
          <button onClick={() => { setIsIncomeFormOpen(true); setIsFabOpen(false); }} className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xl border theme-border whitespace-nowrap active:scale-95 transition-transform"><span className="text-emerald-500 font-bold">{language === 'it' ? 'Nuova Entrata' : 'New Income'}</span><div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg></div></button>
          <button onClick={() => { setIsFormOpen(true); setIsFabOpen(false); }} className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xl border theme-border whitespace-nowrap active:scale-95 transition-transform"><span className="text-rose-500 font-bold">{language === 'it' ? 'Nuova Uscita' : 'New Expense'}</span><div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg></div></button>
        </div>
      )}
      <button 
        onClick={() => setIsFabOpen(!isFabOpen)}
        className={`w-16 h-16 theme-bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all active:scale-90 z-[60] ${isFabOpen ? 'rotate-45' : ''}`}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
      </button>
    </div>
  );

  return (
    <Layout activeView={view} onViewChange={navigateTo} centerButton={Fab} language={language}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onViewChange={navigateTo} currentView={view} user={currentUser} onLogout={handleLogout} language={language} />
      {renderView()}
      {isFormOpen && <ExpenseForm categories={categories} accounts={accounts} onSave={handleSaveExpense} onClose={() => setIsFormOpen(false)} defaultAccountId={userSettings.defaultAccountId} />}
      {isIncomeFormOpen && <IncomeForm accounts={accounts} incomeCategories={incomeCategories} onSave={handleSaveIncome} onClose={() => setIsIncomeFormOpen(false)} />}
      {isTransferFormOpen && <TransferForm accounts={accounts} onSave={handleSaveTransfer} onClose={() => setIsTransferFormOpen(false)} />}
    </Layout>
  );
};

export default App;
