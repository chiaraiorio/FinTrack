
import React from 'react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  centerButton?: React.ReactNode;
  language?: 'it' | 'en';
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, centerButton, language = 'it' }) => {
  const t = {
    it: { dashboard: 'Dashboard', accounts: 'Conti', income: 'Entrate', expenses: 'Uscite' },
    en: { dashboard: 'Dashboard', accounts: 'Accounts', income: 'Income', expenses: 'Expenses' }
  }[language];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto theme-bg-app overflow-hidden relative">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full max-w-md bg-white/90 ios-blur border-t theme-border px-1 pt-3 pb-8 flex justify-around items-center z-50">
        <NavButton 
          label={t.dashboard} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          active={activeView === 'dashboard' || activeView === 'financial_analysis'} 
          onClick={() => onViewChange('dashboard')} 
        />
        <NavButton 
          label={t.accounts} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
          active={activeView === 'accounts'} 
          onClick={() => onViewChange('accounts')} 
        />
        
        <div className="flex-1 flex justify-center relative -top-4 min-w-[64px]">
          {centerButton}
        </div>

        <NavButton 
          label={t.income} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          active={activeView === 'income_list' || activeView === 'income_categories'} 
          onClick={() => onViewChange('income_list')} 
        />

        <NavButton 
          label={t.expenses} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          active={activeView === 'list'} 
          onClick={() => onViewChange('list')} 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ label: string; icon: React.ReactNode; active: boolean; onClick: () => void }> = ({ label, icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 flex-1 transition-all duration-300 ${active ? 'theme-primary' : 'text-[#B8B0A5]'}`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default Layout;
