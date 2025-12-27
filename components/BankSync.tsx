
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkApiKey = async () => {
    // @ts-ignore
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
    return true;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await checkApiKey();
    setUploadedFileName(file.name);
    setErrorMessage(null);
    setIsParsing(true);
    
    const reader = new FileReader();
    if (file.type === 'application/pdf') {
      reader.onload = async (event) => {
        try {
          const result = event.target?.result as string;
          const base64Data = result.split(',')[1];
          await processRequest({ file: { data: base64Data, mimeType: file.type } });
        } catch (err) {
          setErrorMessage("Errore nel caricamento del file.");
          setIsParsing(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        setInputText(content);
        await processRequest({ text: content });
      };
      reader.readAsText(file);
    }
  };

  const processRequest = async (input: BankParseInput) => {
    setErrorMessage(null);
    try {
      const results = await parseBankStatement(input, categories, incomeCategories);
      if (!results || !Array.isArray(results) || results.length === 0) {
        setErrorMessage("L'AI non ha trovato movimenti. Se il PDF è una scansione (immagine), l'estrazione potrebbe fallire.");
        setUploadedFileName(null);
      } else {
        const validResults = results.map(r => ({ 
          ...r, 
          disabled: false,
          accountId: defaultAccountId 
        }));
        setPreviewData(validResults);
      }
    } catch (error: any) {
      console.error("Sync Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        // @ts-ignore
        if (window.aistudio) await window.aistudio.openSelectKey();
        setErrorMessage("Errore di autorizzazione API. Seleziona una chiave valida.");
      } else {
        setErrorMessage("L'analisi ha richiesto troppo tempo o il file è troppo complesso. Prova con un estratto conto più breve.");
      }
      setUploadedFileName(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleStartParsing = async () => {
    if (!inputText.trim()) return;
    setIsParsing(true);
    await checkApiKey();
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

  return (
    <div className="px-5 pt-12 space-y-8 pb-32 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4">
        <button onClick={onOpenSidebar} className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-sm">
          <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
        <div>
          <h1 className="text-4xl font-extrabold text-[#4A453E] tracking-tight">Importa PDF</h1>
          <p className="text-sm text-[#918B82] font-medium leading-relaxed mt-2">Digitalizzazione intelligente per Fineco, BPER e conti italiani.</p>
        </div>
      </header>

      {!previewData ? (
        <div className="space-y-6">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-xs font-bold animate-in shake duration-500">
              {errorMessage}
            </div>
          )}

          <div className="theme-card rounded-[2.5rem] p-6 bg-white border theme-border shadow-sm space-y-4">
             <label className="text-[10px] font-black theme-primary uppercase tracking-widest px-1">Accredita su:</label>
             <div className="relative">
               <select 
                 className="w-full p-4 theme-sub-bg rounded-2xl font-bold theme-primary outline-none appearance-none pr-10"
                 value={defaultAccountId}
                 onChange={e => setDefaultAccountId(e.target.value)}
                 disabled={isParsing}
               >
                 {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
               </div>
             </div>
          </div>

          <div className="theme-card rounded-[2.5rem] p-6 bg-white border theme-border shadow-sm space-y-5">
            <div 
              onClick={() => !isParsing && fileInputRef.current?.click()}
              className={`border-2 border-dashed theme-border rounded-3xl p-10 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer group ${uploadedFileName ? 'bg-emerald-50/30 border-emerald-200' : ''} ${isParsing ? 'opacity-50 cursor-wait' : ''}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${uploadedFileName ? 'bg-emerald-100 text-emerald-600' : 'theme-sub-bg theme-primary'}`}>
                {isParsing ? (
                  <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : uploadedFileName ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                )}
              </div>
              <p className="text-xs font-black text-[#4A453E] text-center px-4">
                {isParsing ? 'Analisi profonda in corso...' : (uploadedFileName || 'Seleziona PDF o trascina qui')}
              </p>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
            </div>

            <div className="relative pt-4">
              <label className="text-[10px] font-black opacity-30 uppercase tracking-widest px-1 mb-2 block">Oppure copia/incolla il testo</label>
              <textarea 
                className="w-full h-32 p-4 pt-4 theme-sub-bg rounded-2xl font-medium text-sm outline-none resize-none placeholder:text-[#D9D1C5] focus:ring-2 focus:ring-current theme-primary shadow-inner"
                placeholder="Es: 12/05/2024 Pagamento Amazon -€25,90..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                disabled={isParsing}
              />
            </div>

            <button 
              onClick={handleStartParsing}
              disabled={isParsing || (!inputText.trim() && !uploadedFileName)}
              className="w-full py-5 theme-bg-primary text-white rounded-3xl font-black text-[15px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isParsing ? 'Leggo i dati...' : 'Analizza con Gemini Pro'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="flex justify-between items-center px-2">
            <div>
              <h3 className="font-black text-xl text-[#4A453E]">Conferma Movimenti</h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Tocca per escludere righe</p>
            </div>
            <span className="bg-white border theme-border px-3 py-1.5 rounded-full text-[10px] font-black theme-primary shadow-sm">
              {previewData.filter(d => !d.disabled).length} RIGHE
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
                  className={`p-4 rounded-[2rem] flex items-center gap-4 border transition-all ${t.disabled ? 'opacity-30 bg-gray-100 grayscale scale-[0.98]' : 'bg-white border-white shadow-sm active:scale-[0.99]'}`}
                  onClick={() => toggleItemSelection(idx)}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${isExpense ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    <CategoryIcon iconName={cat?.icon || 'generic'} color={isExpense ? '#EF4444' : '#10B981'} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px] text-[#4A453E] truncate leading-tight">{t.notes}</p>
                    <p className="text-[9px] opacity-40 font-black uppercase tracking-tight">{t.date} • {cat?.name || 'Altro'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm ${isExpense ? 'text-red-500' : 'text-emerald-600'}`}>
                      {isExpense ? '-' : '+'}€{Number(t.amount).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
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
              Importa in {accounts.find(a => a.id === defaultAccountId)?.name}
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
