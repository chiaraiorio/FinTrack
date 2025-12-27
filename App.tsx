
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout.tsx';
import Auth from './components/Auth.tsx';
import ExpenseForm from './components/ExpenseForm.tsx';
import IncomeForm from './components/IncomeForm.tsx';
import TransferForm from './components/TransferForm.tsx';
import Dashboard from './components/Dashboard.tsx';
import AccountManager from './components/AccountManager.tsx';
import Sidebar from './components/Sidebar.tsx';
import Settings from './components/Settings.tsx';
import IncomeList from './components/IncomeList.tsx';
import ExpenseList from './components/ExpenseList.tsx';
import BudgetSummary from './components/BudgetSummary.tsx';
import AiAdvisor from './components/AiAdvisor.tsx';
import BankSync from './components/BankSync.tsx';
import ExportManager from './components/ExportManager.tsx';
import MonthlyReports from './components/MonthlyReports.tsx';
import SearchView from './components/SearchView.tsx';
import ProfileView from './components/ProfileView.tsx';
import SecurityView from './components/SecurityView.tsx';
import { 
  Expense, Income, Category, Account, ViewType, User, 
  IncomeCategory, Language, SavingsJar, AppSettings, ThemePalette, Repeatability 
} from './types.ts';
import { INITIAL_CATEGORIES, INITIAL_ACCOUNTS, INITIAL_INCOME_CATEGORIES } from './constants.ts';

const PALETTES: ThemePalette[] = [
  { name: 'Classico', primary: '#8E7C68', bg: '#FAF7F2' },
  { name: 'Smeraldo', primary: '#10B981', bg: '#F0FDF4' },
  { name: 'Oceano', primary: '#0EA5E9', bg: '#F0F9FF' },
  { name: 'Notte', primary: '#4A453E', bg: '#F5F1EA' },
  { name: 'Lavanda', primary: '#8B5CF6', bg: '#F5F3FF' },
  { name: 'Tramonto', primary: '#F59E0B', bg: '#FFFBEB' },
  { name: 'Bosco', primary: '#065F46', bg: '#ECFDF5' },
  { name: 'Ciliegio', primary: '#DB2777', bg: '#FDF2F8' },
  { name: 'Ardesia', primary: '#334155', bg: '#F8FAFC' },
  { name: 'Oro', primary: '#B45309', bg: '#FFF7ED' },
  { name: 'Indaco', primary: '#4F46E5', bg: '#EEF2FF' },
  { name: 'Menta', primary: '#059669', bg: '#F0FDF4' }
];

const DEFAULT_SETTINGS: AppSettings = {
  monthlyBudget: 0,
  firstDayOfMonth: 1,
  firstDayOfWeek: 1,
  carryOverBalance: false,
  currency: '€',
  language: 'it',
  defaultAccountId: '',
  showDecimals: true,
  textSize: 'medium',
  biometricEnabled: false
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [savingsJars, setSavingsJars] = useState<SavingsJar[]>([]);
  const [hideBalances, setHideBalances] = useState(localStorage.getItem('hide_balances') === 'true');
  const [currentPalette, setCurrentPalette] = useState<ThemePalette>(PALETTES[0]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);

  const uKey = (base: string) => currentUser ? `u_${currentUser.id}_${base}` : null;

  useEffect(() => {
    if (currentUser) {
      const load = (key: string | null, fallback: any) => {
        if (!key) return fallback;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
      };

      setExpenses(load(uKey('expenses'), []));
      setIncomes(load(uKey('incomes'), []));
      setCategories(load(uKey('categories'), INITIAL_CATEGORIES.map(c => ({...c, updatedAt: Date.now()}))));
      setIncomeCategories(load(uKey('income_categories'), INITIAL_INCOME_CATEGORIES.map(c => ({...c, updatedAt: Date.now()}))));
      setAccounts(load(uKey('accounts'), INITIAL_ACCOUNTS.map(a => ({...a, updatedAt: Date.now()}))));
      setSavingsJars(load(uKey('savings_jars'), []));
      
      const savedSettings = load(uKey('settings'), DEFAULT_SETTINGS);
      setSettings(savedSettings);

      const savedTheme = load(uKey('theme'), PALETTES[0]);
      setCurrentPalette(savedTheme);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const save = (key: string | null, data: any) => { if (key) localStorage.setItem(key, JSON.stringify(data)); };
    
    save(uKey('expenses'), expenses);
    save(uKey('incomes'), incomes);
    save(uKey('categories'), categories);
    save(uKey('income_categories'), incomeCategories);
    save(uKey('accounts'), accounts);
    save(uKey('savings_jars'), savingsJars);
    save(uKey('settings'), settings);
    save(uKey('theme'), currentPalette);

    localStorage.setItem('current_user', JSON.stringify(currentUser));
    localStorage.setItem('hide_balances', hideBalances.toString());
    
    document.documentElement.style.setProperty('--primary', currentPalette.primary);
    document.documentElement.style.setProperty('--bg-app', currentPalette.bg);
  }, [expenses, incomes, categories, incomeCategories, accounts, savingsJars, currentUser, hideBalances, currentPalette, settings]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('current_user');
    setView('dashboard');
  };

  const navigateTo = (newView: ViewType) => {
    setView(newView);
    setIsSidebarOpen(false);
    setIsActionMenuOpen(false);
  };

  const handleSaveExpense = (newEx: Omit<Expense, 'id' | 'updatedAt'>) => {
    const expense: Expense = { ...newEx, id: crypto.randomUUID(), updatedAt: Date.now() };
    setExpenses(prev => [expense, ...prev]);
    setAccounts(prev => prev.map(a => {
      if (a.id !== expense.accountId) return a;
      return { ...a, balance: a.balance - expense.amount, updatedAt: Date.now() };
    }));
    setIsFormOpen(false);
  };

  const handleSaveIncome = (newInc: Omit<Income, 'id' | 'updatedAt'>) => {
    const income: Income = { ...newInc, id: crypto.randomUUID(), updatedAt: Date.now() };
    setIncomes(prev => [income, ...prev]);
    setAccounts(prev => prev.map(a => {
      if (a.id !== income.accountId) return a;
      return { ...a, balance: a.balance + income.amount, updatedAt: Date.now() };
    }));
    setIsIncomeFormOpen(false);
  };

  const handleSaveTransfer = (amount: number, fromId: string, toId: string, notes: string, date: string) => {
    const fromAcc = accounts.find(a => a.id === fromId);
    const toAcc = accounts.find(a => a.id === toId);

    const transferExpense: Expense = {
      id: crypto.randomUUID(),
      amount,
      categoryId: 'internal_transfer',
      accountId: fromId,
      date,
      notes: notes || `Trasferimento verso ${toAcc?.name}`,
      repeatability: Repeatability.NONE,
      isInternalTransfer: true,
      updatedAt: Date.now()
    };

    const transferIncome: Income = {
      id: crypto.randomUUID(),
      amount,
      accountId: toId,
      categoryId: 'internal_transfer',
      date,
      notes: notes || `Trasferimento da ${fromAcc?.name}`,
      isInternalTransfer: true,
      fromAccountId: fromId,
      updatedAt: Date.now()
    };

    setExpenses(prev => [transferExpense, ...prev]);
    setIncomes(prev => [transferIncome, ...prev]);
    
    setAccounts(prev => prev.map(a => {
      if (a.id === fromId) return { ...a, balance: a.balance - amount, updatedAt: Date.now() };
      if (a.id === toId) return { ...a, balance: a.balance + amount, updatedAt: Date.now() };
      return a;
    }));

    setIsTransferFormOpen(false);
  };

  const handleReorderAccounts = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
  };

  const handleMoveFunds = (amount: number, from: {type: 'acc' | 'card' | 'jar', id: string}, to: {type: 'acc' | 'card' | 'jar', id: string}, notes: string) => {
    // Aggiorna Sorgente (Sottrae)
    if (from.type === 'jar') {
      setSavingsJars(prev => prev.map(j => j.id === from.id ? { ...j, currentAmount: j.currentAmount - amount, updatedAt: Date.now() } : j));
    } else {
      setAccounts(prev => prev.map(acc => {
        if (from.type === 'acc' && acc.id === from.id) {
          return { ...acc, balance: acc.balance - amount, updatedAt: Date.now() };
        }
        if (from.type === 'card' && acc.cards.some(c => c.id === from.id)) {
          return { ...acc, cards: acc.cards.map(c => c.id === from.id ? { ...c, balance: c.balance - amount, updatedAt: Date.now() } : c), updatedAt: Date.now() };
        }
        return acc;
      }));
    }

    // Aggiorna Destinazione (Aggiunge)
    if (to.type === 'jar') {
      setSavingsJars(prev => prev.map(j => j.id === to.id ? { ...j, currentAmount: j.currentAmount + amount, updatedAt: Date.now() } : j));
    } else {
      setAccounts(prev => prev.map(acc => {
        if (to.type === 'acc' && acc.id === to.id) {
          return { ...acc, balance: acc.balance + amount, updatedAt: Date.now() };
        }
        if (to.type === 'card' && acc.cards.some(c => c.id === to.id)) {
          return { ...acc, cards: acc.cards.map(c => c.id === to.id ? { ...c, balance: c.balance + amount, updatedAt: Date.now() } : c), updatedAt: Date.now() };
        }
        return acc;
      }));
    }
  };

  const handleImportTransactions = (transactions: any[]) => {
    transactions.forEach(t => {
      if (t.type === 'SPESA') {
        handleSaveExpense({
          amount: t.amount,
          categoryId: t.categoryId,
          accountId: t.accountId,
          date: t.date,
          notes: t.notes,
          repeatability: Repeatability.NONE,
        });
      } else {
        handleSaveIncome({
          amount: t.amount,
          categoryId: t.categoryId,
          accountId: t.accountId,
          date: t.date,
          notes: t.notes
        });
      }
    });
    navigateTo('dashboard');
  };

  if (!currentUser) return <Auth onLogin={setCurrentUser} onImportSync={() => false} />;

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} incomeCategories={incomeCategories} onOpenSidebar={() => setIsSidebarOpen(true)} onNavigate={navigateTo} savingsJars={savingsJars} />;
      case 'accounts':
        return <AccountManager 
          accounts={accounts} 
          onAdd={a => setAccounts(prev => [...prev, { ...a, id: crypto.randomUUID(), updatedAt: Date.now() }])} 
          onUpdate={a => setAccounts(prev => prev.map(acc => acc.id === a.id ? a : acc))} 
          onDelete={id => setAccounts(prev => prev.filter(a => a.id !== id))} 
          onReorder={handleReorderAccounts} 
          hideBalances={hideBalances} 
          onToggleHideBalances={() => setHideBalances(!hideBalances)} 
          onOpenSidebar={() => setIsSidebarOpen(true)} 
          jars={savingsJars} 
          onAddJar={j => setSavingsJars(prev => [...prev, { ...j, id: crypto.randomUUID(), updatedAt: Date.now() }])} 
          onUpdateJar={j => setSavingsJars(prev => prev.map(jar => jar.id === j.id ? j : jar))} 
          onDeleteJar={id => setSavingsJars(prev => prev.filter(j => j.id !== id))} 
          onMoveFunds={handleMoveFunds} 
        />;
      case 'list':
        return <ExpenseList expenses={expenses} categories={categories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} onNavigate={navigateTo} onDeleteExpense={id => setExpenses(expenses.filter(e => e.id !== id))} onEditExpense={() => {}} language={settings.language} showDecimals={settings.showDecimals} hideBalances={hideBalances} />;
      case 'income_list':
        return <IncomeList incomes={incomes} incomeCategories={incomeCategories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} onNavigate={navigateTo} onDeleteIncome={id => setIncomes(incomes.filter(i => i.id !== id))} onEditIncome={() => {}} hideBalances={hideBalances} />;
      case 'budget_summary':
        return <BudgetSummary expenses={expenses} categories={categories} incomeCategories={incomeCategories} onUpdateCategory={c => setCategories(categories.map(cat => cat.id === c.id ? c : cat))} onUpdateIncomeCategory={c => setIncomeCategories(incomeCategories.map(cat => cat.id === c.id ? c : cat))} onNavigate={navigateTo} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'ai_advisor':
        return <AiAdvisor expenses={expenses} categories={categories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} language={settings.language} />;
      case 'bank_sync':
        return <BankSync categories={categories} incomeCategories={incomeCategories} accounts={accounts} onImport={handleImportTransactions} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'export':
        return <ExportManager expenses={expenses} incomes={incomes} categories={categories} incomeCategories={incomeCategories} accounts={accounts} onNavigate={navigateTo} onBack={() => setView('dashboard')} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'monthly_reports':
        return <MonthlyReports expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onNavigate={navigateTo} onBack={() => setView('dashboard')} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'settings':
        return <Settings expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onClearData={() => { if(window.confirm('Cancellare tutto definitivamente?')) { setExpenses([]); setIncomes([]); setAccounts(INITIAL_ACCOUNTS); setSavingsJars([]); } }} onNavigate={navigateTo} onGoToMenu={() => setView('dashboard')} palettes={PALETTES} currentPalette={currentPalette} onPaletteChange={setCurrentPalette} language={settings.language} settings={settings} onUpdateSettings={setSettings} onGetSyncCode={() => 'SYNC-' + currentUser.id} onImportSync={() => false} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'search':
        return <SearchView expenses={expenses} incomes={incomes} categories={categories} incomeCategories={incomeCategories} accounts={accounts} onBack={() => setView('dashboard')} onNavigate={navigateTo} language={settings.language} showDecimals={settings.showDecimals} hideBalances={hideBalances} />;
      case 'profile':
        return <ProfileView user={currentUser} onUpdateUser={setCurrentUser} onNavigate={navigateTo} onBack={() => setView('dashboard')} transactionCount={expenses.length + incomes.length} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'security':
        return <SecurityView user={currentUser} onUpdateUser={setCurrentUser} onBack={() => setView('dashboard')} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      default:
        return <Dashboard expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} incomeCategories={incomeCategories} onOpenSidebar={() => setIsSidebarOpen(true)} onNavigate={navigateTo} savingsJars={savingsJars} />;
    }
  };

  const Fab = (
    <div className="relative">
      {isActionMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/5 z-[40]" onClick={() => setIsActionMenuOpen(false)} />
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-[50] animate-in slide-in-from-bottom-4 duration-300 items-center">
            <button 
              onClick={() => { setIsTransferFormOpen(true); setIsActionMenuOpen(false); }}
              className="flex items-center gap-2 bg-sky-500 text-white px-5 py-3.5 rounded-2xl shadow-xl whitespace-nowrap font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              Trasferimento
            </button>
            <button 
              onClick={() => { setIsIncomeFormOpen(true); setIsActionMenuOpen(false); }}
              className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-xl whitespace-nowrap font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              Nuova Entrata
            </button>
            <button 
              onClick={() => { setIsFormOpen(true); setIsActionMenuOpen(false); }}
              className="flex items-center gap-2 bg-red-600 text-white px-5 py-3.5 rounded-2xl shadow-xl whitespace-nowrap font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
              Nuova Uscita
            </button>
          </div>
        </>
      )}
      <button 
        onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} 
        className={`w-16 h-16 theme-bg-primary rounded-full flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all z-[60] relative ${isActionMenuOpen ? 'rotate-45' : 'rotate-0'}`}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M12 4v16m8-8H4" /></svg>
      </button>
    </div>
  );

  return (
    <Layout activeView={view} onViewChange={navigateTo} centerButton={Fab}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onViewChange={navigateTo} currentView={view} user={currentUser} onLogout={handleLogout} language={settings.language} />
      <div className={`app-container size-${settings.textSize}`}>
        {renderView()}
      </div>
      {isFormOpen && <ExpenseForm categories={categories} accounts={accounts} onSave={handleSaveExpense} onClose={() => setIsFormOpen(false)} defaultAccountId={settings.defaultAccountId} />}
      {isIncomeFormOpen && <IncomeForm accounts={accounts} incomeCategories={incomeCategories} onSave={handleSaveIncome} onClose={() => setIsIncomeFormOpen(false)} />}
      {isTransferFormOpen && <TransferForm accounts={accounts} onSave={handleSaveTransfer} onClose={() => setIsTransferFormOpen(false)} />}
    </Layout>
  );
};

export default App;
