
import React, { useState } from 'react';
import { User, ViewType } from '../types';

interface SecurityViewProps {
  user: User;
  onNavigate: (view: ViewType) => void;
  onBack: () => void;
  onOpenSidebar: () => void;
}

const SecurityView: React.FC<SecurityViewProps> = ({ user, onNavigate, onBack, onOpenSidebar }) => {
  const [appLock, setAppLock] = useState(false);

  return (
    <div className="px-5 pt-12 space-y-8 animate-in fade-in duration-500 pb-32">
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
        <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E]">Sicurezza</h1>
      </header>

      <section className="space-y-4">
        <h3 className="text-[11px] font-black theme-primary uppercase tracking-[0.1em] px-3">Accesso e Protezione</h3>
        <div className="theme-card rounded-[2.5rem] overflow-hidden divide-y theme-border">
          <button className="w-full flex items-center justify-between p-5 active:theme-sub-bg transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-[15px] text-[#4A453E]">Cambia Password</p>
                <p className="text-[11px] opacity-60 font-medium">Aggiorna la tua chiave d'accesso</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-[#D9D1C5] group-active:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 20c4.083 0 7.774-2.436 9.456-6m-9.961-3.228A4.49 4.49 0 0012 13c1.29 0 2.456-.54 3.282-1.404M12 11a4.5 4.5 0 01-4.5-4.5V7a4.5 4.5 0 019 0v.5A4.5 4.5 0 0112 11z" /></svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-[15px] text-[#4A453E]">Sblocco Biometrico</p>
                <p className="text-[11px] opacity-60 font-medium">Usa FaceID o Impronta</p>
              </div>
            </div>
            <button 
              onClick={() => setAppLock(!appLock)}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${appLock ? 'theme-bg-primary' : 'bg-[#D9D1C5]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${appLock ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecurityView;
