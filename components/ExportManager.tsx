
import React, { useState, useMemo, useEffect } from 'react';
import { Expense, Income, Category, Account, ViewType } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportHistoryItem {
  id: string;
  filename: string;
  timestamp: string;
  type: 'EXCEL' | 'CSV' | 'PDF';
  period: string;
}

interface ExportManagerProps {
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  accounts: Account[];
  onNavigate: (view: ViewType) => void;
  onBack: () => void;
  onOpenSidebar: () => void;
}

const ExportManager: React.FC<ExportManagerProps> = ({ 
  expenses, incomes, categories, accounts, onNavigate, onBack, onOpenSidebar 
}) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [dataType, setDataType] = useState<'all' | 'expenses' | 'incomes'>('all');
  const [history, setHistory] = useState<ExportHistoryItem[]>(() => {
    const saved = localStorage.getItem('export_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [confirmExport, setConfirmExport] = useState<{ format: 'EXCEL' | 'CSV' | 'PDF' } | null>(null);

  useEffect(() => {
    localStorage.setItem('export_history', JSON.stringify(history));
  }, [history]);

  const filteredData = useMemo(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    const filteredExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });
    const filteredIncomes = incomes.filter(i => {
      const d = new Date(i.date);
      return d >= start && d <= end;
    });
    const merged = [
      ...filteredExpenses.map(e => ({ ...e, type: 'SPESA' as const })),
      ...filteredIncomes.map(i => ({ ...i, type: 'ENTRATA' as const, categoryId: 'income' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { expenses: filteredExpenses, incomes: filteredIncomes, merged };
  }, [expenses, incomes, dateRange]);

  const handleExportRequest = (format: 'EXCEL' | 'CSV' | 'PDF') => {
    setConfirmExport({ format });
  };

  const executeExport = () => {
    if (!confirmExport) return;
    const format = confirmExport.format;
    const fileName = `FinTrack_${format}_${dateRange.start}_${dateRange.end}`;
    if (format === 'PDF') {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(74, 69, 62);
      doc.text("FinTrack - Report Finanziario", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(145, 139, 130);
      doc.text(`Periodo: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`, 14, 28);
      const totalExp = filteredData.expenses.reduce((s, e) => s + e.amount, 0);
      const totalInc = filteredData.incomes.reduce((s, i) => s + i.amount, 0);
      doc.setFontSize(10);
      doc.setTextColor(74, 69, 62);
      doc.text(`Entrate: EUR ${totalInc.toFixed(2)} | Uscite: EUR ${totalExp.toFixed(2)}`, 14, 40);
      const tableData = filteredData.merged.map(item => {
        const isExpense = item.type === 'SPESA';
        const cat = categories.find(c => c.id === (item as any).categoryId)?.name || (isExpense ? 'Sconosciuta' : 'Accredito');
        const acc = accounts.find(a => a.id === item.accountId)?.name || 'Sconosciuto';
        return [new Date(item.date).toLocaleDateString('it-IT'), item.type, cat, acc, `${isExpense ? '-' : '+'} ${item.amount.toFixed(2)}`, item.notes || '-'];
      });
      autoTable(doc, {
        startY: 50,
        head: [['Data', 'Tipo', 'Categoria', 'Conto', 'Importo (€)', 'Note']],
        body: tableData,
        headStyles: { fillColor: [142, 124, 104], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [250, 247, 242] },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const val = data.cell.text[0];
            if (val.startsWith('-')) data.cell.styles.textColor = [244, 63, 94];
            if (val.startsWith('+')) data.cell.styles.textColor = [16, 185, 129];
          }
        }
      });
      doc.save(`${fileName}.pdf`);
    } else {
      const isExcel = format === 'EXCEL';
      const separator = isExcel ? ';' : ',';
      const decimalSep = isExcel ? ',' : '.';
      let csvContent = isExcel ? '\uFEFF' : '';
      csvContent += ['Tipo', 'Data', 'Importo', 'Categoria', 'Conto', 'Note'].join(separator) + '\n';
      filteredData.merged.forEach(item => {
        const isExp = item.type === 'SPESA';
        const cat = categories.find(c => c.id === (item as any).categoryId)?.name || (isExp ? 'Sconosciuta' : 'Accredito');
        const acc = accounts.find(a => a.id === item.accountId)?.name || 'Sconosciuto';
        csvContent += [item.type, new Date(item.date).toLocaleDateString('it-IT'), item.amount.toFixed(2).replace('.', decimalSep), cat, acc, `"${(item.notes || '').replace(/"/g, '""')}"`].join(separator) + '\n';
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}.csv`);
      link.click();
      URL.revokeObjectURL(url);
    }
    const newItem: ExportHistoryItem = { id: crypto.randomUUID(), filename: `${fileName}.${format.toLowerCase() === 'excel' ? 'csv' : format.toLowerCase()}`, timestamp: new Date().toISOString(), type: format, period: `${dateRange.start} - ${dateRange.end}` };
    setHistory(prev => [newItem, ...prev].slice(0, 10));
    setConfirmExport(null);
  };

  return (
    <div className="px-5 pt-12 space-y-8 pb-32 animate-in fade-in duration-500">
      {confirmExport && (
        <div className="fixed inset-0 bg-[#4A453E]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs rounded-[2rem] p-6 shadow-2xl space-y-6 animate-in zoom-in duration-300">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-[#4A453E]">Esportazione FinTrack</h3>
              <p className="text-sm opacity-60 font-medium">Procedere con l'estrazione {confirmExport.format}?</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={executeExport} className="w-full py-3.5 theme-bg-primary text-white rounded-2xl font-bold active:scale-95 transition-transform">Sì, procedi</button>
              <button onClick={() => setConfirmExport(null)} className="w-full py-3.5 theme-sub-bg opacity-60 rounded-2xl font-bold">No</button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 theme-primary -ml-2 active:opacity-50 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-lg font-medium">Indietro</span>
          </button>
          <button 
            onClick={onOpenSidebar}
            className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E]">Esporta Dati</h1>
      </header>

      <div className="theme-card rounded-[2.5rem] p-6 space-y-6">
        <div>
          <label className="block text-[10px] font-black theme-primary uppercase mb-3 tracking-[0.1em]">Intervallo di Tempo</label>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="w-full theme-sub-bg p-3 rounded-2xl theme-primary font-bold text-sm" />
            <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="w-full theme-sub-bg p-3 rounded-2xl theme-primary font-bold text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => handleExportRequest('PDF')} className="bg-rose-400 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform text-[10px] uppercase">PDF</button>
          <button onClick={() => handleExportRequest('EXCEL')} className="bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform text-[10px] uppercase">Excel</button>
          <button onClick={() => handleExportRequest('CSV')} className="theme-bg-primary text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform text-[10px] uppercase">CSV</button>
        </div>
      </div>
    </div>
  );
};

export default ExportManager;
