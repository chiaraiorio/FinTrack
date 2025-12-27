
import React, { useState } from 'react';
import { Expense, Income, Category, Account, ViewType, Language, AppSettings, TextSize, ThemePalette } from '../types';

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
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onGetSyncCode: () => string;
  onImportSync: (code: string, mode: 'merge' | 'replace') => boolean;
  onOpenSidebar: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  expenses, incomes, categories, accounts, onClearData, onNavigate, onGoToMenu, 
  palettes, currentPalette, onPaletteChange,
  language, settings, onUpdateSettings, onGetSyncCode, onImportSync, onOpenSidebar
}) => {
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');

  const handleCopy = () => {
    const code = onGetSyncCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = (mode: 'merge' | 'replace') => {
    if (!importText.trim()) return;
    if (window.confirm("Procedere con l'importazione?")) {
      if (onImportSync(importText, mode)) {
        alert("Sincronizzazione completata!");
        setShowSyncModal(false);
        setImportText('');
      } else {
        alert("Codice non valido.");
      }
    }
  };

  return (
    <div className="px-5 pt-12 space-y-10 pb-40 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={onOpenSidebar}
            className="w-10 h-10 theme-card rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <div className="flex-1 text-right">
             <h1 className="text-xl font-black text-[#4A453E] tracking-tight">Impostazioni</h1>
          </div>
        </div>
      </header>

      {/* TEMA APPLICAZIONE (12 VARIANTI) */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black opacity-40 uppercase ml-4 tracking-[0.2em]">Tema Applicazione</h3>
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border theme-border overflow-x-auto no-scrollbar">
          <div className="flex gap-4 w-max">
            {palettes.map((p) => (
              <button 
                key={p.name}
                onClick={() => onPaletteChange(p)}
                className={`flex-shrink-0 w-16 h-16 rounded-2xl border-4 transition-all flex flex-col items-center justify-center gap-1 ${currentPalette.name === p.name ? 'scale-105 shadow-xl' : 'opacity-40 grayscale-[0.3]'}`}
                style={{ borderColor: p.primary, backgroundColor: p.bg }}
              >
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: p.primary }} />
                <span className="text-[7px] font-black uppercase tracking-tighter" style={{ color: p.primary }}>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GENERALE E LOCALIZZAZIONE */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black opacity-40 uppercase ml-4 tracking-[0.2em]">Generale</h3>
        <div className="bg-white rounded-[2.5rem] shadow-sm border theme-border divide-y theme-border overflow-hidden">
          {/* LINGUA */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-[#4A453E]">Lingua App</span>
              <span className="text-[10px] opacity-50 font-medium">Interfaccia e categorie</span>
            </div>
            <select 
              className="theme-sub-bg px-4 py-2 rounded-2xl font-black theme-primary outline-none text-xs"
              value={settings.language}
              onChange={e => onUpdateSettings({...settings, language: e.target.value as Language})}
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          {/* VALUTA */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-[#4A453E]">Valuta</span>
              <span className="text-[10px] opacity-50 font-medium">Simbolo visualizzato</span>
            </div>
            <select 
              className="theme-sub-bg px-4 py-2 rounded-2xl font-black theme-primary outline-none text-xs"
              value={settings.currency}
              onChange={e => onUpdateSettings({...settings, currency: e.target.value})}
            >
              <option value="€">Euro (€)</option>
              <option value="$">Dollaro ($)</option>
              <option value="£">Sterlina (£)</option>
              <option value="¥">Yen (¥)</option>
              <option value="₣">Franco (₣)</option>
            </select>
          </div>
          {/* CONTO PREDEFINITO */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-[#4A453E]">Conto Predefinito</span>
              <span className="text-[10px] opacity-50 font-medium">Per i nuovi inserimenti</span>
            </div>
            <select 
              className="theme-sub-bg px-4 py-2 rounded-2xl font-black theme-primary outline-none text-xs"
              value={settings.defaultAccountId}
              onChange={e => onUpdateSettings({...settings, defaultAccountId: e.target.value})}
            >
              <option value="">Nessuno</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* PIANIFICAZIONE E CONTABILITÀ */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black opacity-40 uppercase ml-4 tracking-[0.2em]">Contabilità</h3>
        <div className="bg-white rounded-[2.5rem] shadow-sm border theme-border divide-y theme-border overflow-hidden">
          {/* BUDGET MENSILE */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-[#4A453E]">Budget Mensile</span>
              <span className="text-[10px] opacity-50 font-medium">Soglia di spesa globale</span>
            </div>
            <div className="flex items-center gap-2 theme-sub-bg px-4 py-2 rounded-2xl">
              <span className="text-xs font-black opacity-30">{settings.currency}</span>
              <input 
                type="number" 
                className="w-20 bg-transparent text-right font-black theme-primary outline-none"
                value={settings.monthlyBudget || ''}
                onChange={e => onUpdateSettings({...settings, monthlyBudget: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          {/* GIORNO INIZIO MESE */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-[#4A453E]">Inizio Mese Contabile</span>
              <span className="text-[10px] opacity-50 font-medium">Reset dei calcoli</span>
            </div>
            <select 
              className="theme-sub-bg px-4 py-2 rounded-2xl font-black theme-primary outline-none"
              value={settings.firstDayOfMonth}
              onChange={e => onUpdateSettings({...settings, firstDayOfMonth: parseInt(e.target.value)})}
            >
              {Array.from({length: 28}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {/* PRIMO GIORNO SETTIMANA */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-[#4A453E]">Inizio Settimana</span>
              <span className="text-[10px] opacity-50 font-medium">Vista calendario e liste</span>
            </div>
            <select 
              className="theme-sub-bg px-4 py-2 rounded-2xl font-black theme-primary outline-none text-xs"
              value={settings.firstDayOfWeek}
              onChange={e => onUpdateSettings({...settings, firstDayOfWeek: parseInt(e.target.value)})}
            >
              <option value={1}>Lunedì</option>
              <option value={0}>Domenica</option>
            </select>
          </div>
          {/* RIPORTO SALDO */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-[#4A453E]">Riporto Saldo</span>
              <span className="text-[10px] opacity-50 font-medium">Somma risparmio al mese succ.</span>
            </div>
            <button 
              onClick={() => onUpdateSettings({...settings, carryOverBalance: !settings.carryOverBalance})}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings.carryOverBalance ? 'theme-bg-primary' : 'bg-[#D9D1C5]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.carryOverBalance ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* SICUREZZA */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black opacity-40 uppercase ml-4 tracking-[0.2em]">Sicurezza</h3>
        <div className="bg-white rounded-[2.5rem] shadow-sm border theme-border divide-y theme-border overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-[#4A453E]">Riconoscimento Biometrico</span>
              <span className="text-[10px] opacity-50 font-medium">Usa FaceID / TouchID all'avvio</span>
            </div>
            <button 
              onClick={() => onUpdateSettings({...settings, biometricEnabled: !settings.biometricEnabled})}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings.biometricEnabled ? 'theme-bg-primary' : 'bg-[#D9D1C5]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.biometricEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <button onClick={() => onNavigate('security')} className="p-6 w-full flex items-center justify-between text-left">
            <div className="flex flex-col">
              <span className="font-bold text-[#4A453E]">Credenziali</span>
              <span className="text-[10px] opacity-50 font-medium">Cambia password o email</span>
            </div>
            <svg className="w-5 h-5 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </section>

      {/* SYNC & BACKUP */}
      <button 
        onClick={() => setShowSyncModal(true)}
        className="w-full bg-white rounded-[2rem] p-6 border theme-border shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v5m0 0l-2-2m2 2l2-2" /></svg>
          </div>
          <div className="text-left">
            <p className="font-bold text-[#4A453E]">Sincronizza Cloud</p>
            <p className="text-[10px] opacity-60 font-medium uppercase">Gestione backup manuale</p>
          </div>
        </div>
        <svg className="w-5 h-5 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
      </button>

      <button onClick={onClearData} className="w-full py-5 text-rose-500 font-black text-xs uppercase border border-rose-100 bg-rose-50/30 rounded-[2rem] active:scale-95 transition-all">
        Svuota Database Locale
      </button>

      {showSyncModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-[#FAF7F2] w-full max-w-sm rounded-[3rem] p-8 space-y-8 shadow-2xl">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-[#4A453E]">Sync Cloud</h2>
              <p className="text-[10px] text-[#918B82] font-black uppercase tracking-widest">Codice di sincronizzazione</p>
            </div>
            <div className="space-y-6">
              <button onClick={handleCopy} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'theme-bg-primary text-white shadow-lg'}`}>
                {copied ? 'Copiato!' : 'Copia Codice Sincro'}
              </button>
              <textarea 
                value={importText} 
                onChange={e => setImportText(e.target.value)} 
                placeholder="Incolla codice qui..." 
                className="w-full h-24 p-4 bg-white rounded-2xl text-[10px] font-mono outline-none border theme-border resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleImport('merge')} className="py-3 bg-white text-sky-600 border border-sky-100 rounded-xl font-black text-[9px] uppercase">Unisci</button>
                <button onClick={() => handleImport('replace')} className="py-3 bg-white text-rose-500 border border-rose-100 rounded-xl font-black text-[9px] uppercase">Sostituisci</button>
              </div>
            </div>
            <button onClick={() => setShowSyncModal(false)} className="w-full text-center text-[#918B82] font-black text-[10px] uppercase">Chiudi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
