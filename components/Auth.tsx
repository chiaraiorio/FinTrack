
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');

    if (isLogin) {
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Credenziali non valide. Riprova.');
      }
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Tutti i campi sono obbligatori.');
        return;
      }
      if (users.some(u => u.email === formData.email)) {
        setError('Email già registrata.');
        return;
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        password: formData.password
      };
      
      localStorage.setItem('registered_users', JSON.stringify([...users, newUser]));
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-4">
          {/* Innovativo FT Logo */}
          <div className="relative w-24 h-24 mx-auto animate-logo">
            <div className="absolute inset-0 theme-bg-primary rounded-[2rem] rotate-6 opacity-20 scale-110"></div>
            <div className="absolute inset-0 theme-bg-primary rounded-[2rem] -rotate-3 opacity-10"></div>
            <div className="relative w-full h-full theme-bg-primary rounded-[2rem] flex items-center justify-center shadow-xl shadow-current/20 border border-white/20">
              <svg viewBox="0 0 100 100" className="w-14 h-14 text-white fill-current">
                {/* Monogramma FT Minimalista */}
                <path d="M25 25 H75 V35 H40 V50 H70 V60 H40 V75 H25 Z" opacity="0.9" /> {/* F stylization */}
                <path d="M55 25 H85 V35 H75 V75 H65 V35 H55 Z" className="translate-x-4" /> {/* T stylization overlapping */}
              </svg>
            </div>
          </div>
          
          <div className="pt-2">
            <h1 className="text-4xl font-black text-[#4A453E] tracking-tighter">FinTrack</h1>
            <p className="text-[#918B82] font-semibold text-sm">Evoluzione Finanziaria Personale</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#EBE4D8] space-y-5">
          <h2 className="text-xl font-bold text-[#4A453E] text-center mb-2">
            {isLogin ? 'Bentornato' : 'Inizia Ora'}
          </h2>

          {error && (
            <div className="bg-rose-50 text-rose-500 text-[11px] font-bold p-3 rounded-xl text-center border border-rose-100">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-black theme-primary uppercase tracking-wider ml-1">Nome Completo</label>
              <input 
                type="text" 
                required
                className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-medium"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Mario Rossi"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black theme-primary uppercase tracking-wider ml-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-medium"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="mario@esempio.it"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black theme-primary uppercase tracking-wider ml-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-medium"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between px-1 py-2">
            <label className="text-xs font-bold text-[#918B82] cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
              Rimani collegato
            </label>
            <button 
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-10 h-5 rounded-full relative transition-all duration-300 ${rememberMe ? 'theme-bg-primary' : 'bg-[#D9D1C5]'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${rememberMe ? 'left-5.5' : 'left-0.5'}`} style={{ left: rememberMe ? '22px' : '2px' }} />
            </button>
          </div>

          <button 
            type="submit"
            className="w-full py-4 theme-bg-primary text-white rounded-2xl font-black text-[15px] shadow-lg active:scale-[0.98] transition-all mt-4"
          >
            {isLogin ? 'Accedi' : 'Registrati'}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="theme-primary font-bold text-sm hover:underline"
          >
            {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
