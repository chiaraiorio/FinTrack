
import React, { useState, useMemo, useEffect } from 'react';
import { Expense, Income, Category, Account, ViewType, IncomeCategory } from '../types';
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
  incomeCategories: IncomeCategory[];
  accounts: Account[];
  onNavigate: (view: ViewType) => void;
  onBack: () => void;
  onOpenSidebar: () => void;
}

const ExportManager: React.FC<ExportManagerProps> = ({ 
  expenses, incomes, categories, incomeCategories, accounts, onNavigate, onBack, onOpenSidebar 
}) => {
  const [exportMode, setExportMode] = useState<'date' | 'month' | 'category'>('date');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
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
    let baseExpenses = [...expenses];
    let baseIncomes = [...incomes];

    // Filter by type
    if (dataType === 'expenses') baseIncomes = [];
    if (dataType === 'incomes') baseExpenses = [];

    // Filter by mode
    if (exportMode === 'date') {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      baseExpenses = baseExpenses.filter(e => { const d = new Date(e.date); return d >= start && d <= end; });
      baseIncomes = baseIncomes.filter(i => { const d = new Date(i.date); return d >= start && d <= end; });
    } else if (exportMode === 'month') {
      baseExpenses = baseExpenses.filter(e => { const d = new Date(e.date); return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear; });
      baseIncomes = baseIncomes.filter(i => { const d = new Date(i.date); return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear; });
    }

    // Filter by category
    if (selectedCategoryId !== 'all') {
      baseExpenses = baseExpenses.filter(e => e.categoryId === selectedCategoryId);
      baseIncomes = baseIncomes.filter(i => i.categoryId === selectedCategoryId);
    }

    const merged = [
      ...baseExpenses.map(e => ({ ...e, type: 'SPESA' as const })),
      ...baseIncomes.map(i => ({ ...i, type: 'ENTRATA' as const }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { expenses: baseExpenses, incomes: baseIncomes, merged };
  }, [expenses, incomes, dateRange, exportMode, selectedMonth, selectedYear, selectedCategoryId, dataType]);

  const handleExportRequest = (format: 'EXCEL' | 'CSV' | 'PDF') => {
    if (filteredData.merged.length === 0) {
      alert("Nessun dato trovato per i criteri selezionati.");
      return;
    }
    setConfirmExport({ format });
  };

  const executeExport = () => {
    if (!confirmExport) return;
    const format = confirmExport.format;
    const fileName = `FinTrack_${exportMode}_${new Date().getTime()}`;
    
    if (format === 'PDF') {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(74, 69, 62);
      doc.text("FinTrack - Estrazione Dati", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(145, 139, 130);
      const periodLabel = exportMode === 'date' ? `${dateRange.start} / ${dateRange.end}` : 
                          exportMode === 'month' ? `${selectedMonth + 1}/${selectedYear}` : 
                          `Categoria: ${[...categories, ...incomeCategories].find(c => c.id === selectedCategoryId)?.name || 'Tutte'}`;
      doc.text(`Filtro: ${exportMode.toUpperCase()} | Valore: ${periodLabel}`, 14, 28);
      
      const totalExp = filteredData.expenses.reduce((s, e) => s + e.amount, 0);
      const totalInc = filteredData.incomes.reduce((s, i) => s + i.amount, 0);
      doc.setFontSize(10);
      doc.setTextColor(74, 69, 62);
      doc.text(`Entrate: EUR ${totalInc.toFixed(2)} | Uscite: EUR ${totalExp.toFixed(2)} | Netto: EUR ${(totalInc - totalExp).toFixed(2)}`, 14, 40);
      
      const tableData = filteredData.merged.map(item => {
        const isExpense = item.type === 'SPESA';
        const catList = isExpense ? categories : incomeCategories;
        const cat = catList.find(c => c.id === (item as any).categoryId)?.name || 'Sconosciuta';
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
        const catList = isExp ? categories : incomeCategories;
        const cat = catList.find(c => c.id === (item as any).categoryId)?.name || 'Sconosciuta';
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

    const newItem: ExportHistoryItem = { 
      id: crypto.randomUUID(), 
      filename: `${fileName}.${format.toLowerCase() === 'excel' ? 'csv' : format.toLowerCase()}`, 
      timestamp: new Date().toISOString(), 
      type: format, 
      period: exportMode === 'date' ? `${dateRange.start} - ${dateRange.end}` : exportMode === 'month' ? `${selectedMonth + 1}/${selectedYear}` : 'Filtro Categoria'
    };
    setHistory(prev => [newItem, ...prev].slice(0, 5));
    setConfirmExport(null);
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
        <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E]">Esporta Dati</h1>
      </header>

      <div className="theme-card rounded-[2.5rem] p-6 space-y-6 bg-white border theme-border shadow-sm">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setExportMode('date')} 
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${exportMode === 'date' ? 'bg-white theme-primary shadow-sm' : 'text-gray-400'}`}
          >
            Date
          </button>
          <button 
            onClick={() => setExportMode('month')} 
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${exportMode === 'month' ? 'bg-white theme-primary shadow-sm' : 'text-gray-400'}`}
          >
            Mese
          </button>
          <button 
            onClick={() => setExportMode('category')} 
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${exportMode === 'category' ? 'bg-white theme-primary shadow-sm' : 'text-gray-400'}`}
          >
            Categoria
          </button>
        </div>

        {exportMode === 'date' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <label className="block text-[10px] font-black theme-primary uppercase tracking-[0.1em]">Intervallo Personalizzato</label>
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="w-full theme-sub-bg p-3 rounded-2xl theme-primary font-bold text-sm outline-none" />
              <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="w-full theme-sub-bg p-3 rounded-2xl theme-primary font-bold text-sm outline-none" />
            </div>
          </div>
        )}

        {exportMode === 'month' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <label className="block text-[10px] font-black theme-primary uppercase tracking-[0.1em]">Seleziona Mese ed Anno</label>
            <div className="grid grid-cols-2 gap-4">
              <select 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(parseInt(e.target.value))}
                className="w-full theme-sub-bg p-3 rounded-2xl theme-primary font-bold text-sm outline-none"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>{new Date(0, i).toLocaleString('it-IT', { month: 'long' })}</option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className="w-full theme-sub-bg p-3 rounded-2xl theme-primary font-bold text-sm outline-none"
              >
                {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        {exportMode === 'category' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <label className="block text-[10px] font-black theme-primary uppercase tracking-[0.1em]">Seleziona Categoria</label>
            <select 
              value={selectedCategoryId} 
              onChange={e => setSelectedCategoryId(e.target.value)}
              className="w-full theme-sub-bg p-3 rounded-2xl theme-primary font-bold text-sm outline-none"
            >
              <option value="all">Tutte le categorie</option>
              <optgroup label="Spese">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
              <optgroup label="Entrate">
                {incomeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
            </select>
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-[10px] font-black theme-primary uppercase tracking-[0.1em]">Tipo di Dati</label>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setDataType('all')} className={`py-2 rounded-xl text-[10px] font-bold uppercase border ${dataType === 'all' ? 'theme-bg-primary text-white border-transparent' : 'theme-sub-bg text-gray-400 theme-border'}`}>Tutti</button>
            <button onClick={() => setDataType('expenses')} className={`py-2 rounded-xl text-[10px] font-bold uppercase border ${dataType === 'expenses' ? 'theme-bg-primary text-white border-transparent' : 'theme-sub-bg text-gray-400 theme-border'}`}>Spese</button>
            <button onClick={() => setDataType('incomes')} className={`py-2 rounded-xl text-[10px] font-bold uppercase border ${dataType === 'incomes' ? 'theme-bg-primary text-white border-transparent' : 'theme-sub-bg text-gray-400 theme-border'}`}>Entrate</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4">
          <button onClick={() => handleExportRequest('PDF')} className="bg-rose-400 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-transform text-[10px] uppercase">PDF</button>
          <button onClick={() => handleExportRequest('EXCEL')} className="bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-transform text-[10px] uppercase">Excel</button>
          <button onClick={() => handleExportRequest('CSV')} className="theme-bg-primary text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-transform text-[10px] uppercase">CSV</button>
        </div>
      </div>

      {history.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-[11px] font-black opacity-60 uppercase ml-4">Cronologia Recente</h3>
          <div className="theme-card rounded-[2rem] overflow-hidden divide-y theme-border bg-white border">
            {history.map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-black text-[14px] text-[#4A453E] truncate max-w-[180px]">{item.filename}</p>
                  <p className="text-[10px] text-[#918B82] font-bold uppercase">{item.type} • {item.period}</p>
                </div>
                <div className="w-8 h-8 rounded-lg theme-sub-bg flex items-center justify-center text-[#918B82]">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {confirmExport && (
        <div className="fixed inset-0 bg-[#4A453E]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-in zoom-in duration-300">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-[#4A453E]">Conferma</h3>
              <p className="text-sm text-[#918B82] font-medium leading-relaxed">Procedere con l'estrazione {confirmExport.format} di {filteredData.merged.length} record?</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={executeExport} className="w-full py-4 theme-bg-primary text-white rounded-2xl font-black text-sm active:scale-95 transition-transform">Sì, esporta</button>
              <button onClick={() => setConfirmExport(null)} className="w-full py-4 theme-sub-bg text-[#918B82] rounded-2xl font-black text-sm active:scale-95 transition-transform">Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportManager;
