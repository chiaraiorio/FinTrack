
import React, { useMemo } from 'react';
import { Income, IncomeCategory, Account, ViewType } from '../types';
import CategoryIcon from './CategoryIcon';

interface IncomeListProps {
  incomes: Income[];
  incomeCategories: IncomeCategory[];
  accounts: Account[];
  onOpenSidebar: () => void;
  selectedMonth: number;
  selectedYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  hideBalances: boolean;
  onToggleHideBalances: () => void;
  onNavigate: (view: ViewType) => void;
  onDeleteIncome: (id: string) => void;
  onEditIncome: (income: Income) => void;
  showDecimals: boolean;
}

const IncomeList: React.FC<IncomeListProps> = ({ 
  incomes, incomeCategories, accounts, onOpenSidebar, 
  selectedMonth, selectedYear, onPrevMonth, onNextMonth,
  hideBalances, onToggleHideBalances, onDeleteIncome, onEditIncome,
  onNavigate
}) => {
  const { groupedIncomes, monthTotal } = useMemo(() => {
    const filtered = incomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const groups: Record<string, Income[]> = {};
    let total = 0;
    filtered.forEach(i => {
      if (!groups[i.date]) groups[i.date] = [];
      groups[i.date].push(i);
      total += i.amount;
    });
    return { groupedIncomes: groups, monthTotal: total };
  }, [incomes, selectedMonth, selectedYear]);

  const monthName = new Date(selectedYear, selectedMonth).toLocaleString('it-IT', { month: 'long' });

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Oggi';
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="px-5 pt-12">
      <header className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={onOpenSidebar} className="w-10 h-10 theme-card rounded-xl flex items-center justify-center active:scale-90 transition-transform">
            <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <button onClick={() => onNavigate('search')} className="w-10 h-10 theme-card rounded-xl flex items-center justify-center active:scale-90 transition-transform">
            <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>
        <div className="text-right">
          <h1 className="text-xl font-black text-[#4A453E] tracking-tighter">Entrate</h1>
        </div>
      </header>

      {/* NUOVO SELETTORE MESE CENTRATO */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-4 border theme-border shadow-sm mb-6">
        <button onClick={onPrevMonth} className="p-2 theme-primary active:scale-90 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-black text-[#4A453E] capitalize leading-none">{monthName}</h2>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-1">{selectedYear}</p>
        </div>
        <button onClick={onNextMonth} className="p-2 theme-primary active:scale-90 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="bg-emerald-50 rounded-[2.5rem] p-6 mb-8 flex justify-between items-center border border-emerald-100">
        <div>
          <p className="text-[10px] font-black text-emerald-800 opacity-60 uppercase mb-1">Totale Entrate</p>
          <p className="text-3xl font-black text-emerald-700">
            {hideBalances ? '€ ••••' : `€${monthTotal.toLocaleString('it-IT')}`}
          </p>
        </div>
        <button onClick={onToggleHideBalances} className="text-emerald-300">
          {hideBalances ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
        </button>
      </div>

      <div className="space-y-8 pb-32">
        {Object.keys(groupedIncomes).sort((a, b) => b.localeCompare(a)).map(date => (
          <div key={date} className="space-y-3">
            <h3 className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] ml-2">{formatDateLabel(date)}</h3>
            <div className="space-y-3">
              {groupedIncomes[date].map(income => {
                const cat = incomeCategories.find(c => c.id === income.categoryId);
                const acc = accounts.find(a => a.id === income.accountId);
                return (
                  <div key={income.id} className={`p-4 rounded-3xl flex items-center gap-4 border theme-border shadow-sm bg-white`}>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600">
                      <CategoryIcon iconName={cat?.icon || 'generic'} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => onEditIncome(income)}>
                      <h4 className="font-black text-sm text-[#4A453E] truncate">{income.notes || (cat?.name || 'Senza Categoria')}</h4>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{acc?.name} • {cat?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600 text-sm">+{hideBalances ? '€ ••' : `€${income.amount.toLocaleString('it-IT')}`}</p>
                      <button onClick={() => onDeleteIncome(income.id)} className="text-[8px] font-black text-emerald-300 uppercase opacity-0 group-hover:opacity-100">Elimina</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {Object.keys(groupedIncomes).length === 0 && (
          <div className="text-center py-10 opacity-30 italic">Nessuna entrata trovata.</div>
        )}
      </div>
    </div>
  );
};

export default IncomeList;
