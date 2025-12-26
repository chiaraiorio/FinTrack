
import React, { useState } from 'react';
import { ViewType, User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: ViewType) => void;
  currentView: ViewType;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onViewChange, currentView, user, onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    onLogout();
    onClose();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Overlay Logout Confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-[#4A453E]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-in zoom-in duration-300">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-[#4A453E]">Sei sicuro?</h3>
              <p className="text-[13px] text-[#918B82] font-medium leading-relaxed px-2">
                Effettuando il logout dovrai reinserire le credenziali per accedere ai tuoi dati.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={confirmLogout}
                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-sm active:scale-95 transition-transform"
              >
                Sì, esci
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4 theme-sub-bg text-[#918B82] rounded-2xl font-black text-sm active:scale-95 transition-transform"
              >
                No, rimani
              </button>
            </div>
          </div>
        </div>
      )}

      <div 
        className={`fixed inset-0 bg-[#4A453E]/20 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div 
        className={`fixed top-0 left-0 h-full w-[300px] bg-white/95 ios-blur z-[70] shadow-2xl transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="pt-20 px-6 space-y-8 h-full flex flex-col overflow-y-auto no-scrollbar theme-bg-app">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 theme-bg-primary rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg">FT</div>
            <h2 className="text-2xl font-black text-[#4A453E] tracking-tighter">FinTrack</h2>
          </div>

          {/* User Section - INTERACTIVE */}
          <div className="space-y-2 mb-4">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center gap-4 theme-card p-4 rounded-[2rem] active:scale-[0.98] transition-all text-left group"
            >
              <div className="w-16 h-16 theme-bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg text-2xl font-black shrink-0 transition-transform group-hover:scale-105">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-[17px] text-[#4A453E] truncate">{user?.name || 'Utente'}</h3>
                  <svg className={`w-4 h-4 theme-primary transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="text-[11px] theme-primary font-black uppercase tracking-wider">Membro Premium</p>
              </div>
            </button>

            {/* Sub-menu Utente */}
            {isUserMenuOpen && (
              <div className="bg-white/50 border theme-border rounded-[1.8rem] p-3 animate-in slide-in-from-top-2 duration-300 space-y-1 shadow-inner">
                <div className="px-3 py-2 border-b theme-border mb-1">
                  <p className="text-[9px] font-black text-[#918B82] uppercase tracking-[0.15em] mb-0.5">Indirizzo Email</p>
                  <p className="text-[12px] font-bold text-[#4A453E] truncate">{user?.email}</p>
                </div>
                <button 
                  onClick={() => { onViewChange('profile'); onClose(); }}
                  className="w-full text-left px-3 py-2.5 hover:bg-white rounded-xl transition-colors flex items-center gap-3 active:scale-95"
                >
                  <div className="w-7 h-7 bg-current opacity-10 rounded-lg flex items-center justify-center theme-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <span className="text-[13px] font-bold text-[#4A453E]">Profilo Utente</span>
                </button>
                <button 
                  onClick={() => { onViewChange('security'); onClose(); }}
                  className="w-full text-left px-3 py-2.5 hover:bg-white rounded-xl transition-colors flex items-center gap-3 active:scale-95"
                >
                  <div className="w-7 h-7 bg-current opacity-10 rounded-lg flex items-center justify-center theme-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <span className="text-[13px] font-bold text-[#4A453E]">Sicurezza App</span>
                </button>
              </div>
            )}
          </div>

          <nav className="space-y-1.5 flex-1">
            <MenuLink 
              label="Home Transazioni" 
              active={currentView === 'list'} 
              onClick={() => { onViewChange('list'); onClose(); }}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
            />
            <MenuLink 
              label="Analisi Finanziaria" 
              active={currentView === 'dashboard'} 
              onClick={() => { onViewChange('dashboard'); onClose(); }}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            />
            <MenuLink 
              label="Report Mensili" 
              active={currentView === 'monthly_reports'} 
              onClick={() => { onViewChange('monthly_reports'); onClose(); }}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <MenuLink 
              label="Esportazione CSV/PDF" 
              active={currentView === 'export'} 
              onClick={() => { onViewChange('export'); onClose(); }}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 014-4h4m0 0l-4-4m4 4l-4 4m5 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2" /></svg>}
            />
            <div className="pt-4 mt-4 border-t theme-border">
              <MenuLink 
                label="Impostazioni" 
                active={currentView === 'settings'} 
                onClick={() => { onViewChange('settings'); onClose(); }}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              />
            </div>
          </nav>
          
          <div className="pb-10 pt-4 border-t theme-border">
            <button 
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 font-black text-[15px] hover:bg-rose-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Esci da FinTrack
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const MenuLink: React.FC<{ label: string; active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ label, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-4 rounded-[1.5rem] transition-all ${active ? 'theme-bg-primary text-white shadow-xl scale-[1.02]' : 'text-[#5D574F] hover:theme-sub-bg'}`}
  >
    {icon}
    <span className="font-black text-[15px] tracking-tight">{label}</span>
  </button>
);

export default Sidebar;
