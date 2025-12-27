
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Expense, Income, Category, Account, ViewType, SavingsJar, IncomeCategory } from '../types';
import CategoryIcon from './CategoryIcon';

interface DashboardProps {
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  accounts: Account[];
  incomeCategories: IncomeCategory[];
  onOpenSidebar: () => void;
  isDetailed?: boolean;
  onBack?: () => void;
  onNavigate?: (view: ViewType) => void;
  savingsJars?: SavingsJar[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  expenses, 
  incomes, 
  categories, 
  accounts, 
  incomeCategories,
  onOpenSidebar, 
  onNavigate, 
  savingsJars = [] 
}) => {
  const [isAssetsExpanded, setIsAssetsExpanded] = useState(false);
  const [isIncomesExpanded, setIsIncomesExpanded] = useState(false);
  const [isExpensesExpanded, setIsExpensesExpanded] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Widget visibility state
  const [visibleWidgets, setVisibleWidgets] = useState(() => {
    const saved = localStorage.getItem('dash_widgets');
    return saved ? JSON.parse(saved) : {
      assets: true,
      summary: true,
      categoryPie: true,
      monthlyTrend: true,
      dailyTrend: true
    };
  });

  useEffect(() => {
    localStorage.setItem('dash_widgets', JSON.stringify(visibleWidgets));
  }, [visibleWidgets]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const realExpenses = useMemo(() => expenses.filter(e => !e.isInternalTransfer), [expenses]);
  const realIncomes = useMemo(() => incomes.filter(i => !i.isInternalTransfer), [incomes]);

  // Current month data
  const currentMonthExpenses = useMemo(() => 
    realExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
  , [realExpenses, currentMonth, currentYear]);

  const currentMonthIncomes = useMemo(() => 
    realIncomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
  , [realIncomes, currentMonth, currentYear]);

  const totalExpenses = useMemo(() => currentMonthExpenses.reduce((s, e) => s + e.amount, 0), [currentMonthExpenses]);
  const totalIncomes = useMemo(() => currentMonthIncomes.reduce((s, i) => s + i.amount, 0), [currentMonthIncomes]);
  
  const totalLiquidity = useMemo(() => 
    accounts.reduce((s, a) => s + a.balance + a.cards.reduce((cs, c) => cs + c.balance, 0), 0), 
  [accounts]);

  // Accounts breakdown for current month
  const accountExpenseBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    currentMonthExpenses.forEach(e => {
      breakdown[e.accountId] = (breakdown[e.accountId] || 0) + e.amount;
    });
    return breakdown;
  }, [currentMonthExpenses]);

  const accountIncomeBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    currentMonthIncomes.forEach(i => {
      breakdown[i.accountId] = (breakdown[i.accountId] || 0) + i.amount;
    });
    return breakdown;
  }, [currentMonthIncomes]);

  const expenseCategoryData = useMemo(() => {
    const data: Record<string, { amount: number, icon: string, color: string }> = {};
    currentMonthExpenses.forEach(e => {
      const cat = categories.find(c => c.id === e.categoryId);
      const name = cat ? cat.name : 'Altro';
      if (!data[name]) {
        data[name] = { amount: 0, icon: cat?.icon || 'generic', color: cat?.color || '#8E7C68' };
      }
      data[name].amount += e.amount;
    });
    return Object.entries(data)
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthExpenses, categories]);

  const chartData = useMemo(() => {
    const data: Record<string, { total: number; income: number }> = {};
    for(let i=5; i>=0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('it-IT', { month: 'short' });
      data[key] = { total: 0, income: 0 };
    }
    realExpenses.forEach(e => {
      const key = new Date(e.date).toLocaleString('it-IT', { month: 'short' });
      if (data[key]) data[key].total += e.amount;
    });
    realIncomes.forEach(i => {
      const key = new Date(i.date).toLocaleString('it-IT', { month: 'short' });
      if (data[key]) data[key].income += i.amount;
    });
    return Object.entries(data).map(([name, vals]) => ({ name, ...vals }));
  }, [realExpenses, realIncomes, now]);

  const dailyData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      amount: 0
    }));
    currentMonthExpenses.forEach(e => {
      const d = new Date(e.date).getDate();
      if (data[d - 1]) data[d - 1].amount += e.amount;
    });
    return data;
  }, [currentMonthExpenses, currentMonth, currentYear]);

  const toggleWidget = (id: string) => {
    setVisibleWidgets((prev: any) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper for formatting currency to avoid toLocaleString typing issues in some environments
  const formatVal = (val: number) => new Intl.NumberFormat('it-IT').format(val);

  return (
    <div className="px-5 pt-12 space-y-8 pb-32 animate-in fade-in duration-500">
      <header className="flex items-center gap-2">
        <button onClick={onOpenSidebar} className="w-10 h-10 theme-card rounded-xl flex items-center justify-center active:scale-90 transition-transform">
          <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
        <button onClick={() => onNavigate?.('search')} className="w-10 h-10 theme-card rounded-xl flex items-center justify-center active:scale-90 transition-transform">
          <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
        <div className="flex-1 flex justify-end items-center gap-2">
          <button onClick={() => setShowConfig(!showConfig)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showConfig ? 'theme-bg-primary text-white' : 'theme-card text-primary'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
          <h1 className="text-xl font-black text-[#4A453E] tracking-tight">FinTrack</h1>
        </div>
      </header>

      {showConfig && (
        <section className="bg-white rounded-3xl p-6 border theme-border shadow-md animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-[10px] font-black opacity-40 uppercase mb-4 tracking-widest">Personalizza Dashboard</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'assets', label: 'Patrimonio' },
              { id: 'summary', label: 'Riepilogo' },
              { id: 'categoryPie', label: 'Categorie' },
              { id: 'monthlyTrend', label: 'Trend Mese' },
              { id: 'dailyTrend', label: 'Spese Giorno' },
            ].map(w => (
              <button 
                key={w.id} 
                onClick={() => toggleWidget(w.id)}
                className={`p-3 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border ${visibleWidgets[w.id] ? 'theme-bg-primary text-white border-transparent' : 'theme-sub-bg text-gray-400 theme-border'}`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {visibleWidgets.assets && (
        <section className="space-y-4">
          <div 
            onClick={() => setIsAssetsExpanded(!isAssetsExpanded)}
            className={`theme-card rounded-[2.5rem] p-8 bg-white border theme-border shadow-sm transition-all duration-300 cursor-pointer active:scale-[0.98] ${isAssetsExpanded ? 'ring-2 ring-offset-2 theme-primary ring-opacity-20' : ''}`}
          >
            <div className="text-center relative">
              <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Patrimonio Totale</p>
              {/* Fix toLocaleString on line 246 by using Intl.NumberFormat */}
              <p className="text-4xl font-black text-[#4A453E] tracking-tighter">€{formatVal(totalLiquidity)}</p>
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 transition-transform duration-300 ${isAssetsExpanded ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {isAssetsExpanded && (
              <div className="mt-8 pt-6 border-t theme-border space-y-4 animate-in slide-in-from-top-4 duration-300">
                {accounts.map(acc => {
                  const accTotal = acc.balance + acc.cards.reduce((s, c) => s + c.balance, 0);
                  return (
                    <div key={acc.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center opacity-80" style={{ backgroundColor: acc.color }}>
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#4A453E]">{acc.name}</p>
                          <p className="text-[9px] font-bold opacity-30 uppercase">{acc.type}</p>
                        </div>
                      </div>
                      {/* Fix toLocaleString on line 274 by using Intl.NumberFormat */}
                      <p className="text-sm font-black text-[#4A453E]">€{formatVal(accTotal)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {visibleWidgets.summary && (
        <section className="grid grid-cols-1 gap-4">
          <div 
            onClick={() => setIsIncomesExpanded(!isIncomesExpanded)}
            className={`bg-emerald-50 rounded-[2rem] p-5 border border-emerald-100 transition-all duration-300 cursor-pointer ${isIncomesExpanded ? 'pb-8' : ''}`}
          >
             <div className="flex justify-between items-center mb-2">
               <p className="text-[9px] font-black text-emerald-800 opacity-60 uppercase">Entrate {now.toLocaleString('it-IT', { month: 'long' })}</p>
               <div className={`transition-transform duration-300 ${isIncomesExpanded ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
               </div>
             </div>
             <p className="text-2xl font-black text-emerald-600">€{formatVal(totalIncomes)}</p>
             
             {isIncomesExpanded && (
               <div className="mt-4 pt-4 border-t border-emerald-100 space-y-3 animate-in fade-in duration-300">
                  {Object.entries(accountIncomeBreakdown).map(([accId, amount]) => {
                    const acc = accounts.find(a => a.id === accId);
                    return (
                      <div key={accId} className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-emerald-800 opacity-50 uppercase">{acc?.name || 'Altro'}</span>
                        <span className="text-xs font-black text-emerald-600">€{formatVal(amount)}</span>
                      </div>
                    );
                  })}
                  {Object.keys(accountIncomeBreakdown).length === 0 && <p className="text-[9px] text-emerald-800 opacity-40 italic">Nessun movimento</p>}
               </div>
             )}
          </div>

          <div 
            onClick={() => setIsExpensesExpanded(!isExpensesExpanded)}
            className={`bg-rose-50 rounded-[2rem] p-5 border border-rose-100 transition-all duration-300 cursor-pointer ${isExpensesExpanded ? 'pb-8' : ''}`}
          >
             <div className="flex justify-between items-center mb-2">
               <p className="text-[9px] font-black text-rose-800 opacity-60 uppercase">Uscite {now.toLocaleString('it-IT', { month: 'long' })}</p>
               <div className={`transition-transform duration-300 ${isExpensesExpanded ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
               </div>
             </div>
             <p className="text-2xl font-black text-rose-500">€{formatVal(totalExpenses)}</p>
             
             {isExpensesExpanded && (
               <div className="mt-4 pt-4 border-t border-rose-100 space-y-3 animate-in fade-in duration-300">
                  {Object.entries(accountExpenseBreakdown).map(([accId, amount]) => {
                    const acc = accounts.find(a => a.id === accId);
                    return (
                      <div key={accId} className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-rose-800 opacity-50 uppercase">{acc?.name || 'Altro'}</span>
                        <span className="text-xs font-black text-rose-500">€{formatVal(amount)}</span>
                      </div>
                    );
                  })}
                  {Object.keys(accountExpenseBreakdown).length === 0 && <p className="text-[9px] text-rose-800 opacity-40 italic">Nessun movimento</p>}
               </div>
             )}
          </div>
        </section>
      )}

      {visibleWidgets.categoryPie && expenseCategoryData.length > 0 && (
        <section className="bg-white rounded-[2.5rem] p-6 border theme-border shadow-sm">
          <h3 className="text-[10px] font-black opacity-40 uppercase mb-4 tracking-widest">Spese per Categoria</h3>
          <div className="flex items-center gap-4 h-48">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="amount"
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `€${formatVal(value)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 overflow-y-auto max-h-40 no-scrollbar">
              {expenseCategoryData.slice(0, 5).map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[10px] font-black truncate text-[#4A453E] flex-1">{cat.name}</span>
                  <span className="text-[10px] font-black opacity-40">€{formatVal(cat.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {visibleWidgets.dailyTrend && dailyData.some(d => d.amount > 0) && (
        <div className="bg-white rounded-[2.5rem] p-6 border theme-border shadow-sm">
          <h3 className="text-[10px] font-black opacity-40 uppercase mb-6 tracking-widest">Analisi Giornaliera ({now.toLocaleString('it-IT', { month: 'long' })})</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#918B82', fontSize: 9, fontWeight: 900}} interval={2} />
                <Tooltip cursor={{fill: '#F1EBE3'}} formatter={(value: number) => `€${formatVal(value)}`} />
                <Bar dataKey="amount" fill="var(--primary)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {visibleWidgets.monthlyTrend && chartData.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-6 border theme-border shadow-sm">
          <h3 className="text-[10px] font-black opacity-40 uppercase mb-6 tracking-widest">Trend Ultimi 6 Mesi</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#918B82', fontSize: 10, fontWeight: 900}} />
                <Tooltip cursor={{fill: '#F1EBE3'}} formatter={(value: number) => `€${formatVal(value)}`} />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 4, 4]} barSize={10} />
                <Bar dataKey="total" fill="#F43F5E" radius={[4, 4, 4, 4]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
