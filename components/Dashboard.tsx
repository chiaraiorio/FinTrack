
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Expense, Income, Category, Account, ViewType, SavingsJar } from '../types';
import CategoryIcon from './CategoryIcon';

interface DashboardProps {
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  accounts: Account[];
  onOpenSidebar: () => void;
  isDetailed?: boolean;
  onBack?: () => void;
  onNavigate?: (view: ViewType) => void;
  savingsJars?: SavingsJar[];
}

const WIDGETS = [
  { id: 'liquidity', label: 'Liquidità Totale', icon: '💰' },
  { id: 'summary', label: 'Riepilogo Bilancio', icon: '📊' },
  { id: 'savings', label: 'Obiettivi Risparmio', icon: '🎯' },
  { id: 'comparison', label: 'Confronto Performance', icon: '📈' },
  { id: 'trend', label: 'Trend Temporale', icon: '📉' },
  { id: 'pie', label: 'Suddivisione Categorie', icon: '🥧' }
];

const Dashboard: React.FC<DashboardProps> = ({ expenses, incomes, categories, accounts, onOpenSidebar, isDetailed = false, onBack, onNavigate, savingsJars = [] }) => {
  const [timeframe, setTimeframe] = useState<'month' | 'year'>('month');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [enabledWidgets, setEnabledWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    return saved ? JSON.parse(saved) : WIDGETS.map(w => w.id);
  });

  useEffect(() => {
    localStorage.setItem('dashboard_widgets', JSON.stringify(enabledWidgets));
  }, [enabledWidgets]);

  const toggleWidget = (id: string) => {
    setEnabledWidgets(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const isWidgetEnabled = (id: string) => enabledWidgets.includes(id);

  const comparisonStats = useMemo(() => {
    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();
    const prevMonthDate = new Date(currYear, currMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevMonthYear = prevMonthDate.getFullYear();
    const prevYear = currYear - 1;

    let expenseCurrMonth = 0; let expensePrevMonth = 0;
    let expenseCurrYear = 0; let expensePrevYear = 0;

    expenses.forEach(e => {
      const d = new Date(e.date);
      const m = d.getMonth();
      const y = d.getFullYear();
      if (m === currMonth && y === currYear) expenseCurrMonth += e.amount;
      if (m === prevMonth && y === prevMonthYear) expensePrevMonth += e.amount;
      if (y === currYear) expenseCurrYear += e.amount;
      if (y === prevYear) expensePrevYear += e.amount;
    });

    const calcDelta = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      month: { curr: expenseCurrMonth, prev: expensePrevMonth, delta: calcDelta(expenseCurrMonth, expensePrevMonth) },
      year: { curr: expenseCurrYear, prev: expensePrevYear, delta: calcDelta(expenseCurrYear, expensePrevYear) }
    };
  }, [expenses]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(e => {
      const cat = categories.find(c => c.id === e.categoryId);
      const name = cat ? cat.name : 'Altro';
      data[name] = (data[name] || 0) + e.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ 
      name, value,
      color: categories.find(c => c.name === name)?.color || '#B8B0A5'
    })).sort((a, b) => b.value - a.value);
  }, [expenses, categories]);

  const chartData = useMemo(() => {
    const data: Record<string, { total: number; income: number }> = {};
    const now = new Date();
    if (timeframe === 'month') {
      for(let i=5; i>=0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('it-IT', { month: 'short' });
        data[key] = { total: 0, income: 0 };
      }
      expenses.forEach(e => {
        const date = new Date(e.date);
        const key = date.toLocaleString('it-IT', { month: 'short' });
        if (data[key] !== undefined) data[key].total += e.amount;
      });
      incomes.forEach(inc => {
        const date = new Date(inc.date);
        const key = date.toLocaleString('it-IT', { month: 'short' });
        if (data[key] !== undefined) data[key].income += inc.amount;
      });
    } else {
      for(let i=2; i>=0; i--) {
        const key = (now.getFullYear() - i).toString();
        data[key] = { total: 0, income: 0 };
      }
      expenses.forEach(e => {
        const date = new Date(e.date);
        const key = date.getFullYear().toString();
        if (data[key] !== undefined) data[key].total += e.amount;
      });
      incomes.forEach(inc => {
        const date = new Date(inc.date);
        const key = date.getFullYear().toString();
        if (data[key] !== undefined) data[key].income += inc.amount;
      });
    }
    return Object.entries(data).map(([name, vals]) => ({ name, ...vals }));
  }, [expenses, incomes, timeframe]);

  const totalExpenses = categoryData.reduce((s, d) => s + d.value, 0);
  const totalIncomes = incomes.reduce((s, d) => s + d.amount, 0);
  const totalLiquidity = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="px-5 pt-12 space-y-8 pb-32 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <button onClick={onOpenSidebar} className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 hover:scale-110 transition-transform">
              <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <button 
              onClick={() => onNavigate && onNavigate('search')}
              className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 hover:scale-110 transition-transform"
            >
              <svg className="w-5 h-5 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
          
          <button 
            onClick={() => setShowCustomizer(true)}
            className="flex items-center gap-2 theme-sub-bg theme-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border theme-border active:scale-95 hover:scale-105 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Personalizza
          </button>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-black tracking-tight text-[#4A453E]">Dashboard</h1>
          <div className="flex bg-[#EBE4D8]/50 p-1 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#918B82]">
            <button onClick={() => setTimeframe('month')} className={`px-3 py-1.5 rounded-lg transition-all ${timeframe === 'month' ? 'bg-white text-[#8E7C68] shadow-sm' : ''}`}>Mesi</button>
            <button onClick={() => setTimeframe('year')} className={`px-3 py-1.5 rounded-lg transition-all ${timeframe === 'year' ? 'bg-white text-[#8E7C68] shadow-sm' : ''}`}>Anni</button>
          </div>
        </div>
      </header>

      {showCustomizer && (
        <div className="fixed inset-0 bg-[#4A453E]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-in zoom-in duration-300">
            <div className="text-center">
              <h3 className="text-xl font-black text-[#4A453E]">Gestione Dashboard</h3>
              <p className="text-[12px] text-[#918B82] font-medium mt-1">Scegli quali grafici e schede mostrare</p>
            </div>
            <div className="space-y-2">
              {WIDGETS.map(w => (
                <button 
                  key={w.id} 
                  onClick={() => toggleWidget(w.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${isWidgetEnabled(w.id) ? 'theme-bg-primary text-white border-transparent' : 'bg-gray-50 text-[#4A453E] border-[#EBE4D8]'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{w.icon}</span>
                    <span className="font-bold text-sm uppercase tracking-tight">{w.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isWidgetEnabled(w.id) ? 'bg-white border-white' : 'border-[#D9D1C5]'}`}>
                    {isWidgetEnabled(w.id) && <svg className="w-3 h-3 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowCustomizer(false)} className="w-full py-4 theme-bg-primary text-white rounded-2xl font-black text-sm active:scale-95 transition-transform">Fine</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isWidgetEnabled('liquidity') && (
          <div className="theme-card rounded-[2.5rem] p-6 shadow-sm border theme-border text-center bg-white animate-in zoom-in duration-500 hover:scale-[1.01] hover:shadow-md transition-all duration-300">
            <p className="text-[10px] font-black opacity-60 uppercase mb-1 tracking-[0.2em]">Liquidità Disponibile</p>
            <p className="text-4xl font-black text-sky-400 tracking-tighter">€{totalLiquidity.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
          </div>
        )}

        {isWidgetEnabled('summary') && (
          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom duration-500">
            <div className="bg-white rounded-[2rem] p-5 shadow-sm border theme-border hover:scale-[1.02] transition-transform duration-300">
              <p className="text-[9px] font-black opacity-60 uppercase mb-1 tracking-wider">Entrate Totali</p>
              <p className="text-xl font-black text-emerald-500">€{totalIncomes.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-[2rem] p-5 shadow-sm border theme-border hover:scale-[1.02] transition-transform duration-300">
              <p className="text-[9px] font-black opacity-60 uppercase mb-1 tracking-wider">Uscite Totali</p>
              <p className="text-xl font-black text-rose-400">€{totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      {isWidgetEnabled('savings') && savingsJars.length > 0 && (
        <section className="space-y-4 animate-in slide-in-from-bottom duration-500">
           <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black opacity-60 uppercase tracking-[0.15em]">Obiettivi Risparmio</h3>
              <button onClick={() => onNavigate && onNavigate('savings_jars')} className="text-[10px] font-black theme-primary uppercase tracking-widest">Tutti</button>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {savingsJars.slice(0, 3).map(jar => {
                const progress = Math.min(100, (jar.currentAmount / jar.targetAmount) * 100);
                return (
                  <div key={jar.id} className="min-w-[200px] bg-white rounded-[2rem] p-5 border theme-border shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 theme-sub-bg rounded-xl flex items-center justify-center theme-primary">
                        <CategoryIcon iconName={jar.icon} className="w-5 h-5" color="var(--primary)" />
                      </div>
                      <span className="font-bold text-sm text-[#4A453E] truncate">{jar.name}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black">
                        <span className="opacity-40 uppercase">Avanzamento</span>
                        <span className="theme-primary">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 theme-sub-bg rounded-full overflow-hidden">
                        <div className="h-full theme-bg-primary rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
           </div>
        </section>
      )}

      {isWidgetEnabled('comparison') && (
        <section className="space-y-4 animate-in slide-in-from-bottom duration-500">
          <h3 className="text-[10px] font-black opacity-60 uppercase tracking-[0.15em] ml-2">Confronto Performance</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-[2.5rem] p-6 border theme-border shadow-sm flex justify-between items-center hover:scale-[1.01] hover:shadow-md transition-all duration-300">
              <div className="space-y-1">
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Questo Mese vs Scorso</p>
                <p className="text-2xl font-black text-[#4A453E]">€{comparisonStats.month.curr.toFixed(2)}</p>
                <p className="text-[11px] font-medium text-[#918B82]">Mese scorso: €{comparisonStats.month.prev.toFixed(2)}</p>
              </div>
              <div className={`px-4 py-2 rounded-2xl flex items-center gap-1.5 ${comparisonStats.month.delta <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                <svg className={`w-4 h-4 ${comparisonStats.month.delta > 0 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="font-black text-sm">{Math.abs(comparisonStats.month.delta).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {isWidgetEnabled('trend') && (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border theme-border overflow-hidden animate-in slide-in-from-bottom duration-500 hover:scale-[1.01] hover:shadow-md transition-all duration-300">
          <h3 className="text-[10px] font-black opacity-60 uppercase mb-6 tracking-[0.15em]">Trend {timeframe === 'month' ? 'Mensile' : 'Annuale'}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#918B82', fontSize: 10, fontWeight: 900}} />
                <Tooltip cursor={{fill: '#F1EBE3'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 'bold' }} />
                <Bar dataKey="income" fill="#10B981" radius={[6, 6, 6, 6]} barSize={14} />
                <Bar dataKey="total" fill="#F43F5E" radius={[6, 6, 6, 6]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {isWidgetEnabled('pie') && (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border theme-border animate-in slide-in-from-bottom duration-500 hover:scale-[1.01] hover:shadow-md transition-all duration-300">
          <h3 className="text-[10px] font-black opacity-60 uppercase mb-6 tracking-[0.15em]">Suddivisione Spese</h3>
          <div className="h-56 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                  {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-black opacity-60 uppercase tracking-widest">Totale</span>
              <span className="text-2xl font-black text-[#4A453E] tracking-tighter">€{totalExpenses.toFixed(0)}</span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4">
            {categoryData.slice(0, 4).map(c => (
              <div key={c.name} className="flex flex-col p-3 rounded-2xl theme-sub-bg hover:bg-white hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></div>
                  <span className="text-[10px] font-black opacity-60 uppercase truncate">{c.name}</span>
                </div>
                <span className="text-sm font-black text-[#4A453E]">€{c.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!enabledWidgets.length && (
        <div className="py-20 text-center opacity-30 italic">
          Dashboard vuota. Clicca su "Personalizza" per aggiungere moduli.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
