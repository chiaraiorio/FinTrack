
import React, { useMemo } from 'react';
import { Expense, Category, Account, ViewType, Language } from '../types';
import CategoryIcon from './CategoryIcon';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  accounts: Account[];
  onOpenSidebar: () => void;
  selectedMonth: number;
  selectedYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  hideBalances: boolean;
  onToggleHideBalances: () => void;
  onNavigate: (view: ViewType) => void;
  onDeleteExpense: (id: string) => void;
  language: Language;
  showDecimals: boolean;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses, categories, accounts, onOpenSidebar, 
  selectedMonth, selectedYear, onPrevMonth, onNextMonth,
  hideBalances, onToggleHideBalances, onNavigate, onDeleteExpense,
  language, showDecimals
}) => {
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedMonth, selectedYear]);

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { month: 'long' });

  const formatAmount = (val: number) => {
    return showDecimals ? val.toFixed(2) : Math.round(val).toString();
  };

  const t = {
    it: { manage: 'Gestisci Categorie', total: 'Totale Uscite', recent: 'Uscite Recenti', none: 'Nessuna uscita registrata' },
    en: { manage: 'Manage Categories', total: 'Total Expenses', recent: 'Recent Expenses', none: 'No expenses recorded' }
  }[language];

  return (
    <div className="px-5 pt-12">
      <header className="mb-6 flex justify-between items-end">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <button 
              onClick={onOpenSidebar}
              className="w-10 h-10 theme-card rounded-full flex items-center justify-center mb-2 active:scale-90 transition-transform"
            >
              <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <button 
              onClick={() => onNavigate('search')}
              className="w-10 h-10 theme-card rounded-full flex items-center justify-center mb-2 active:scale-90 transition-transform"
            >
              <svg className="w-5 h-5 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-3">
             <div>
              <p className="opacity-60 font-bold text-xs uppercase tracking-tight ml-1">{selectedYear}</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E] capitalize">{monthName}</h1>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <button 
            onClick={() => onNavigate('categories')}
            className="theme-sub-bg theme-primary px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border theme-border"
          >
            {t.manage}
          </button>
          <div className="flex bg-white/50 ios-blur rounded-full p-1 shadow-sm border theme-border">
            <button onClick={onPrevMonth} className="p-2 theme-primary hover:bg-white rounded-full transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={onNextMonth} className="p-2 theme-primary hover:bg-white rounded-full transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </header>

      <div className="theme-card rounded-3xl p-6 mb-8 flex justify-between items-center group bg-rose-50 border-rose-100">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[11px] font-bold text-rose-800 opacity-60 uppercase">{t.total}</p>
            <button 
              onClick={onToggleHideBalances}
              className="text-rose-300 hover:text-rose-500 transition-colors"
            >
              {hideBalances ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>
          <p className="text-3xl font-bold text-rose-900">
            {hideBalances ? '€ ••••' : `€${formatAmount(filteredExpenses.reduce((s, e) => s + e.amount, 0))}`}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] font-bold opacity-60 uppercase ml-4 mb-2">{t.recent}</h3>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 opacity-30">
            <p className="font-semibold italic text-sm">{t.none}</p>
          </div>
        ) : (
          <div className="theme-card rounded-[2rem] overflow-hidden divide-y theme-border">
            {filteredExpenses.map(expense => {
              const cat = categories.find(c => c.id === expense.categoryId);
              const acc = accounts.find(a => a.id === expense.accountId);
              return (
                <div key={expense.id} className="p-4 flex items-center gap-4 active:bg-rose-50 transition-colors group">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${cat?.color || '#eee'}15` }}>
                    <CategoryIcon iconName={cat?.icon || 'generic'} color={cat?.color || '#F43F5E'} className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-[15px] text-[#4A453E]">
                          {cat?.name || 'Senza Categoria'}
                        </h4>
                        <p className="text-[11px] opacity-60 font-medium">
                          {new Date(expense.date).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'short' })}
                          {acc && ` • ${acc.name}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[16px] text-rose-600">
                          {hideBalances ? '-€ ••' : `-€${formatAmount(expense.amount)}`}
                        </span>
                        <button onClick={() => onDeleteExpense(expense.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[#D9D1C5] hover:text-rose-400 transition-all">
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
      <div className="pb-32"></div>
    </div>
  );
};

export default ExpenseList;
