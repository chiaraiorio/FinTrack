
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
  const [timeframe, setTimeframe] = useState<'month' | 'year'>('month');
  const [isAssetsExpanded, setIsAssetsExpanded] = useState(false);
  const [isIncomeExpanded, setIsIncomeExpanded] = useState(false);
  const [isExpenseExpanded, setIsExpenseExpanded] = useState(false);

  // Filtriamo i trasferimenti interni per mostrare solo entrate/uscite REALI nel dashboard
  const realExpenses = useMemo(() => expenses.filter(e => !e.isInternalTransfer), [expenses]);
  const realIncomes = useMemo(() => incomes.filter(i => !i.isInternalTransfer), [incomes]);

  const totalExpenses = useMemo(() => realExpenses.reduce((s, e) => s + e.amount, 0), [realExpenses]);
  const totalIncomes = useMemo(() => realIncomes.reduce((s, i) => s + i.amount, 0), [realIncomes]);
  
  const totalLiquidity = useMemo(() => 
    accounts.reduce((s, a) => s + a.balance + a.cards.reduce((cs, c) => cs + c.balance, 0), 0), 
  [accounts]);

  // Suddivisione Uscite per Categoria
  const expenseCategoryData = useMemo(() => {
    const data: Record<string, { amount: number, icon: string, color: string }> = {};
    realExpenses.forEach(e => {
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
  }, [realExpenses, categories]);

  // Suddivisione Entrate per Categoria
  const incomeCategoryData = useMemo(() => {
    const data: Record<string, { amount: number, icon: string, color: string }> = {};
    realIncomes.forEach(i => {
      const cat = incomeCategories.find(c => c.id === i.categoryId);
      const name = cat ? cat.name : 'Altro';
      if (!data[name]) {
        data[name] = { amount: 0, icon: cat?.icon || 'generic', color: cat?.color || '#10B981' };
      }
      data[name].amount += i.amount;
    });
    return Object.entries(data)
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => b.amount - a.amount);
  }, [realIncomes, incomeCategories]);

  const chartData = useMemo(() => {
    const data: Record<string, { total: number; income: number }> = {};
    const now = new Date();
    if (timeframe === 'month') {
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
    }
    return Object.entries(data).map(([name, vals]) => ({ name, ...vals }));
  }, [realExpenses, realIncomes, timeframe]);

  return (
    <div className="px-5 pt-12 space-y-8 pb-32 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <button onClick={onOpenSidebar} className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform">
          <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
        <h1 className="text-2xl font-black text-[#4A453E]">Home</h1>
        <div className="w-10" />
      </header>

      <section className="space-y-4">
        {/* SCHEDA PATRIMONIO ESPANDIBILE */}
        <div 
          onClick={() => setIsAssetsExpanded(!isAssetsExpanded)}
          className={`theme-card rounded-[2.5rem] p-8 bg-white border theme-border shadow-sm transition-all duration-300 cursor-pointer active:scale-[0.98] ${isAssetsExpanded ? 'ring-2 ring-offset-2 theme-primary ring-opacity-20' : ''}`}
        >
          <div className="text-center relative">
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Patrimonio Totale</p>
            <p className="text-4xl font-black text-[#4A453E] tracking-tighter">€{totalLiquidity.toLocaleString('it-IT')}</p>
            
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
                    <p className="text-sm font-black text-[#4A453E]">€{accTotal.toLocaleString('it-IT')}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* ENTRATE ESPANDIBILI */}
          <div 
            onClick={() => setIsIncomeExpanded(!isIncomeExpanded)}
            className={`bg-emerald-50 rounded-[2.5rem] p-6 border border-emerald-100 transition-all duration-300 cursor-pointer active:scale-[0.98] ${isIncomeExpanded ? 'ring-2 ring-emerald-200' : ''}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-emerald-800 opacity-60 uppercase mb-1">Entrate Reali</p>
                <p className="text-2xl font-black text-emerald-600">€{totalIncomes.toLocaleString('it-IT')}</p>
              </div>
              <div className={`transition-transform duration-300 ${isIncomeExpanded ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            
            {isIncomeExpanded && (
              <div className="mt-6 pt-4 border-t border-emerald-100 space-y-3 animate-in slide-in-from-top-2">
                {incomeCategoryData.map(cat => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                        <CategoryIcon iconName={cat.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-900">{cat.name}</span>
                    </div>
                    <span className="text-[11px] font-black text-emerald-600">€{cat.amount.toLocaleString('it-IT')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* USCITE ESPANDIBILI */}
          <div 
            onClick={() => setIsExpenseExpanded(!isExpenseExpanded)}
            className={`bg-rose-50 rounded-[2.5rem] p-6 border border-rose-100 transition-all duration-300 cursor-pointer active:scale-[0.98] ${isExpenseExpanded ? 'ring-2 ring-rose-200' : ''}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-rose-800 opacity-60 uppercase mb-1">Spese Reali</p>
                <p className="text-2xl font-black text-rose-500">€{totalExpenses.toLocaleString('it-IT')}</p>
              </div>
              <div className={`transition-transform duration-300 ${isExpenseExpanded ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {isExpenseExpanded && (
              <div className="mt-6 pt-4 border-t border-rose-100 space-y-3 animate-in slide-in-from-top-2">
                {expenseCategoryData.map(cat => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-rose-500 shadow-sm">
                        <CategoryIcon iconName={cat.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-rose-900">{cat.name}</span>
                    </div>
                    <span className="text-[11px] font-black text-rose-600">€{cat.amount.toLocaleString('it-IT')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CHART TREND MENSILE */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-6 border theme-border shadow-sm">
          <h3 className="text-[10px] font-black opacity-40 uppercase mb-6 tracking-widest">Trend Mensile</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#918B82', fontSize: 10, fontWeight: 900}} />
                <Tooltip cursor={{fill: '#F1EBE3'}} />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 4, 4]} barSize={12} />
                <Bar dataKey="total" fill="#F43F5E" radius={[4, 4, 4, 4]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
