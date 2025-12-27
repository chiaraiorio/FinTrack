
import React, { useState, useRef } from 'react';
import { parseBankStatement, BankParseInput } from '../services/geminiService';
import { Category, IncomeCategory, Account } from '../types';
import CategoryIcon from './CategoryIcon';

interface BankSyncProps {
  categories: Category[];
  incomeCategories: IncomeCategory[];
  accounts: Account[];
  onImport: (transactions: any[]) => void;
  onOpenSidebar: () => void;
}

const BankSync: React.FC<BankSyncProps> = ({ categories, incomeCategories, accounts, onImport, onOpenSidebar }) => {
  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [defaultAccountId, setDefaultAccountId] = useState(accounts[0]?.id || '');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = (event.target?.result as string).split(',')[1];
        processRequest({ file: { data: base64Data, mimeType: file.type } });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputText(content);
        processRequest({ text: content });
      };
      reader.readAsText(file);
    }
  };

  const processRequest = async (input: BankParseInput) => {
    setIsParsing(true);
    try {
      const results = await parseBankStatement(input, categories, incomeCategories);
      // Assegniamo il conto predefinito a tutti i movimenti inizialmente
      const validResults = results.filter(r => r.amount && r.date && r.type).map(r => ({ 
        ...r, 
        disabled: false,
        accountId: defaultAccountId 
      }));
      setPreviewData(validResults);
    } catch (error) {
      alert("Errore durante l'analisi. Se il PDF è protetto da password o è una scansione di bassa qualità, prova a copiare e incollare il testo.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleStartParsing = () => {
    if (!inputText.trim()) return;
    processRequest({ text: inputText });
  };

  const confirmImport = () => {
    if (!previewData) return;
    const selectedTransactions = previewData.filter(t => !t.disabled);
    
    if (selectedTransactions.length === 0) {
      alert("Nessun movimento selezionato.");
      return;
    }

    const finalData = selectedTransactions.map(t => ({ 
      ...t, 
      categoryId: t.categoryId || (t.type === 'SPESA' ? categories[0].id : incomeCategories[0].id)
    }));
    
    onImport(finalData);
    setPreviewData(null);
    setInputText('');
    setUploadedFileName(null);
  };

  const toggleItemSelection = (index: number) => {
    if (!previewData) return;
    const newData = [...previewData];
    newData[index].disabled = !newData[index].disabled;
    setPreviewData(newData);
  };

  const updateItemAccount = (index: number, accId: string) => {
    if (!previewData) return;
    const newData = [...previewData];
    newData[index].accountId = accId;
    setPreviewData(newData);
  };

  return (
    <div className="px-5 pt-12 space-y-8 pb-32 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4">
        <button onClick={onOpenSidebar} className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform">
          <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
        <div>
          <h1 className="text-4xl font-extrabold text-[#4A453E] tracking-tight">Importa Dati</h1>
          <p className="text-sm text-[#918B82] font-medium leading-relaxed mt-2">Digitalizza il tuo estratto conto e scegli su quali conti registrare i movimenti.</p>
        </div>
      </header>

      {!previewData ? (
        <div className="space-y-6">
          <div className="theme-card rounded-[2.5rem] p-6 bg-white border theme-border shadow-sm space-y-4">
             <label className="text-[10px] font-black theme-primary uppercase tracking-widest px-1">1. Conto Predefinito</label>
             <div className="relative">
               <select 
                 className="w-full p-4 theme-sub-bg rounded-2xl font-bold theme-primary outline-none appearance-none pr-10"
                 value={defaultAccountId}
                 onChange={e => setDefaultAccountId(e.target.value)}
               >
                 {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
               </div>
             </div>
          </div>

          <div className="theme-card rounded-[2.5rem] p-6 bg-white border theme-border shadow-sm space-y-5">
            <label className="text-[10px] font-black theme-primary uppercase tracking-widest px-1">2. Carica Documento</label>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed theme-border rounded-3xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer group ${uploadedFileName ? 'bg-emerald-50/30 border-emerald-200' : ''}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${uploadedFileName ? 'bg-emerald-100 text-emerald-600' : 'theme-sub-bg theme-primary'}`}>
                {uploadedFileName ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                )}
              </div>
              <p className="text-xs font-bold text-[#4A453E]">{uploadedFileName || 'Scegli PDF o Trascina'}</p>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.csv,.txt" />
            </div>

            <div className="relative">
              <textarea 
                className="w-full h-32 p-4 pt-4 theme-sub-bg rounded-2xl font-medium text-sm outline-none resize-none placeholder:text-[#D9D1C5] focus:ring-2 focus:ring-current theme-primary shadow-inner"
                placeholder="Oppure incolla qui il testo dei movimenti..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
            </div>

            <button 
              onClick={handleStartParsing}
              disabled={isParsing || (!inputText.trim() && !uploadedFileName)}
              className="w-full py-5 theme-bg-primary text-white rounded-3xl font-black text-[15px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isParsing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Analisi in corso...
                </>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Importa con AI
                </span>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="flex justify-between items-center px-2">
            <div>
              <h3 className="font-black text-xl text-[#4A453E]">Revisione</h3>
              <p className="text-[10px] font-bold theme-primary uppercase opacity-60">Puoi cambiare il conto per ogni riga</p>
            </div>
            <span className="bg-white border theme-border px-3 py-1.5 rounded-full text-[10px] font-black theme-primary shadow-sm">
              {previewData.filter(d => !d.disabled).length} MOVIMENTI
            </span>
          </div>
          
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 no-scrollbar pb-4">
            {previewData.map((t, idx) => {
              const isExpense = t.type === 'SPESA';
              const catList = isExpense ? categories : incomeCategories;
              const cat = catList.find(c => c.id === t.categoryId);
              
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-[2rem] flex flex-col gap-3 border transition-all ${t.disabled ? 'opacity-30 bg-gray-100 grayscale' : 'bg-white border-white shadow-sm'}`}
                >
                  <div className="flex items-center gap-4" onClick={() => toggleItemSelection(idx)}>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isExpense ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
                      <CategoryIcon iconName={cat?.icon || 'generic'} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer">
                      <p className="font-bold text-[13px] text-[#4A453E] truncate">{t.notes}</p>
                      <p className="text-[9px] opacity-40 font-black uppercase tracking-tighter">{t.date} • {cat?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-sm ${isExpense ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {isExpense ? '-' : '+'}€{t.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  
                  {!t.disabled && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                      <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      <select 
                        className="flex-1 bg-transparent text-[10px] font-black theme-primary uppercase outline-none appearance-none"
                        value={t.accountId}
                        onChange={e => updateItemAccount(idx, e.target.value)}
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <svg className="w-3 h-3 theme-primary opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={confirmImport} 
              className="w-full py-5 theme-bg-primary text-white rounded-3xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              Conferma Importazione
            </button>
            <button 
              onClick={() => { setPreviewData(null); setUploadedFileName(null); }} 
              className="w-full py-4 theme-sub-bg text-[#918B82] rounded-3xl font-bold active:scale-95 transition-all"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankSync;
