
import React, { useState } from 'react';
import { User, ViewType } from '../types';

interface SecurityViewProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onBack: () => void;
  onOpenSidebar: () => void;
}

const SecurityView: React.FC<SecurityViewProps> = ({ user, onUpdateUser, onBack, onOpenSidebar }) => {
  const [appLock, setAppLock] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passForm.current !== user.password) {
      setError('La password attuale non è corretta.');
      return;
    }
    if (passForm.new.length < 6) {
      setError('La nuova password deve essere di almeno 6 caratteri.');
      return;
    }
    if (passForm.new !== passForm.confirm) {
      setError('Le nuove password non coincidono.');
      return;
    }

    onUpdateUser({ ...user, password: passForm.new });
    setPassForm({ current: '', new: '', confirm: '' });
    setIsChangingPassword(false);
    setSuccess('Password aggiornata con successo!');
    setTimeout(() => setSuccess(''), 3000);
  };

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

      {success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-100 text-center font-bold text-sm animate-in zoom-in">
          {success}
        </div>
      )}

      <section className="space-y-4">
        <h3 className="text-[11px] font-black theme-primary uppercase tracking-[0.1em] px-3">Accesso e Protezione</h3>
        <div className="theme-card rounded-[2.5rem] overflow-hidden bg-white border theme-border shadow-sm divide-y">
          {!isChangingPassword ? (
            <button onClick={() => setIsChangingPassword(true)} className="w-full flex items-center justify-between p-5 active:theme-sub-bg transition-colors group">
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
          ) : (
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4 animate-in slide-in-from-top duration-300">
              <h4 className="text-[10px] font-black theme-primary uppercase tracking-widest mb-2">Nuova Password</h4>
              {error && <p className="text-[10px] text-rose-500 font-bold text-center">{error}</p>}
              <div className="space-y-3">
                <input 
                  type="password" 
                  placeholder="Password Attuale" 
                  className="w-full theme-sub-bg p-4 rounded-2xl text-sm font-bold outline-none border-none focus:ring-2 focus:ring-current theme-primary"
                  value={passForm.current}
                  onChange={e => setPassForm({...passForm, current: e.target.value})}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Nuova Password" 
                  className="w-full theme-sub-bg p-4 rounded-2xl text-sm font-bold outline-none border-none focus:ring-2 focus:ring-current theme-primary"
                  value={passForm.new}
                  onChange={e => setPassForm({...passForm, new: e.target.value})}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Conferma Nuova Password" 
                  className="w-full theme-sub-bg p-4 rounded-2xl text-sm font-bold outline-none border-none focus:ring-2 focus:ring-current theme-primary"
                  value={passForm.confirm}
                  onChange={e => setPassForm({...passForm, confirm: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-4 theme-bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest">Aggiorna</button>
                <button type="button" onClick={() => setIsChangingPassword(false)} className="px-6 py-4 theme-sub-bg text-[#918B82] rounded-2xl font-bold text-xs uppercase tracking-widest">Annulla</button>
              </div>
            </form>
          )}

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 20c4.083 0 7.774-2.436 9.456-6m-9.961-3.228A4.49 4.49 0 0012 13c1.29 0 2.456-.54 3.282-1.404M12 11a4.5 4.5 0 01-4.5-4.5V7a4.5 4.5 0 019 0v.5A4.5 4.5 0 0112 11z" /></svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-[15px] text-[#4A453E]">Protezione Accesso</p>
                <p className="text-[11px] opacity-60 font-medium">Richiedi PIN o Biometria</p>
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
