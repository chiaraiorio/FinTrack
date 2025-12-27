
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
    it: { 
      categories: 'Categorie',
      advisor: 'Consulente AI', 
      reports: 'Report Mensili', 
      bank: 'Importa Dati', 
      export: 'Esporta Dati', 
      settings: 'Impostazioni', 
      logout: 'Esci', 
      confirm: 'Sei sicuro?', 
      yes: 'Sì, esci', 
      no: 'No, rimani' 
    },
    en: { 
      categories: 'Categories',
      advisor: 'AI Advisor', 
      reports: 'Monthly Reports', 
      bank: 'Import Data', 
      export: 'Export Data', 
      settings: 'Settings', 
      logout: 'Logout', 
      confirm: 'Are you sure?', 
      yes: 'Yes, logout', 
      no: 'No, stay' 
    }
  }[language];

  return (
    <>
      <div className={`fixed inset-0 bg-[#4A453E]/20 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 left-0 h-full w-[300px] bg-white z-[70] shadow-2xl transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="pt-20 px-6 space-y-8 h-full flex flex-col theme-bg-app">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 theme-bg-primary rounded-xl flex items-center justify-center text-white font-black">FT</div>
            <h2 className="text-2xl font-black text-[#4A453E]">FinTrack</h2>
          </div>

          <nav className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
            <MenuLink label="Dashboard" active={currentView === 'dashboard'} onClick={() => { onViewChange('dashboard'); onClose(); }} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
            <MenuLink label={t.categories} active={currentView === 'budget_summary'} onClick={() => { onViewChange('budget_summary'); onClose(); }} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>} />
            <MenuLink label={t.advisor} active={currentView === 'ai_advisor'} onClick={() => { onViewChange('ai_advisor'); onClose(); }} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
            <MenuLink label={t.bank} active={currentView === 'bank_sync'} onClick={() => { onViewChange('bank_sync'); onClose(); }} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>} />
            <MenuLink label={t.export} active={currentView === 'export'} onClick={() => { onViewChange('export'); onClose(); }} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>} />
            <MenuLink label={t.reports} active={currentView === 'monthly_reports'} onClick={() => { onViewChange('monthly_reports'); onClose(); }} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <MenuLink label={t.settings} active={currentView === 'settings'} onClick={() => { onViewChange('settings'); onClose(); }} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
          </nav>
          
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-4 p-4 text-rose-500 font-black mb-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {t.logout}
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-xs text-center space-y-6">
            <h3 className="text-xl font-black">{t.confirm}</h3>
            <div className="flex flex-col gap-2">
              <button onClick={onLogout} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black">Esci ora</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-4 theme-sub-bg rounded-2xl font-black text-[#918B82]">No, resta</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MenuLink: React.FC<{ label: string; active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ label, active, onClick, icon }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 rounded-[1.5rem] transition-all ${active ? 'theme-bg-primary text-white shadow-xl' : 'text-[#5D574F]'}`}>
    {icon}
    <span className="font-black text-[15px]">{label}</span>
  </button>
);

export default Sidebar;
