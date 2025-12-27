
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
  { name: 'Ambra Calda', primary: '#D97706', bg: '#FFFBEB', border: '#FEF3C7', card: '#FFFFFF', subBg: '#FFFBEB' },
  { name: 'Verde Menta', primary: '#059669', bg: '#F0FDF4', border: '#DCFCE7', card: '#FFFFFF', subBg: '#F0FDF4' },
  { name: 'Lavanda Dolce', primary: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', card: '#FFFFFF', subBg: '#F5F3FF' },
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
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
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
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>(INITIAL_INCOME_CATEGORIES);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
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

  const getUserKey = useCallback((base: string) => {
    return currentUser ? `user_${currentUser.id}_${base}` : null;
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const load = (key: string | null, fallback: any) => {
        if (!key) return fallback;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
      };
      setExpenses(load(getUserKey('expenses'), []));
      setIncomes(load(getUserKey('incomes'), []));
      setCategories(load(getUserKey('categories'), INITIAL_CATEGORIES));
      setIncomeCategories(load(getUserKey('income_categories'), INITIAL_INCOME_CATEGORIES));
      setAccounts(load(getUserKey('accounts'), INITIAL_ACCOUNTS));
      setSavingsJars(load(getUserKey('savings_jars'), []));
    }
  }, [currentUser, getUserKey]);

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
    save(getUserKey('savings_jars'), savingsJars);
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
    localStorage.setItem('app_theme', currentTheme.name);
  }, [currentTheme, currentUser?.settings]);

  const navigateTo = (newView: ViewType) => {
    if (newView === view) return;
    setViewHistory(prev => [...prev, newView]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    const registeredUsers: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const updatedRegisteredUsers = registeredUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('registered_users', JSON.stringify(updatedRegisteredUsers));
  };

  const handleUpdateCategory = (cat: Category) => {
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
  };

  const handleUpdateIncomeCategory = (cat: IncomeCategory) => {
    setIncomeCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
  };

  const handleSaveExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = { ...newExpense, id: crypto.randomUUID() };
    setExpenses(prev => [expense, ...prev]);
    setAccounts(prev => prev.map(a => {
      if (a.id !== expense.accountId) return a;
      if (expense.cardId) return { ...a, cards: a.cards.map(c => c.id === expense.cardId ? {...c, balance: c.balance - expense.amount} : c)};
      return { ...a, balance: a.balance - expense.amount };
    }));
    setIsFormOpen(false); setIsFabOpen(false);
  };

  const handleSaveIncome = (newIncome: Omit<Income, 'id'>) => {
    const income: Income = { ...newIncome, id: crypto.randomUUID() };
    setIncomes(prev => [income, ...prev]);
    setAccounts(prev => prev.map(a => {
      let balance = a.balance;
      if (a.id === income.accountId) balance += income.amount;
      if (income.isInternalTransfer && income.fromAccountId === a.id) balance -= income.amount;
      return { ...a, balance };
    }));
    setIsIncomeFormOpen(false); setIsFabOpen(false);
  };

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} incomeCategories={incomeCategories} onOpenSidebar={() => setIsSidebarOpen(true)} onNavigate={navigateTo} savingsJars={savingsJars} />;
      case 'accounts':
        return <AccountManager accounts={accounts} onAdd={a => setAccounts([...accounts, { ...a, id: crypto.randomUUID() }])} onUpdate={a => setAccounts(accounts.map(acc => acc.id === a.id ? a : acc))} onDelete={id => setAccounts(accounts.filter(a => a.id !== id))} hideBalances={hideBalances} onToggleHideBalances={() => setHideBalances(!hideBalances)} onOpenSidebar={() => setIsSidebarOpen(true)} jars={savingsJars} onAddJar={j => setSavingsJars([...savingsJars, { ...j, id: crypto.randomUUID() }])} onUpdateJar={j => setSavingsJars(savingsJars.map(jar => jar.id === j.id ? j : jar))} onDeleteJar={id => setSavingsJars(savingsJars.filter(j => j.id !== id))} onMoveFunds={() => {}} />;
      case 'budget_summary':
        return <BudgetSummary expenses={expenses} categories={categories} incomeCategories={incomeCategories} onUpdateCategory={handleUpdateCategory} onUpdateIncomeCategory={handleUpdateIncomeCategory} onNavigate={navigateTo} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'search':
        return <SearchView expenses={expenses} incomes={incomes} categories={categories} incomeCategories={incomeCategories} accounts={accounts} onBack={() => setViewHistory(prev => prev.length > 1 ? prev.slice(0, -1) : ['dashboard'])} onNavigate={navigateTo} language={language} showDecimals={currentUser.settings?.showDecimals ?? true} hideBalances={hideBalances} />;
      case 'income_list':
        return <IncomeList incomes={incomes} incomeCategories={incomeCategories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} selectedMonth={selectedMonth} selectedYear={selectedYear} onPrevMonth={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)} onNextMonth={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)} hideBalances={hideBalances} onToggleHideBalances={() => setHideBalances(!hideBalances)} onNavigate={navigateTo} onDeleteIncome={id => setIncomes(prev => prev.filter(i => i.id !== id))} showDecimals={currentUser.settings?.showDecimals || true} onEditIncome={setEditingIncome} />;
      case 'list':
        return <ExpenseList expenses={expenses} categories={categories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} selectedMonth={selectedMonth} selectedYear={selectedYear} onPrevMonth={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)} onNextMonth={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)} hideBalances={hideBalances} onToggleHideBalances={() => setHideBalances(!hideBalances)} onNavigate={navigateTo} onDeleteExpense={id => setExpenses(prev => prev.filter(e => e.id !== id))} language={language} showDecimals={currentUser.settings?.showDecimals || true} onEditExpense={setEditingExpense} />;
      case 'categories':
      case 'income_categories':
        return (
          <CategoryManager 
            expensesCategories={categories}
            incomeCategories={incomeCategories}
            onAddExpenseCat={c => setCategories([...categories, {...c, id: crypto.randomUUID()}])}
            onUpdateExpenseCat={handleUpdateCategory}
            onDeleteExpenseCat={id => setCategories(categories.filter(c => c.id !== id))}
            onAddIncomeCat={c => setIncomeCategories([...incomeCategories, {...c, id: crypto.randomUUID()}])}
            onUpdateIncomeCat={handleUpdateIncomeCategory}
            onDeleteIncomeCat={id => setIncomeCategories(incomeCategories.filter(c => c.id !== id))}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        );
      case 'bank_sync':
        return <BankSync categories={categories} incomeCategories={incomeCategories} accounts={accounts} onImport={() => {}} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'ai_advisor':
        return <AiAdvisor expenses={expenses} categories={categories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} language={language} />;
      case 'export':
        return <ExportManager expenses={expenses} incomes={incomes} categories={categories} incomeCategories={incomeCategories} accounts={accounts} onNavigate={navigateTo} onBack={() => setViewHistory(['dashboard'])} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'settings':
        return <Settings expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onClearData={() => setExpenses([])} onNavigate={navigateTo} onGoToMenu={() => setViewHistory(['dashboard'])} palettes={PALETTES} currentPalette={currentTheme} onPaletteChange={setCurrentTheme} language={language} onLanguageChange={setLanguage} settings={currentUser.settings || DEFAULT_SETTINGS} onUpdateSettings={s => handleUpdateUser({...currentUser, settings: s})} onImportData={() => {}} />;
      case 'profile':
        return <ProfileView user={currentUser} onUpdateUser={handleUpdateUser} onNavigate={navigateTo} onBack={() => setViewHistory(['dashboard'])} transactionCount={expenses.length + incomes.length} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'security':
        return <SecurityView user={currentUser} onUpdateUser={handleUpdateUser} onBack={() => setViewHistory(['dashboard'])} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'monthly_reports':
        return <MonthlyReports expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onNavigate={navigateTo} onBack={() => setViewHistory(['dashboard'])} onOpenSidebar={() => setIsSidebarOpen(true)} />;
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
