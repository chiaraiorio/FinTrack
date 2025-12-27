
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
import { Expense, Income, Category, Account, ViewType, User, IncomeCategory, Language, AppSettings, SavingsJar, LinkedCard, Repeatability } from './types.ts';
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
    if (currentUser) localStorage.setItem('current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('current_user');
  }, [currentUser]);

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

  const handleBulkImport = (transactions: any[]) => {
    const newExpensesList: Expense[] = [];
    const newIncomesList: Income[] = [];
    const accountBalanceChanges: Record<string, number> = {};

    transactions.forEach(t => {
      const amountChange = t.type === 'ENTRATA' ? t.amount : -t.amount;
      accountBalanceChanges[t.accountId] = (accountBalanceChanges[t.accountId] || 0) + amountChange;

      if (t.type === 'SPESA') {
        newExpensesList.push({ 
          id: crypto.randomUUID(), 
          amount: t.amount,
          categoryId: t.categoryId,
          accountId: t.accountId,
          date: t.date,
          notes: t.notes,
          repeatability: Repeatability.NONE 
        });
      } else {
        newIncomesList.push({ 
          id: crypto.randomUUID(), 
          amount: t.amount,
          accountId: t.accountId,
          categoryId: t.categoryId,
          date: t.date,
          notes: t.notes 
        });
      }
    });

    setExpenses(prev => [...newExpensesList, ...prev]);
    setIncomes(prev => [...newIncomesList, ...prev]);
    setAccounts(prev => prev.map(a => accountBalanceChanges[a.id] ? { ...a, balance: a.balance + accountBalanceChanges[a.id] } : a));

    if (transactions.length > 0) {
      if (newExpensesList.length >= newIncomesList.length) navigateTo('list');
      else navigateTo('income_list');
      const lastDate = new Date(transactions[0].date);
      setSelectedMonth(lastDate.getMonth());
      setSelectedYear(lastDate.getFullYear());
    }
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    const oldExpense = expenses.find(e => e.id === updatedExpense.id);
    if (!oldExpense) return;

    setAccounts(prev => prev.map(a => {
      let balance = a.balance;
      const cards = [...a.cards];

      // Revert old
      if (a.id === oldExpense.accountId) {
        if (oldExpense.cardId) {
          const cIdx = cards.findIndex(c => c.id === oldExpense.cardId);
          if (cIdx !== -1) cards[cIdx].balance += oldExpense.amount;
        } else {
          balance += oldExpense.amount;
        }
      }

      // Apply new
      if (a.id === updatedExpense.accountId) {
        if (updatedExpense.cardId) {
          const cIdx = cards.findIndex(c => c.id === updatedExpense.cardId);
          if (cIdx !== -1) cards[cIdx].balance -= updatedExpense.amount;
        } else {
          balance -= updatedExpense.amount;
        }
      }

      return { ...a, balance, cards };
    }));

    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    setEditingExpense(null);
  };

  const handleUpdateIncome = (updatedIncome: Income) => {
    const oldIncome = incomes.find(i => i.id === updatedIncome.id);
    if (!oldIncome) return;

    setAccounts(prev => prev.map(a => {
      let balance = a.balance;
      
      // Revert old state
      if (a.id === oldIncome.accountId) balance -= oldIncome.amount;
      if (oldIncome.isInternalTransfer && oldIncome.fromAccountId === a.id) balance += oldIncome.amount;

      // Apply new state
      if (a.id === updatedIncome.accountId) balance += updatedIncome.amount;
      if (updatedIncome.isInternalTransfer && updatedIncome.fromAccountId === a.id) balance -= updatedIncome.amount;
      
      return { ...a, balance };
    }));

    setIncomes(prev => prev.map(i => i.id === updatedIncome.id ? updatedIncome : i));
    setEditingIncome(null);
  };

  const handleMoveFunds = (amount: number, from: {type: 'acc' | 'card' | 'jar', id: string}, to: {type: 'acc' | 'card' | 'jar', id: string}, notes: string) => {
    setAccounts(prev => prev.map(acc => {
      let newBalance = acc.balance;
      const newCards = [...acc.cards];
      if (from.type === 'acc' && from.id === acc.id) newBalance -= amount;
      if (to.type === 'acc' && to.id === acc.id) newBalance += amount;
      const cardFromIdx = newCards.findIndex(c => c.id === from.id);
      if (cardFromIdx !== -1) newCards[cardFromIdx].balance -= amount;
      const cardToIdx = newCards.findIndex(c => c.id === to.id);
      if (cardToIdx !== -1) newCards[cardToIdx].balance += amount;
      return { ...acc, balance: newBalance, cards: newCards };
    }));
    if (from.type === 'jar') setSavingsJars(prev => prev.map(j => j.id === from.id ? {...j, currentAmount: j.currentAmount - amount} : j));
    if (to.type === 'jar') setSavingsJars(prev => prev.map(j => j.id === to.id ? {...j, currentAmount: j.currentAmount + amount} : j));
    const date = new Date().toISOString().split('T')[0];
    const fromAcc = accounts.find(a => a.id === from.id || a.cards.some(c => c.id === from.id));
    const toAcc = accounts.find(a => a.id === to.id || a.cards.some(c => c.id === to.id));
    if (fromAcc) {
      setExpenses(prev => [{ id: crypto.randomUUID(), amount, categoryId: 'internal_transfer', accountId: fromAcc.id, cardId: from.type === 'card' ? from.id : undefined, date, notes: `USCITA: ${notes}`, repeatability: Repeatability.NONE, isInternalTransfer: true }, ...prev]);
    }
    if (toAcc) {
      setIncomes(prev => [{ id: crypto.randomUUID(), amount, accountId: toAcc.id, categoryId: 'internal_transfer', date, notes: `ENTRATA: ${notes}`, isInternalTransfer: true, fromAccountId: fromAcc?.id }, ...prev]);
    }
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
        return <AccountManager accounts={accounts} onAdd={a => setAccounts([...accounts, { ...a, id: crypto.randomUUID() }])} onUpdate={a => setAccounts(accounts.map(acc => acc.id === a.id ? a : acc))} onDelete={id => setAccounts(accounts.filter(a => a.id !== id))} hideBalances={hideBalances} onToggleHideBalances={() => setHideBalances(!hideBalances)} onOpenSidebar={() => setIsSidebarOpen(true)} jars={savingsJars} onAddJar={j => setSavingsJars([...savingsJars, { ...j, id: crypto.randomUUID() }])} onUpdateJar={j => setSavingsJars(savingsJars.map(jar => jar.id === j.id ? j : jar))} onDeleteJar={id => setSavingsJars(savingsJars.filter(j => j.id !== id))} onMoveFunds={handleMoveFunds} />;
      case 'bank_sync':
        return <BankSync categories={categories} incomeCategories={incomeCategories} accounts={accounts} onImport={handleBulkImport} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'settings':
        return <Settings expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onClearData={() => setExpenses([])} onNavigate={navigateTo} onGoToMenu={() => setViewHistory(['dashboard'])} palettes={PALETTES} currentPalette={currentTheme} onPaletteChange={setCurrentTheme} language={language} onLanguageChange={setLanguage} settings={currentUser.settings || DEFAULT_SETTINGS} onUpdateSettings={s => handleUpdateUser({...currentUser, settings: s})} onImportData={() => {}} />;
      case 'profile':
        return <ProfileView user={currentUser} onUpdateUser={handleUpdateUser} onNavigate={navigateTo} onBack={() => setViewHistory(['dashboard'])} transactionCount={expenses.length + incomes.length} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'security':
        return <SecurityView user={currentUser} onUpdateUser={handleUpdateUser} onBack={() => setViewHistory(['dashboard'])} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'income_list':
        return <IncomeList incomes={incomes} incomeCategories={incomeCategories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} selectedMonth={selectedMonth} selectedYear={selectedYear} onPrevMonth={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)} onNextMonth={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)} hideBalances={hideBalances} onToggleHideBalances={() => setHideBalances(!hideBalances)} onNavigate={navigateTo} onDeleteIncome={id => setIncomes(prev => prev.filter(i => i.id !== id))} showDecimals={currentUser.settings?.showDecimals || true} onEditIncome={setEditingIncome} />;
      case 'monthly_reports':
        return <MonthlyReports expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onNavigate={navigateTo} onBack={() => setViewHistory(['dashboard'])} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'list':
      default:
        return <ExpenseList expenses={expenses} categories={categories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} selectedMonth={selectedMonth} selectedYear={selectedYear} onPrevMonth={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)} onNextMonth={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)} hideBalances={hideBalances} onToggleHideBalances={() => setHideBalances(!hideBalances)} onNavigate={navigateTo} onDeleteExpense={id => setExpenses(prev => prev.filter(e => e.id !== id))} language={language} showDecimals={currentUser.settings?.showDecimals || true} onEditExpense={setEditingExpense} />;
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
      {(isFormOpen || editingExpense) && <ExpenseForm categories={categories} accounts={accounts} onSave={handleSaveExpense} onUpdate={handleUpdateExpense} onClose={() => { setIsFormOpen(false); setEditingExpense(null); }} initialData={editingExpense || undefined} defaultAccountId={currentUser.settings?.defaultAccountId} />}
      {(isIncomeFormOpen || editingIncome) && <IncomeForm accounts={accounts} incomeCategories={incomeCategories} onSave={handleSaveIncome} onUpdate={handleUpdateIncome} onClose={() => { setIsIncomeFormOpen(false); setEditingIncome(null); }} initialData={editingIncome || undefined} />}
    </Layout>
  );
};

export default App;
