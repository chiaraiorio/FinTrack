
import React, { useMemo, useState } from 'react';
import { Income, IncomeCategory, Account, ViewType } from '../types';
import CategoryIcon from './CategoryIcon';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface IncomeListProps {
  incomes: Income[];
  incomeCategories: IncomeCategory[];
  accounts: Account[];
  onOpenSidebar: () => void;
  onNavigate: (view: ViewType) => void;
  onDeleteIncome: (id: string) => void;
  onEditIncome: (income: Income) => void;
  hideBalances: boolean;
}

type PeriodMode = 'day' | 'month' | 'year';

const IncomeList: React.FC<IncomeListProps> = ({ 
  incomes, incomeCategories, accounts, onOpenSidebar, 
  onDeleteIncome, onEditIncome, hideBalances
}) => {
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month');
  const [cursor, setCursor] = useState(new Date());

  const filteredData = useMemo(() => {
    return incomes.filter(i => {
      const d = new Date(i.date);
      if (periodMode === 'day') return d.toDateString() === cursor.toDateString();
      if (periodMode === 'month') return d.getMonth() === cursor.getMonth() && d.getFullYear() === cursor.getFullYear();
      return d.getFullYear() === cursor.getFullYear();
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomes, periodMode, cursor]);

  const total = useMemo(() => filteredData.reduce((s, i) => s + i.amount, 0), [filteredData]);

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
    doc.text(`Report Entrate - ${label()}`, 14, 20);
    doc.text(`Totale: EUR ${total.toFixed(2)}`, 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [['Data', 'Categoria', 'Conto', 'Importo', 'Note']],
      body: filteredData.map(i => [i.date, incomeCategories.find(c => c.id === i.categoryId)?.name || 'Altro', accounts.find(a => a.id === i.accountId)?.name || 'Conto', `€${i.amount.toFixed(2)}`, i.notes])
    });
    doc.save(`Entrate_${label().replace(/ /g, '_')}.pdf`);
  };

  return (
    <div className="px-5 pt-12 pb-40 animate-in fade-in">
      <header className="flex justify-between items-center mb-6">
        <button onClick={onOpenSidebar} className="w-10 h-10 theme-card rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
        <h1 className="text-xl font-black text-[#4A453E]">Le mie Entrate</h1>
        <button onClick={handleExport} className="w-10 h-10 theme-card rounded-xl flex items-center justify-center text-emerald-500">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>
      </header>

      <div className="flex bg-white rounded-2xl p-1 mb-6 border theme-border shadow-sm">
        {(['day', 'month', 'year'] as PeriodMode[]).map(m => (
          <button key={m} onClick={() => setPeriodMode(m)} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl ${periodMode === m ? 'bg-emerald-500 text-white shadow-md' : 'text-[#918B82]'}`}>
            {m === 'day' ? 'Giorno' : m === 'month' ? 'Mese' : 'Anno'}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between bg-white rounded-3xl p-5 border theme-border shadow-sm mb-8">
        <button onClick={() => changeCursor(-1)} className="p-2 text-emerald-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg></button>
        <div className="text-center">
          <h2 className="text-lg font-black text-[#4A453E] capitalize">{label()}</h2>
          <p className="text-[10px] font-bold text-emerald-500 uppercase">Totale: {hideBalances ? '€ ••' : `€${total.toLocaleString('it-IT')}`}</p>
        </div>
        <button onClick={() => changeCursor(1)} className="p-2 text-emerald-500"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></button>
      </div>

      <div className="space-y-3">
        {filteredData.map(i => {
          const cat = incomeCategories.find(c => c.id === i.categoryId);
          return (
            <div key={i.id} className="p-4 rounded-3xl flex items-center gap-4 border theme-border shadow-sm bg-white active:bg-gray-50 transition-all">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600">
                <CategoryIcon iconName={cat?.icon || 'generic'} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0" onClick={() => onEditIncome(i)}>
                <h4 className="font-black text-sm text-[#4A453E] truncate">{i.notes || cat?.name || 'Entrata'}</h4>
                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{accounts.find(a => a.id === i.accountId)?.name} • {i.date}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-emerald-600 text-sm">+{hideBalances ? '€ ••' : `€${i.amount.toLocaleString('it-IT')}`}</p>
                <div className="flex gap-2 justify-end mt-1">
                  <button onClick={() => onEditIncome(i)} className="text-[8px] font-bold uppercase text-sky-400">Modifica</button>
                  <button onClick={() => onDeleteIncome(i.id)} className="text-[8px] font-bold uppercase text-rose-300">Elimina</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IncomeList;
