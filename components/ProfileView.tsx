
import React, { useState } from 'react';
import { User, ViewType } from '../types';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onNavigate: (view: ViewType) => void;
  onBack: () => void;
  transactionCount: number;
  onOpenSidebar: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, onNavigate, onBack, transactionCount, onOpenSidebar }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');
    if (!name.trim() || !email.trim()) {
      setError('Nome ed email sono obbligatori.');
      return;
    }
    if (!email.includes('@')) {
      setError('Inserisci un indirizzo email valido.');
      return;
    }

    onUpdateUser({ ...user, name, email: email.toLowerCase() });
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="px-5 pt-12 space-y-8 animate-in fade-in duration-500 pb-20">
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
        <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E]">Il Tuo Profilo</h1>
      </header>

      <div className="flex flex-col items-center gap-4">
        <div className="w-32 h-32 theme-bg-primary rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl relative">
          {user.name.charAt(0).toUpperCase()}
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border theme-border rounded-full flex items-center justify-center theme-primary shadow-lg active:scale-90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          )}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-[#4A453E]">{user.name}</h2>
          <p className="opacity-60 font-medium">{user.email}</p>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-100 text-center font-bold text-sm animate-in zoom-in duration-300">
          Profilo aggiornato con successo!
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl border border-rose-100 text-center font-bold text-sm animate-in shake duration-300">
          {error}
        </div>
      )}

      <div className="theme-card rounded-[2.5rem] p-6 space-y-6 bg-white shadow-sm border theme-border">
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black theme-primary uppercase tracking-[0.1em]">Dati Personali</label>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#D9D1C5] uppercase ml-1">Nome Visualizzato</span>
            {isEditing ? (
              <input 
                type="text"
                className="w-full theme-sub-bg p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-bold outline-none"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Il tuo nome"
              />
            ) : (
              <div className="theme-sub-bg p-4 rounded-2xl text-[#4A453E] font-bold">
                {user.name}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#D9D1C5] uppercase ml-1">Email di accesso</span>
            {isEditing ? (
              <input 
                type="email"
                className="w-full theme-sub-bg p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-bold outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="La tua email"
              />
            ) : (
              <div className="theme-sub-bg p-4 rounded-2xl text-[#4A453E] font-bold opacity-70">
                {user.email}
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex-1 py-4 theme-bg-primary text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              Salva
            </button>
            <button 
              onClick={() => { setName(user.name); setEmail(user.email); setIsEditing(false); setError(''); }}
              className="px-6 py-4 theme-sub-bg text-[#918B82] rounded-2xl font-bold active:scale-95 transition-transform"
            >
              Annulla
            </button>
          </div>
        )}
      </div>

      <div className="theme-card rounded-[2.5rem] p-6 shadow-sm border theme-border bg-white">
        <h3 className="text-[10px] font-black theme-primary uppercase tracking-[0.1em] mb-4 px-1">Statistiche</h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 theme-sub-bg rounded-2xl flex items-center justify-center theme-primary">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-black text-[#4A453E]">{transactionCount}</p>
            <p className="text-[11px] font-bold opacity-60 uppercase tracking-wider">Movimenti Totali</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
