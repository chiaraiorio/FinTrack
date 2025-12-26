import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import ExpenseForm from './components/ExpenseForm';
import IncomeForm from './components/IncomeForm';
import TransferForm from './components/TransferForm';
import Dashboard from './components/Dashboard';
import CategoryManager from './components/CategoryManager';
import AccountManager from './components/AccountManager';
import ExportManager from './components/ExportManager';
import MonthlyReports from './components/MonthlyReports';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import ProfileView from './components/ProfileView';
import SecurityView from './components/SecurityView';
// Fix: Add missing import for CategoryIcon
import CategoryIcon from './components/CategoryIcon';
import { Expense, Income, Category, Account, ViewType, Repeatability, User } from './types';
import { INITIAL_CATEGORIES, INITIAL_ACCOUNTS } from './constants';

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
  { name: 'Viola Lavanda', primary: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', card: '#FFFFFF', subBg: '#F5F3FF' },
  { name: 'Arancio Tramonto', primary: '#F97316', bg: '#FFF7ED', border: '#FFEDD5', card: '#FFFFFF', subBg: '#FFF7ED' },
  { name: 'Verde Smeraldo', primary: '#10B981', bg: '#ECFDF5', border: '#D1FAE5', card: '#FFFFFF', subBg: '#ECFDF5' },
  { name: 'Blu Cobalto', primary: '#1D4ED8', bg: '#EFF6FF', border: '#DBEAFE', card: '#FFFFFF', subBg: '#EFF6FF' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [viewHistory, setViewHistory] = useState<ViewType[]>(['list']);
  const [currentTheme, setCurrentTheme] = useState<ThemePalette>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved) {
      return PALETTES.find(p => p.name === saved) || PALETTES[0];
    }
    return PALETTES[0];
  });

  const view = viewHistory[viewHistory.length - 1];

  const navigateTo = (newView: ViewType) => {
    if (newView === view) return;
    setViewHistory(prev => [...prev, newView]);
  };

  const goBack = () => {
    if (viewHistory.length > 1) {
      setViewHistory(prev => prev.slice(0, -1));
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hideBalances, setHideBalances] = useState(() => {
    return localStorage.getItem('hide_balances') === 'true';
  });
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [incomes, setIncomes] = useState<Income[]>(() => {
    const saved = localStorage.getItem('incomes');
    return saved ? JSON.parse(saved) : [];
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.primary);
    root.style.setProperty('--bg-app', currentTheme.bg);
    root.style.setProperty('--border', currentTheme.border);
    root.style.setProperty('--card-bg', currentTheme.card);
    root.style.setProperty('--secondary-bg', currentTheme.subBg);
    localStorage.setItem('app_theme', currentTheme.name);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('hide_balances', String(hideBalances));
  }, [hideBalances]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('current_user', JSON.stringify(currentUser));
      const users: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const updatedUsers = users.map(u => u.id === currentUser.id ? currentUser : u);
      localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
    } else {
      localStorage.removeItem('current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('incomes', JSON.stringify(incomes));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }, [expenses, incomes, categories, accounts]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setViewHistory(['list']);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const processRecurringExpenses = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    let hasChanges = false;
    let newExpenses = [...expenses];
    let newAccounts = [...accounts];

    const getNextDate = (dateStr: string, freq: Repeatability): string => {
      const d = new Date(dateStr);
      switch (freq) {
        case Repeatability.DAILY: d.setDate(d.getDate() + 1); break;
        case Repeatability.WEEKLY: d.setDate(d.getDate() + 7); break;
        case Repeatability.MONTHLY: d.setMonth(d.getMonth() + 1); break;
        case Repeatability.BIMONTHLY: d.setMonth(d.getMonth() + 2); break;
        case Repeatability.SEMIANNUAL: d.setMonth(d.getMonth() + 6); break;
        case Repeatability.YEARLY: d.setFullYear(d.getFullYear() + 1); break;
        default: return dateStr;
      }
      return d.toISOString().split('T')[0];
    };

    newExpenses = newExpenses.map(exp => {
      if (exp.repeatability === Repeatability.NONE || !exp.isRecurringSource) return exp;
      let currentSource = { ...exp };
      let lastProc = currentSource.lastProcessedDate || currentSource.date;
      let next = getNextDate(lastProc, currentSource.repeatability);

      while (next <= today) {
        const instance: Expense = {
          ...currentSource,
          id: crypto.randomUUID(),
          date: next,
          isRecurringSource: false,
          parentExpenseId: currentSource.id,
          repeatability: Repeatability.NONE,
        };
        newExpenses.push(instance);
        newAccounts = newAccounts.map(acc => 
          acc.id === instance.accountId ? { ...acc, balance: acc.balance - instance.amount } : acc
        );
        hasChanges = true;
        lastProc = next;
        next = getNextDate(lastProc, currentSource.repeatability);
      }
      return { ...currentSource, lastProcessedDate: lastProc };
    });

    if (hasChanges) {
      setExpenses(newExpenses);
      setAccounts(newAccounts);
    }
  }, [expenses, accounts]);

  useEffect(() => { 
    if (currentUser) processRecurringExpenses(); 
  }, [currentUser, processRecurringExpenses]);

  const addExpense = (newExp: Omit<Expense, 'id'>) => {
    const isRecurring = newExp.repeatability !== Repeatability.NONE;
    const expense: Expense = { 
      ...newExp, 
      id: crypto.randomUUID(),
      isRecurringSource: isRecurring,
      lastProcessedDate: newExp.date 
    };
    setExpenses(prev => [expense, ...prev]);
    setAccounts(prev => prev.map(acc => acc.id === expense.accountId ? { ...acc, balance: acc.balance - expense.amount } : acc));
    if (isRecurring) setTimeout(processRecurringExpenses, 0);
  };

  const addIncome = (newInc: Omit<Income, 'id'>) => {
    const income: Income = { ...newInc, id: crypto.randomUUID() };
    setIncomes(prev => [income, ...prev]);
    setAccounts(prev => prev.map(acc => acc.id === income.accountId ? { ...acc, balance: acc.balance + income.amount } : acc));
  };

  const handleTransfer = (amount: number, fromId: string, toId: string, notes: string, date: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === fromId) return { ...acc, balance: acc.balance - amount };
      if (acc.id === toId) return { ...acc, balance: acc.balance + amount };
      return acc;
    }));
  };

  const deleteExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    setAccounts(prev => prev.map(acc => acc.id === expense.accountId ? { ...acc, balance: acc.balance + expense.amount } : acc));
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const addCategory = (cat: Omit<Category, 'id'>) => setCategories([...categories, { ...cat, id: crypto.randomUUID() }]);
  const updateCategory = (updatedCat: Category) => setCategories(categories.map(c => c.id === updatedCat.id ? updatedCat : c));
  const deleteCategory = (id: string) => setCategories(categories.filter(c => c.id !== id));
  
  const addAccount = (acc: Omit<Account, 'id'>) => setAccounts([...accounts, { ...acc, id: crypto.randomUUID() }]);
  const updateAccount = (updatedAcc: Account) => setAccounts(accounts.map(a => a.id === updatedAcc.id ? updatedAcc : a));
  const deleteAccount = (id: string) => setAccounts(accounts.filter(a => a.id !== id));
  
  const moveAccount = (index: number, direction: 'up' | 'down') => {
    const newAccounts = [...accounts];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newAccounts.length) return;
    [newAccounts[index], newAccounts[newIndex]] = [newAccounts[newIndex], newAccounts[index]];
    setAccounts(newAccounts);
  };

  const clearAllData = () => {
    if (window.confirm("Sei sicuro di voler cancellare tutti i dati? L'operazione è irreversibile.")) {
      setExpenses([]);
      setIncomes([]);
      setCategories(INITIAL_CATEGORIES);
      setAccounts(INITIAL_ACCOUNTS);
      localStorage.removeItem('expenses');
      localStorage.removeItem('incomes');
      localStorage.removeItem('categories');
      localStorage.removeItem('accounts');
      window.location.reload();
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedMonth, selectedYear]);

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('it-IT', { month: 'long' });

  useEffect(() => {
    setIsFabOpen(false);
  }, [view]);

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'categories': return <CategoryManager categories={categories} onAdd={addCategory} onUpdate={updateCategory} onDelete={deleteCategory} onBack={goBack} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'accounts': return <AccountManager accounts={accounts} onAdd={addAccount} onUpdate={updateAccount} onDelete={deleteAccount} onMove={moveAccount} onAddIncome={() => setIsIncomeFormOpen(true)} hideBalances={hideBalances} onToggleHideBalances={() => setHideBalances(!hideBalances)} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'settings': return <Settings expenses={expenses} categories={categories} accounts={accounts} onClearData={clearAllData} onNavigate={navigateTo} onBack={goBack} palettes={PALETTES} currentPalette={currentTheme} onPaletteChange={setCurrentTheme} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'export': return <ExportManager expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onNavigate={navigateTo} onBack={goBack} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'monthly_reports': return <MonthlyReports expenses={expenses} incomes={incomes} categories={categories} accounts={accounts} onNavigate={navigateTo} onBack={goBack} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'profile': return <ProfileView user={currentUser} onUpdateUser={updateUser} onNavigate={navigateTo} onBack={goBack} transactionCount={expenses.length + incomes.length} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'security': return <SecurityView user={currentUser} onNavigate={navigateTo} onBack={goBack} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      default:
        return (
          <div className="px-5 pt-12">
            <header className="mb-6 flex justify-between items-end">
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="w-10 h-10 theme-card rounded-full flex items-center justify-center mb-2 active:scale-90 transition-transform"
                >
                  <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
                <div>
                  <p className="opacity-60 font-bold text-xs uppercase tracking-tight ml-1">{selectedYear}</p>
                  <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E] capitalize">{monthName}</h1>
                </div>
              </div>
              <div className="flex bg-white/50 ios-blur rounded-full p-1 shadow-sm border theme-border">
                <button onClick={() => selectedMonth === 0 ? (setSelectedMonth(11), setSelectedYear(selectedYear - 1)) : setSelectedMonth(selectedMonth - 1)} className="p-2 theme-primary hover:bg-white rounded-full transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => selectedMonth === 11 ? (setSelectedMonth(0), setSelectedYear(selectedYear + 1)) : setSelectedMonth(selectedMonth + 1)} className="p-2 theme-primary hover:bg-white rounded-full transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </header>

            <div className="theme-card rounded-3xl p-6 mb-8 flex justify-between items-center group">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[11px] font-bold opacity-60 uppercase">Totale Speso</p>
                  <button 
                    onClick={() => setHideBalances(!hideBalances)}
                    className="text-[#D9D1C5] hover:theme-primary transition-colors"
                  >
                    {hideBalances ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                <p className="text-3xl font-bold text-[#4A453E]">
                  {hideBalances ? '€ ••••' : `€${filteredExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[11px] font-bold opacity-60 uppercase ml-4 mb-2">Transazioni Recenti</h3>
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-16 opacity-30">
                  <p className="font-semibold italic text-sm">Nessuna operazione</p>
                </div>
              ) : (
                <div className="theme-card rounded-[2rem] overflow-hidden divide-y theme-border">
                  {filteredExpenses.map(expense => {
                    const cat = categories.find(c => c.id === expense.categoryId);
                    const acc = accounts.find(a => a.id === expense.accountId);
                    return (
                      <div key={expense.id} className="p-4 flex items-center gap-4 active:theme-sub-bg transition-colors group">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${cat?.color || '#eee'}15` }}>
                          <CategoryIcon iconName={cat?.icon || 'generic'} color={cat?.color || 'var(--primary)'} className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-[15px] text-[#4A453E] flex items-center gap-1.5">
                                {cat?.name || 'Senza Categoria'}
                                {expense.usedLinkedCard && acc?.linkedCardName && (
                                  <span className="flex items-center gap-0.5 theme-sub-bg px-1.5 py-0.5 rounded-full border theme-border text-[9px] theme-primary font-bold">
                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    {acc.linkedCardName}
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] opacity-60 font-medium">
                                {new Date(expense.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                {acc && !expense.usedLinkedCard && ` • ${acc.name}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-[16px] text-[#4A453E]">
                                {hideBalances ? '-€ ••' : `-€${expense.amount.toFixed(2)}`}
                              </span>
                              <button onClick={() => deleteExpense(expense.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[#D9D1C5] hover:text-rose-400 transition-all">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Layout activeView={view} onViewChange={navigateTo}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onViewChange={navigateTo} 
        currentView={view}
        user={currentUser}
        onLogout={handleLogout}
      />
      {renderView()}
      
      {(view === 'accounts' || view === 'list' || view === 'export' || view === 'monthly_reports' || view === 'dashboard') && (
        <div className="fixed bottom-24 right-6 flex flex-col items-end gap-3 z-[40]">
          {isFabOpen && (
            <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button 
                onClick={() => { setIsIncomeFormOpen(true); setIsFabOpen(false); }}
                className="flex items-center gap-3 bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
              >
                <span className="text-[13px] font-bold uppercase tracking-wider">Nuova Entrata</span>
                <div className="w-8 h-8 flex items-center justify-center">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
              </button>

              <button 
                onClick={() => { setIsTransferFormOpen(true); setIsFabOpen(false); }}
                className="flex items-center gap-3 bg-sky-400 text-white px-4 py-3 rounded-2xl shadow-lg shadow-sky-400/30 active:scale-95 transition-transform"
              >
                <span className="text-[13px] font-bold uppercase tracking-wider">Trasferimento</span>
                <div className="w-8 h-8 flex items-center justify-center">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
              </button>
              
              <button 
                onClick={() => { setIsFormOpen(true); setIsFabOpen(false); }}
                className="flex items-center gap-3 bg-rose-400 text-white px-4 py-3 rounded-2xl shadow-lg shadow-rose-400/30 active:scale-95 transition-transform"
              >
                <span className="text-[13px] font-bold uppercase tracking-wider">Nuova Spesa</span>
                <div className="w-8 h-8 flex items-center justify-center">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v12m6-6H6" /></svg>
                </div>
              </button>
            </div>
          )}

          <button 
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${isFabOpen ? 'bg-white theme-primary rotate-45 theme-border border' : 'theme-bg-primary text-white'}`}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v12m6-6H6" />
            </svg>
          </button>
        </div>
      )}

      {isFormOpen && (
        <ExpenseForm categories={categories} accounts={accounts} onSave={addExpense} onClose={() => setIsFormOpen(false)} />
      )}
      {isIncomeFormOpen && (
        <IncomeForm accounts={accounts} onSave={addIncome} onClose={() => setIsIncomeFormOpen(false)} />
      )}
      {isTransferFormOpen && (
        <TransferForm accounts={accounts} onSave={handleTransfer} onClose={() => setIsTransferFormOpen(false)} />
      )}
    </Layout>
  );
};

export default App;