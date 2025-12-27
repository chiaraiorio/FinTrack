
import React, { useMemo } from 'react';
import { Expense, Category, ViewType, IncomeCategory } from '../types';
import CategoryIcon from './CategoryIcon';

interface BudgetSummaryProps {
  expenses: Expense[];
  categories: Category[];
  incomeCategories: IncomeCategory[];
  onUpdateCategory: (cat: Category) => void;
  onUpdateIncomeCategory: (cat: IncomeCategory) => void;
  onNavigate: (view: ViewType) => void;
  onOpenSidebar: () => void;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ 
  expenses, categories, incomeCategories, onUpdateCategory, onUpdateIncomeCategory, onNavigate, onOpenSidebar 
}) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const expenseStats = useMemo(() => {
    const monthlyExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && !e.isInternalTransfer;
    });

    return categories.map(cat => {
      const spent = monthlyExpenses
        .filter(e => e.categoryId === cat.id)
        .reduce((sum, e) => sum + e.amount, 0);
      return { ...cat, spent };
    });
  }, [expenses, categories, currentMonth, currentYear]);

  const handleExpenseBudgetChange = (cat: Category, newBudget: string) => {
    const budgetNum = parseFloat(newBudget);
    onUpdateCategory({ ...cat, budget: isNaN(budgetNum) ? undefined : budgetNum });
  };

  const handleIncomeBudgetChange = (cat: IncomeCategory, newBudget: string) => {
    const budgetNum = parseFloat(newBudget);
    onUpdateIncomeCategory({ ...cat, budget: isNaN(budgetNum) ? undefined : budgetNum });
  };

  return (
    <div className="px-5 pt-12 space-y-8 pb-40 animate-in fade-in duration-500">
      <header className="flex items-center gap-2">
        <button onClick={onOpenSidebar} className="w-10 h-10 theme-card rounded-xl flex items-center justify-center active:scale-90 transition-transform">
          <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
        <button onClick={() => onNavigate('search')} className="w-10 h-10 theme-card rounded-xl flex items-center justify-center active:scale-90 transition-transform">
          <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
        <div className="flex-1 text-right">
          <h1 className="text-xl font-black text-[#4A453E] tracking-tight">Categorie</h1>
        </div>
      </header>

      <div className="space-y-10">
        {/* USCITE (PRIMA) */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
            <h2 className="text-sm font-black text-[#4A453E] uppercase tracking-widest">Categorie Uscite</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {expenseStats.map(stat => (
              <div key={stat.id} className="bg-white p-4 rounded-[2rem] border theme-border shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-2xl theme-sub-bg flex items-center justify-center theme-primary flex-shrink-0">
                    <CategoryIcon iconName={stat.icon} className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h3 className="font-black text-[#4A453E] text-sm truncate">{stat.name}</h3>
                    <p className="text-[10px] font-bold opacity-40 uppercase">Speso: €{stat.spent.toLocaleString('it-IT')}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-xl border theme-border">
                    <span className="text-[9px] font-black opacity-30">€</span>
                    <input 
                        type="number"
                        value={stat.budget || ''}
                        onChange={(e) => handleExpenseBudgetChange(stat, e.target.value)}
                        placeholder="Imposta"
                        className="w-16 bg-transparent text-right font-black theme-primary outline-none text-xs placeholder:text-[#D9D1C5]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ENTRATE (DOPO) */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            <h2 className="text-sm font-black text-[#4A453E] uppercase tracking-widest">Categorie Entrate</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {incomeCategories.map(cat => (
              <div key={cat.id} className="bg-white p-4 rounded-[2rem] border theme-border shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <CategoryIcon iconName={cat.icon} className="w-5 h-5" color="#10B981" />
                  </div>
                  <div className="truncate">
                    <h3 className="font-black text-[#4A453E] text-sm truncate">{cat.name}</h3>
                    <p className="text-[10px] font-bold text-emerald-600/60 uppercase">Obiettivo Mensile</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1.5 bg-emerald-50/30 px-3 py-2 rounded-xl border border-emerald-100">
                    <span className="text-[9px] font-black text-emerald-300">€</span>
                    <input 
                        type="number"
                        value={cat.budget || ''}
                        onChange={(e) => handleIncomeBudgetChange(cat, e.target.value)}
                        placeholder="Target"
                        className="w-16 bg-transparent text-right font-black text-emerald-600 outline-none text-xs placeholder:text-emerald-200"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BudgetSummary;
