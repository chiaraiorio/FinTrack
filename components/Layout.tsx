
import React, { useState, useRef, useEffect } from 'react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  centerButton?: React.ReactNode;
  language?: 'it' | 'en';
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, centerButton, language = 'it' }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const t = {
    it: { dashboard: 'Home', accounts: 'Conti', income: 'Entrate', expenses: 'Uscite', updating: 'Aggiornamento...' },
    en: { dashboard: 'Home', accounts: 'Accounts', income: 'Income', expenses: 'Expenses', updating: 'Updating...' }
  }[language];

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].pageY;
    } else {
      startY.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === 0 || isRefreshing) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      const resistance = 0.4;
      const move = Math.min(diff * resistance, 100);
      setPullDistance(move);
      if (diff > 10 && e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      setPullDistance(70);
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1500);
    } else {
      setPullDistance(0);
    }
    startY.current = 0;
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto theme-bg-app overflow-hidden relative">
      <div 
        className="absolute w-full flex justify-center z-[100] pointer-events-none transition-all duration-200"
        style={{ top: `${pullDistance - 50}px`, opacity: pullDistance > 20 ? 1 : 0, transform: `scale(${Math.min(pullDistance / 70, 1)})` }}
      >
        <div className="bg-white rounded-full p-2 shadow-xl border theme-border flex items-center justify-center">
          <svg className={`w-6 h-6 theme-primary ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </div>
      </div>

      <main 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-y-auto no-scrollbar pb-32 transition-transform duration-200"
        style={{ transform: `translateY(${isRefreshing ? 60 : 0}px)` }}
      >
        {children}
      </main>

      <nav className="fixed bottom-0 w-full max-w-md bg-white/90 ios-blur border-t theme-border px-1 pt-3 pb-8 flex justify-around items-center z-50">
        <NavButton 
          label={t.dashboard} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
          active={activeView === 'dashboard'} 
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
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          active={activeView === 'income_list'} 
          onClick={() => onViewChange('income_list')} 
        />

        <NavButton 
          label={t.expenses} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          active={activeView === 'list'} 
          onClick={() => onViewChange('list')} 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ label: string; icon: React.ReactNode; active: boolean; onClick: () => void }> = ({ label, icon, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 flex-1 transition-all duration-300 ${active ? 'theme-primary' : 'text-[#B8B0A5]'}`}>
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>{icon}</div>
    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default Layout;
