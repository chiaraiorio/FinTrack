
import React, { useState } from 'react';
import { ViewType, User, Language } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: ViewType) => void;
  currentView: ViewType;
  user: User | null;
  onLogout: () => void;
  language: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onViewChange, currentView, user, onLogout, language }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const t = {
    it: { advisor: 'Consulente AI', savings: 'Salvadanai', reports: 'Report Mensili', export: 'Esporta Dati', settings: 'Impostazioni', logout: 'Esci', confirm: 'Sei sicuro?', logoutText: 'Effettuando il logout dovrai reinserire le credenziali.', yes: 'Sì, esci', no: 'No, rimani' },
    en: { advisor: 'AI Advisor', savings: 'Savings Jars', reports: 'Monthly Reports', export: 'Export Data', settings: 'Settings', logout: 'Logout', confirm: 'Are you sure?', logoutText: 'By logging out you will need to re-enter your credentials.', yes: 'Yes, logout', no: 'No, stay' }
  }[language];

  const confirmLogout = () => {
    onLogout();
    onClose();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-[#4A453E]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-in zoom-in duration-300">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-[#4A453E]">{t.confirm}</h3>
              <p className="text-[13px] text-[#918B82] font-medium leading-relaxed px-2">
                {t.logoutText}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={confirmLogout} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-sm active:scale-95 transition-transform">{t.yes}</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 theme-sub-bg text-[#918B82] rounded-2xl font-black text-sm active:scale-95 transition-transform">{t.no}</button>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed inset-0 bg-[#4A453E]/20 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      
      <div className={`fixed top-0 left-0 h-full w-[300px] bg-white/95 ios-blur z-[70] shadow-2xl transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="pt-20 px-6 space-y-8 h-full flex flex-col overflow-y-auto no-scrollbar theme-bg-app">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 theme-bg-primary rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg">FT</div>
            <h2 className="text-2xl font-black text-[#4A453E] tracking-tighter">FinTrack</h2>
          </div>

          <div className="px-2 py-4 flex items-center gap-4">
            <div className="w-12 h-12 theme-bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg text-lg font-black shrink-0">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
            <div className="flex-1 min-w-0">
               <h3 className="font-black text-[16px] text-[#4A453E] truncate">{user?.name || 'Utente'}</h3>
               <p className="text-[10px] theme-primary font-black uppercase tracking-wider">Premium Plan</p>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            <MenuLink label={t.advisor} active={currentView === 'ai_advisor'} onClick={() => { onViewChange('ai_advisor'); onClose(); }} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
            <MenuLink label={t.savings} active={currentView === 'savings_jars'} onClick={() => { onViewChange('savings_jars'); onClose(); }} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
            <MenuLink label={t.reports} active={currentView === 'monthly_reports'} onClick={() => { onViewChange('monthly_reports'); onClose(); }} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <MenuLink label={t.export} active={currentView === 'export'} onClick={() => { onViewChange('export'); onClose(); }} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>} />
            <div className="pt-4 mt-4 border-t theme-border">
              <MenuLink label={t.settings} active={currentView === 'settings'} onClick={() => { onViewChange('settings'); onClose(); }} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
            </div>
          </nav>
          
          <div className="pb-10 pt-4 border-t theme-border">
            <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 font-black text-[15px] hover:bg-rose-50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {t.logout}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const MenuLink: React.FC<{ label: string; active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ label, active, onClick, icon }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 rounded-[1.5rem] transition-all ${active ? 'theme-bg-primary text-white shadow-xl scale-[1.02]' : 'text-[#5D574F] hover:theme-sub-bg'}`}>
    {icon}
    <span className="font-black text-[15px] tracking-tight">{label}</span>
  </button>
);

export default Sidebar;
