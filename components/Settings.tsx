
import React, { useState } from 'react';
import { Expense, Category, Account, ViewType, Language, AppSettings, TextSize, Income } from '../types';
import { ThemePalette } from '../App';

interface SettingsProps {
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  accounts: Account[];
  onClearData: () => void;
  onNavigate: (view: ViewType) => void;
  onGoToMenu: () => void;
  palettes: ThemePalette[];
  currentPalette: ThemePalette;
  onPaletteChange: (p: ThemePalette) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onGetSyncCode: () => string;
  onImportSync: (code: string, mode: 'merge' | 'replace') => boolean;
}

const Settings: React.FC<SettingsProps> = ({ 
  expenses, incomes, categories, accounts, onClearData, onNavigate, onGoToMenu, 
  palettes, currentPalette, onPaletteChange,
  language, onLanguageChange,
  settings, onUpdateSettings, onGetSyncCode, onImportSync
}) => {
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncCode, setSyncCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');

  const handleCopy = () => {
    const code = onGetSyncCode();
    setSyncCode(code);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = (mode: 'merge' | 'replace') => {
    if (!importText.trim()) return;
    
    const confirmMsg = mode === 'replace' 
      ? "ATTENZIONE: Questo cancellerà i dati su questo dispositivo per sostituirli con quelli nuovi. Continuare?"
      : "Questo unirà i dati dei due dispositivi evitando i duplicati. Continuare?";

    if (window.confirm(confirmMsg)) {
      if (onImportSync(importText, mode)) {
        alert("Sincronizzazione completata con successo!");
        setShowSyncModal(false);
        setImportText('');
      } else {
        alert("Codice di sincronizzazione non valido.");
      }
    }
  };

  return (
    <div className="px-5 pt-12 space-y-8 pb-32 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4">
        <button onClick={onGoToMenu} className="flex items-center gap-1 theme-primary -ml-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          <span className="text-lg font-medium">Indietro</span>
        </button>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E]">Impostazioni</h1>
      </header>

      {/* SYNC SECTION */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black opacity-60 uppercase ml-4 tracking-widest">Sincronizzazione Cloud (Manuale)</h3>
        <button 
          onClick={() => setShowSyncModal(true)}
          className="w-full theme-card rounded-[2rem] p-6 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v5m0 0l-2-2m2 2l2-2m-5-4l1-1m8 1l-1-1m-2-2l-1.414-1.414a2 2 0 00-2.828 0L10 7M7 10a5 5 0 010-10h10a5 5 0 010 10" /></svg>
            </div>
            <div className="text-left">
              <p className="font-bold text-[15px] text-[#4A453E]">Sincronizza Dispositivi</p>
              <p className="text-[10px] opacity-60 font-medium">Unisci o migra i tuoi dati</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-[#D9D1C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
        </button>
      </section>

      {/* THEME & OTHER SETTINGS */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black opacity-60 uppercase ml-4 tracking-widest">Tema App</h3>
        <div className="theme-card rounded-[2rem] p-6 shadow-sm flex gap-4 overflow-x-auto no-scrollbar">
          {palettes.map((p) => (
            <button 
              key={p.name}
              onClick={() => onPaletteChange(p)}
              className={`w-14 h-14 rounded-2xl flex-shrink-0 border-2 transition-all ${currentPalette.name === p.name ? 'scale-110 shadow-lg' : 'opacity-40'}`}
              style={{ borderColor: p.primary, backgroundColor: p.bg }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: p.primary }} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SYNC MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 space-y-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#4A453E]">Sincronizza</h2>
              <p className="text-[10px] text-[#918B82] font-black uppercase tracking-widest">Codice di Sincronizzazione</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-[#918B82] uppercase ml-1">Il tuo codice attuale:</p>
                <button 
                  onClick={handleCopy}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'theme-bg-primary text-white shadow-lg'}`}
                >
                  {copied ? 'Copiato!' : 'Copia Codice Sincro'}
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-bold text-[#918B82] uppercase ml-1">Importa da altro dispositivo:</p>
                <textarea 
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="Incolla il codice qui..."
                  className="w-full h-24 p-4 theme-sub-bg rounded-2xl text-[10px] font-mono outline-none border theme-border resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleImport('merge')}
                    className="py-3 bg-sky-50 text-sky-600 border border-sky-100 rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95"
                  >
                    Unisci Dati
                  </button>
                  <button 
                    onClick={() => handleImport('replace')}
                    className="py-3 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95"
                  >
                    Sostituisci
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => setShowSyncModal(false)} className="w-full text-center text-[#918B82] font-black text-[10px] uppercase">Chiudi</button>
          </div>
        </div>
      )}

      <button onClick={onClearData} className="w-full py-4 text-rose-500 font-black text-xs uppercase border border-rose-100 bg-rose-50/30 rounded-2xl">
        Cancella Tutti i Dati
      </button>
    </div>
  );
};

export default Settings;
