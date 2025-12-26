
import React from 'react';
import { Expense, Category, Account, ViewType } from '../types';
import { ThemePalette } from '../App';

interface SettingsProps {
  expenses: Expense[];
  categories: Category[];
  accounts: Account[];
  onClearData: () => void;
  onNavigate: (view: ViewType) => void;
  onBack: () => void;
  palettes: ThemePalette[];
  currentPalette: ThemePalette;
  onPaletteChange: (p: ThemePalette) => void;
  onOpenSidebar: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  expenses, categories, accounts, onClearData, onNavigate, onBack, 
  palettes, currentPalette, onPaletteChange, onOpenSidebar 
}) => {
  
  const exportToExcel = () => {
    if (expenses.length === 0) {
      alert("Nessuna spesa da esportare!");
      return;
    }
    const headers = ['Data', 'Importo (€)', 'Categoria', 'Conto', 'Ripetibilità', 'Note'];
    const rows = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => {
      const cat = categories.find(c => c.id === e.categoryId)?.name || 'Sconosciuta';
      const acc = accounts.find(a => a.id === e.accountId)?.name || 'Sconosciuto';
      return [e.date, e.amount.toString().replace('.', ','), cat, acc, e.repeatability, `"${e.notes.replace(/"/g, '""')}"`];
    });
    const csvContent = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinTrack_Esportazione_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-5 pt-12 space-y-8 pb-32 animate-in fade-in duration-500">
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
        <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E]">Impostazioni</h1>
      </header>

      <section className="space-y-4">
        <h3 className="text-[11px] font-bold opacity-60 uppercase ml-4">Personalizzazione Tema</h3>
        <div className="theme-card rounded-[2rem] p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {palettes.map((p) => {
              const isActive = currentPalette.name === p.name;
              return (
                <button 
                  key={p.name}
                  onClick={() => onPaletteChange(p)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all relative overflow-hidden ${isActive ? 'bg-white shadow-md' : 'border-transparent bg-[#F5EFE6] opacity-70 hover:opacity-100'}`}
                  style={{ 
                     borderColor: isActive ? p.primary : 'transparent',
                  }}
                >
                  {isActive && <div className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center" style={{ backgroundColor: p.primary }}>
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                  </div>}
                  <div 
                    className="w-8 h-8 rounded-full border border-black/5 shrink-0 shadow-sm" 
                    style={{ backgroundColor: p.primary }}
                  />
                  <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${isActive ? '' : 'text-[#4A453E]'}`} style={{ color: isActive ? p.primary : undefined }}>
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="bg-current opacity-5 h-px w-full" />
          <p className="text-[11px] font-medium text-center opacity-60 italic">Cambia l'aspetto per un'esperienza FinTrack su misura.</p>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-[11px] font-bold opacity-60 uppercase ml-4">Account e Preferenze</h3>
        <div className="theme-card rounded-[2rem] overflow-hidden divide-y theme-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">💰</span>
              <span className="font-bold text-[15px] text-[#4A453E]">Valuta Principale</span>
            </div>
            <span className="text-[14px] theme-primary font-medium">Euro (€)</span>
          </div>
          <button 
            onClick={() => onNavigate('profile')}
            className="w-full flex items-center justify-between p-4 active:theme-sub-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">👤</span>
              <span className="font-bold text-[15px] text-[#4A453E]">Profilo Utente</span>
            </div>
            <svg className="w-5 h-5 text-[#D9D1C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
          <button 
            onClick={() => onNavigate('security')}
            className="w-full flex items-center justify-between p-4 active:theme-sub-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🛡️</span>
              <span className="font-bold text-[15px] text-[#4A453E]">Sicurezza</span>
            </div>
            <svg className="w-5 h-5 text-[#D9D1C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-[11px] font-bold opacity-60 uppercase ml-4">Dati e Backup</h3>
        <div className="theme-card rounded-[2rem] overflow-hidden divide-y theme-border">
          <button 
            onClick={exportToExcel}
            className="w-full flex items-center justify-between p-4 active:theme-sub-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📈</span>
              <span className="font-bold text-[15px] text-[#4A453E]">Esporta in Excel (.csv)</span>
            </div>
            <div className="flex items-center gap-1 theme-primary">
              <span className="text-[12px] font-bold uppercase tracking-wider">Scarica</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>
          
          <button 
            onClick={onClearData}
            className="w-full flex items-center justify-between p-4 active:theme-sub-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🗑️</span>
              <span className="font-bold text-[15px] text-rose-500">Cancella tutti i dati</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
