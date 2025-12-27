
import React, { useMemo, useState } from 'react';
import { Expense, Category, Account, ViewType, Language } from '../types';
import CategoryIcon from './CategoryIcon';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  accounts: Account[];
  onOpenSidebar: () => void;
  onNavigate: (view: ViewType) => void;
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
  language: Language;
  showDecimals: boolean;
  hideBalances: boolean;
}

type PeriodMode = 'day' | 'month' | 'year';

const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses, categories, accounts, onOpenSidebar, 
  onDeleteExpense, onEditExpense, hideBalances
}) => {
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month');
  const [cursor, setCursor] = useState(new Date());

  const filteredData = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      if (periodMode === 'day') return d.toDateString() === cursor.toDateString();
      if (periodMode === 'month') return d.getMonth() === cursor.getMonth() && d.getFullYear() === cursor.getFullYear();
      return d.getFullYear() === cursor.getFullYear();
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, periodMode, cursor]);

  const total = useMemo(() => filteredData.reduce((s, e) => s + e.amount, 0), [filteredData]);

  const changeCursor = (delta: number) => {
    const next = new Date(cursor);
    if (periodMode === 'day') next.setDate(next.getDate() + delta);
    else if (periodMode === 'month') next.setMonth(next.getMonth() + delta);
    else next.setFullYear(next.getFullYear() + delta);
    setCursor(next);
  };

  const label = () => {
    if (periodMode === 'day') return cursor.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    if (periodMode === 'month') return cursor.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
    return cursor.getFullYear().toString();
  };

  const handleExport = () => {
    const doc = new jsPDF();
    doc.text(`Report Uscite - ${label()}`, 14, 20);
    doc.text(`Totale: EUR ${total.toFixed(2)}`, 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [['Data', 'Categoria', 'Conto', 'Importo', 'Note']],
      body: filteredData.map(e => [e.date, categories.find(c => c.id === e.categoryId)?.name || 'Altro', accounts.find(a => a.id === e.accountId)?.name || 'Conto', `€${e.amount.toFixed(2)}`, e.notes])
    });
    doc.save(`Uscite_${label().replace(/ /g, '_')}.pdf`);
  };

  return (
    <div className="px-5 pt-12 pb-40 animate-in fade-in">
      <header className="flex justify-between items-center mb-6">
        <button onClick={onOpenSidebar} className="w-10 h-10 theme-card rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
        <h1 className="text-xl font-black text-[#4A453E]">Le mie Uscite</h1>
        <button onClick={handleExport} className="w-10 h-10 theme-card rounded-xl flex items-center justify-center text-rose-500">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>
      </header>

      <div className="flex bg-white rounded-2xl p-1 mb-6 border theme-border shadow-sm">
        {(['day', 'month', 'year'] as PeriodMode[]).map(m => (
          <button key={m} onClick={() => setPeriodMode(m)} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl ${periodMode === m ? 'theme-bg-primary text-white shadow-md' : 'text-[#918B82]'}`}>
            {m === 'day' ? 'Giorno' : m === 'month' ? 'Mese' : 'Anno'}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between bg-white rounded-3xl p-5 border theme-border shadow-sm mb-8">
        <button onClick={() => changeCursor(-1)} className="p-2 theme-primary"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg></button>
        <div className="text-center">
          <h2 className="text-lg font-black text-[#4A453E] capitalize">{label()}</h2>
          <p className="text-[10px] font-bold theme-primary uppercase">Totale: {hideBalances ? '€ ••' : `€${total.toLocaleString('it-IT')}`}</p>
        </div>
        <button onClick={() => changeCursor(1)} className="p-2 theme-primary"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></button>
      </div>

      <div className="space-y-3">
        {filteredData.map(e => {
          const cat = categories.find(c => c.id === e.categoryId);
          return (
            <div key={e.id} className="p-4 rounded-3xl flex items-center gap-4 border theme-border shadow-sm bg-white active:scale-95 transition-all">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-500">
                <CategoryIcon iconName={cat?.icon || 'generic'} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm text-[#4A453E] truncate">{e.notes || cat?.name || 'Spesa'}</h4>
                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{accounts.find(a => a.id === e.accountId)?.name} • {e.date}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-rose-500 text-sm">-{hideBalances ? '€ ••' : `€${e.amount.toLocaleString('it-IT')}`}</p>
                <button onClick={() => onDeleteExpense(e.id)} className="text-[8px] font-bold uppercase text-rose-300">Elimina</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseList;
