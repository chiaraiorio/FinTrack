
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, YAxis } from 'recharts';
import { Expense, Income, Category, Account } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface DashboardProps {
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  accounts: Account[];
  onOpenSidebar: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, incomes, categories, accounts, onOpenSidebar }) => {
  const [advice, setAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [timeframe, setTimeframe] = useState<'month' | 'year'>('month');

  useEffect(() => {
    const fetchAdvice = async () => {
      if (expenses.length === 0) return;
      setLoadingAdvice(true);
      const res = await getFinancialAdvice(expenses, categories, accounts);
      setAdvice(res);
      setLoadingAdvice(false);
    };
    fetchAdvice();
  }, [expenses, categories, accounts]);

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
    <div className="px-5 pt-12 space-y-8 pb-10">
      <header className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
           <button 
              onClick={onOpenSidebar}
              className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E]">Analisi</h1>
        </div>
        <div className="flex bg-[#EBE4D8]/50 p-1 rounded-xl text-[13px] font-bold text-[#918B82]">
          <button 
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 rounded-lg transition-all ${timeframe === 'month' ? 'bg-white text-[#8E7C68] shadow-sm' : ''}`}
          >
            Mesi
          </button>
          <button 
            onClick={() => setTimeframe('year')}
            className={`px-3 py-1 rounded-lg transition-all ${timeframe === 'year' ? 'bg-white text-[#8E7C68] shadow-sm' : ''}`}
          >
            Anni
          </button>
        </div>
      </header>

      <div className="space-y-4">
        <div className="theme-card rounded-3xl p-6 shadow-sm border theme-border text-center">
          <p className="text-[10px] font-bold opacity-60 uppercase mb-1 tracking-widest">Liquidità Totale</p>
          <p className="text-4xl font-black text-sky-400">€{totalLiquidity.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border theme-border">
            <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Entrate Totali</p>
            <p className="text-xl font-bold text-emerald-500">€{totalIncomes.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-3xl p-5 shadow-sm border theme-border">
            <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Uscite Totali</p>
            <p className="text-xl font-bold text-rose-400">€{totalExpenses.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {advice && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border theme-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <svg className="w-12 h-12 theme-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-[11px] font-bold theme-primary uppercase mb-2">Consulente AI</h3>
          {loadingAdvice ? (
            <div className="flex gap-1 py-2">
              <div className="w-1.5 h-1.5 theme-bg-primary opacity-40 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 theme-bg-primary opacity-40 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 theme-bg-primary opacity-40 rounded-full animate-bounce delay-200"></div>
            </div>
          ) : (
            <p className="text-[14px] font-medium leading-relaxed text-[#5D574F] italic">"{advice}"</p>
          )}
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border theme-border">
        <h3 className="text-[11px] font-bold opacity-60 uppercase mb-6">Trend {timeframe === 'month' ? 'Mensile' : 'Annuale'}</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700}} />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: 'var(--bg-app)'}} 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 'bold' }} 
              />
              <Bar dataKey="income" fill="#10B981" radius={[8, 8, 8, 8]} barSize={timeframe === 'month' ? 12 : 25} />
              <Bar dataKey="total" fill="#F43F5E" radius={[8, 8, 8, 8]} barSize={timeframe === 'month' ? 12 : 25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border theme-border">
        <h3 className="text-[11px] font-bold opacity-60 uppercase mb-6">Suddivisione Spese</h3>
        <div className="h-48 w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} innerRadius={55} outerRadius={75} paddingAngle={6} dataKey="value">
                {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold opacity-60 uppercase">Totale</span>
            <span className="text-2xl font-black text-[#4A453E]">€{totalExpenses.toFixed(0)}</span>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4">
          {categoryData.slice(0, 6).map(c => (
            <div key={c.name} className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></div>
                <span className="text-[12px] font-bold opacity-60 uppercase truncate">{c.name}</span>
              </div>
              <span className="text-base font-bold text-[#4A453E] ml-4">€{c.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
