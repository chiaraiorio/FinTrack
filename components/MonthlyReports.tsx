
import React, { useMemo, useState } from 'react';
import { Expense, Income, Category, Account, ViewType } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MonthlyReportsProps {
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  accounts: Account[];
  onNavigate: (view: ViewType) => void;
  onBack: () => void;
  onOpenSidebar: () => void;
}

interface MonthlyReport {
  month: number;
  year: number;
  monthName: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
  isCompleted: boolean;
}

const MonthlyReports: React.FC<MonthlyReportsProps> = ({ 
  expenses, incomes, categories, accounts, onNavigate, onBack, onOpenSidebar 
}) => {
  const [confirmData, setConfirmData] = useState<{ report: MonthlyReport; format: 'EXCEL' | 'CSV' | 'PDF' } | null>(null);

  const reports = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const allDates = [...expenses.map(e => new Date(e.date)), ...incomes.map(i => new Date(i.date))];
    if (allDates.length === 0) return [];
    const oldestDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    let iterDate = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1);
    const endDate = new Date(currentYear, currentMonth, 1);
    const tempReports: MonthlyReport[] = [];
    while (iterDate < endDate) {
      const m = iterDate.getMonth();
      const y = iterDate.getFullYear();
      const monthExpenses = expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === m && d.getFullYear() === y; });
      const monthIncomes = incomes.filter(i => { const d = new Date(i.date); return d.getMonth() === m && d.getFullYear() === y; });
      const totalEx = monthExpenses.reduce((s, e) => s + e.amount, 0);
      const totalIn = monthIncomes.reduce((s, i) => s + i.amount, 0);
      tempReports.push({ month: m, year: y, monthName: iterDate.toLocaleString('it-IT', { month: 'long' }), totalExpense: totalEx, totalIncome: totalIn, net: totalIn - totalEx, isCompleted: true });
      iterDate.setMonth(iterDate.getMonth() + 1);
    }
    return tempReports.reverse();
  }, [expenses, incomes]);

  const executeDownload = () => {
    if (!confirmData) return;
    const { report, format } = confirmData;
    const fileName = `Report_${report.monthName}_${report.year}`;
    if (format === 'PDF') {
      const doc = new jsPDF();
      doc.text(`FinTrack - ${report.monthName} ${report.year}`, 14, 20);
      doc.text(`Entrate: EUR ${report.totalIncome.toFixed(2)} | Uscite: EUR ${report.totalExpense.toFixed(2)}`, 14, 30);
      doc.save(`${fileName}.pdf`);
    } else {
      const csv = `Tipo;Data;Importo;Categoria;Conto\n` + expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === report.month && d.getFullYear() === report.year; }).map(e => `USCITA;${e.date};${e.amount};${categories.find(c => c.id === e.categoryId)?.name};${accounts.find(a => a.id === e.accountId)?.name}`).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `${fileName}.csv`; link.click();
    }
    setConfirmData(null);
  };

  return (
    <div className="px-5 pt-12 space-y-8 pb-32 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4">
        <div className="flex justify-start items-center">
          <button 
            onClick={onOpenSidebar}
            className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E]">Report Mensili</h1>
      </header>

      <div className="space-y-4">
        {reports.length === 0 ? (
           <div className="text-center py-20 opacity-40 italic">Nessun dato disponibile per i report.</div>
        ) : reports.map((report, idx) => (
          <div key={idx} className="theme-card rounded-[2.5rem] p-6 space-y-4 shadow-sm border theme-border bg-white">
            <div className="flex justify-between items-start">
              <h4 className="text-xl font-black text-[#4A453E] capitalize">{report.monthName} {report.year}</h4>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${report.net >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                {report.net >= 0 ? '+' : ''}{report.net.toFixed(0)}€
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setConfirmData({report, format: 'PDF'})} className="bg-rose-400 text-white py-3 rounded-2xl text-[10px] font-black uppercase active:scale-95 transition-transform">PDF</button>
              <button onClick={() => setConfirmData({report, format: 'EXCEL'})} className="bg-emerald-500 text-white py-3 rounded-2xl text-[10px] font-black uppercase active:scale-95 transition-transform">Excel</button>
              <button onClick={() => setConfirmData({report, format: 'CSV'})} className="theme-bg-primary text-white py-3 rounded-2xl text-[10px] font-black uppercase active:scale-95 transition-transform">CSV</button>
            </div>
          </div>
        ))}
      </div>

      {confirmData && (
        <div className="fixed inset-0 bg-[#4A453E]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl space-y-6 text-center">
            <h3 className="text-xl font-black text-[#4A453E]">Conferma Download</h3>
            <p className="text-sm text-[#918B82] font-medium leading-relaxed">
              Vuoi scaricare il report di {confirmData.report.monthName} in formato {confirmData.format}?
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={executeDownload} className="w-full py-4 theme-bg-primary text-white rounded-2xl font-black text-sm active:scale-95">Conferma</button>
              <button onClick={() => setConfirmData(null)} className="w-full py-4 theme-sub-bg text-[#918B82] rounded-2xl font-black text-sm active:scale-95">Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReports;
