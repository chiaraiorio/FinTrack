
import React from 'react';
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
  onImportData: (data: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  expenses, incomes, categories, accounts, onClearData, onNavigate, onGoToMenu, 
  palettes, currentPalette, onPaletteChange,
  language, onLanguageChange,
  settings, onUpdateSettings
}) => {
  
  const t = {
    it: { 
      back: 'Indietro', settings: 'Impostazioni', theme: 'Tema', account: 'Account e Preferenze', language: 'Lingua App', profile: 'Profilo Utente', profileText: 'Gestisci nome ed email', security: 'Sicurezza App', securityText: 'PIN e Password',
      financial: 'Preferenze Finanziarie', budget: 'Budget Mensile', budgetHint: 'Soglia massima di spesa', firstDay: 'Giorno Inizio Mese', defaultAcc: 'Conto Predefinito',
      system: 'Interfaccia e Sistema', textSize: 'Dimensione Testo', showDecimals: 'Abilitazione Decimali'
    },
    en: { 
      back: 'Back', settings: 'Settings', theme: 'Theme', account: 'Account & Preferences', language: 'App Language', profile: 'User Profile', profileText: 'Manage name and email', security: 'App Security', securityText: 'PIN & Password',
      financial: 'Financial Preferences', budget: 'Monthly Budget', budgetHint: 'Max spending threshold', firstDay: 'Start Day of Month', defaultAcc: 'Default Account',
      system: 'Interface & System', textSize: 'Text Size', showDecimals: 'Enable Decimals'
    }
  }[language];

  return (
    <div className="px-5 pt-12 space-y-8 pb-32 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={onGoToMenu}
            className="flex items-center gap-1 theme-primary -ml-2 active:opacity-50 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-lg font-medium">{t.back}</span>
          </button>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E]">{t.settings}</h1>
      </header>

      {/* TEMA */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black opacity-60 uppercase ml-4 tracking-widest">{t.theme}</h3>
        <div className="theme-card rounded-[2rem] p-6 shadow-sm">
          <div className="grid grid-cols-4 gap-4 justify-items-center">
            {palettes.map((p) => {
              const isActive = currentPalette.name === p.name;
              return (
                <button 
                  key={p.name}
                  onClick={() => onPaletteChange(p)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all relative ${isActive ? 'bg-white shadow-md' : 'border-transparent bg-[#F5EFE6] opacity-70 hover:opacity-100'}`}
                  style={{ borderColor: isActive ? p.primary : 'transparent' }}
                  title={p.name}
                >
                  <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: p.primary }} />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* PREFERENZE FINANZIARIE */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black opacity-60 uppercase ml-4 tracking-widest">{t.financial}</h3>
        <div className="theme-card rounded-[2rem] overflow-hidden divide-y theme-border shadow-sm">
          {/* BUDGET */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">🎯</span>
                <div>
                  <p className="font-bold text-[15px] text-[#4A453E]">{t.budget}</p>
                  <p className="text-[10px] opacity-60 font-medium">{t.budgetHint}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#918B82] font-black text-xs">€</span>
                <input 
                  type="number"
                  className="w-20 bg-gray-50 p-2 rounded-xl text-right font-black theme-primary outline-none text-sm"
                  value={settings.monthlyBudget}
                  onChange={e => onUpdateSettings({...settings, monthlyBudget: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          {/* GIORNO INIZIO */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">📅</span>
              <span className="font-bold text-[15px] text-[#4A453E]">{t.firstDay}</span>
            </div>
            <select 
              className="bg-transparent theme-primary font-black text-sm outline-none"
              value={settings.firstDayOfMonth}
              onChange={e => onUpdateSettings({...settings, firstDayOfMonth: parseInt(e.target.value)})}
            >
              {Array.from({length: 28}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* CONTO PREDEFINITO */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏦</span>
              <span className="font-bold text-[15px] text-[#4A453E]">{t.defaultAcc}</span>
            </div>
            <select 
              className="bg-transparent theme-primary font-black text-sm outline-none max-w-[120px] truncate"
              value={settings.defaultAccountId}
              onChange={e => onUpdateSettings({...settings, defaultAccountId: e.target.value})}
            >
              <option value="">Nessuno</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* INTERFACCIA E SISTEMA */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black opacity-60 uppercase ml-4 tracking-widest">{t.system}</h3>
        <div className="theme-card rounded-[2.5rem] overflow-hidden divide-y theme-border shadow-sm">
          {/* LINGUA */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🌐</span>
              <span className="font-bold text-[15px] text-[#4A453E]">{t.language}</span>
            </div>
            <div className="flex bg-gray-100 p-0.5 rounded-lg text-[10px] font-black">
              <button onClick={() => onLanguageChange('it')} className={`px-3 py-1.5 rounded-md transition-all ${language === 'it' ? 'bg-white shadow-sm theme-primary' : 'text-gray-400'}`}>ITA</button>
              <button onClick={() => onLanguageChange('en')} className={`px-3 py-1.5 rounded-md transition-all ${language === 'en' ? 'bg-white shadow-sm theme-primary' : 'text-gray-400'}`}>ENG</button>
            </div>
          </div>

          {/* DIMENSIONE TESTO */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-lg">Aa</span>
              <span className="font-bold text-[15px] text-[#4A453E]">{t.textSize}</span>
            </div>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as TextSize[]).map(sz => (
                <button 
                  key={sz}
                  onClick={() => onUpdateSettings({...settings, textSize: sz})}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${settings.textSize === sz ? 'theme-bg-primary text-white border-transparent' : 'theme-sub-bg text-[#918B82] border-transparent'}`}
                >
                  {sz === 'small' ? 'Piccolo' : sz === 'medium' ? 'Medio' : 'Grande'}
                </button>
              ))}
            </div>
          </div>

          {/* DECIMALi */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">.00</span>
              <span className="font-bold text-[15px] text-[#4A453E]">{t.showDecimals}</span>
            </div>
            <button 
              onClick={() => onUpdateSettings({...settings, showDecimals: !settings.showDecimals})}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings.showDecimals ? 'theme-bg-primary' : 'bg-[#D9D1C5]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${settings.showDecimals ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* ACCOUNT - PROFILE & SECURITY */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-black opacity-60 uppercase ml-4 tracking-widest">{t.account}</h3>
        <div className="theme-card rounded-[2.5rem] overflow-hidden divide-y theme-border shadow-sm">
          <button onClick={() => onNavigate('profile')} className="w-full flex items-center justify-between p-5 active:theme-sub-bg transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-lg">👤</span>
              <div className="text-left">
                <p className="font-bold text-[15px] text-[#4A453E]">{t.profile}</p>
                <p className="text-[10px] opacity-60 font-medium">{t.profileText}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-[#D9D1C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
          <button onClick={() => onNavigate('security')} className="w-full flex items-center justify-between p-5 active:theme-sub-bg transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-lg">🛡️</span>
              <div className="text-left">
                <p className="font-bold text-[15px] text-[#4A453E]">{t.security}</p>
                <p className="text-[10px] opacity-60 font-medium">{t.securityText}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-[#D9D1C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </section>

      <section className="pt-4 px-4">
        <button 
          onClick={onClearData}
          className="w-full py-4 text-rose-500 font-black text-xs uppercase border border-rose-100 bg-rose-50/30 rounded-2xl active:scale-95 transition-transform"
        >
          Cancella Tutti i Movimenti
        </button>
      </section>
    </div>
  );
};

export default Settings;
