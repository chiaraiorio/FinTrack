
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  onImportSync: (code: string) => boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Normalizzazione: email minuscola e senza spazi bianchi
    const normalizedEmail = formData.email.trim().toLowerCase();
    const trimmedPassword = formData.password;
    const trimmedName = formData.name.trim();

    if (!normalizedEmail || !trimmedPassword || (isRegister && !trimmedName)) {
      setError('Tutti i campi sono obbligatori.');
      return;
    }

    const storageKey = 'registered_users';
    let users: User[] = [];
    try {
      users = JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (e) {
      users = [];
    }

    if (isRegister) {
      // Verifica se l'utente esiste già (usando email normalizzata)
      if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
        setError('Questa email è già registrata.');
        return;
      }

      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: trimmedName,
        email: normalizedEmail,
        password: trimmedPassword,
        updatedAt: Date.now()
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem(storageKey, JSON.stringify(updatedUsers));
      
      // Salviamo anche come ultimo utente loggato
      localStorage.setItem('current_user', JSON.stringify(newUser));
      onLogin(newUser);
    } else {
      // Login con email normalizzata
      const user = users.find(u => 
        u.email.toLowerCase() === normalizedEmail && 
        u.password === trimmedPassword
      );

      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
        onLogin(user);
      } else {
        setError('Email o password errati. Verifica i dati inseriti.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 theme-bg-primary rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl mx-auto shadow-xl animate-bounce">FT</div>
          <h1 className="text-3xl font-black text-[#4A453E] tracking-tight">FinTrack</h1>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">La tua finanza, semplificata</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-[#EBE4D8] space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-[#4A453E]">
              {isRegister ? 'Crea Account' : 'Bentornato'}
            </h2>
            <p className="text-[10px] text-[#918B82] font-bold uppercase tracking-widest">
              {isRegister ? 'Inizia a tracciare le tue spese' : 'Accedi ai tuoi dati'}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-500 p-3 rounded-xl text-[10px] font-bold text-center border border-rose-100 animate-in shake duration-300">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-[9px] font-black opacity-30 uppercase ml-2">Nome</label>
                <input 
                  type="text" 
                  placeholder="Il tuo nome" 
                  className="w-full p-4 theme-sub-bg rounded-2xl outline-none focus:ring-2 focus:ring-current theme-primary font-bold transition-all border border-transparent" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[9px] font-black opacity-30 uppercase ml-2">Email</label>
              <input 
                type="email" 
                placeholder="esempio@email.com" 
                className="w-full p-4 theme-sub-bg rounded-2xl outline-none focus:ring-2 focus:ring-current theme-primary font-bold transition-all border border-transparent" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black opacity-30 uppercase ml-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 theme-sub-bg rounded-2xl outline-none focus:ring-2 focus:ring-current theme-primary font-bold transition-all border border-transparent" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="w-full py-5 theme-bg-primary text-white rounded-3xl font-black shadow-lg active:scale-95 transition-all text-sm uppercase tracking-widest">
            {isRegister ? 'Registrati Gratis' : 'Entra in FinTrack'}
          </button>
        </form>

        <button 
          onClick={() => { setIsRegister(!isRegister); setError(''); }} 
          className="w-full text-center group"
        >
          <span className="text-[#918B82] text-[11px] font-medium">
            {isRegister ? 'Hai già un account?' : 'Non hai un account?'}
          </span>
          <span className="ml-1 theme-primary font-black text-[11px] uppercase tracking-wider group-hover:underline">
            {isRegister ? 'Accedi' : 'Crea ora'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Auth;
