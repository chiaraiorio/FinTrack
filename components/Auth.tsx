
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulazione di latenza di rete per rendere l'esperienza "reale"
    await new Promise(resolve => setTimeout(resolve, 1500));

    const users: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');

    if (isLogin) {
      const user = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.password === formData.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Credenziali non valide. Controlla email e password.');
        setIsLoading(false);
      }
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Tutti i campi sono obbligatori.');
        setIsLoading(false);
        return;
      }
      if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
        setError('Questa email è già registrata.');
        setIsLoading(false);
        return;
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        settings: {
          monthlyBudget: 0,
          firstDayOfMonth: 1,
          defaultAccountId: '',
          showDecimals: true,
          textSize: 'medium'
        }
      };
      
      localStorage.setItem('registered_users', JSON.stringify([...users, newUser]));
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto animate-logo">
            <div className="absolute inset-0 theme-bg-primary rounded-[2.5rem] rotate-6 opacity-20 scale-110"></div>
            <div className="relative w-full h-full theme-bg-primary rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-current/20 border border-white/20">
              <svg viewBox="0 0 100 100" className="w-14 h-14 text-white fill-current">
                <path d="M22 25h40v8H32v12h25v8H32v22h-10z" />
                <path d="M48 25h40v8H72v42h-10V33H48z" />
              </svg>
            </div>
          </div>
          
          <div className="pt-2">
            <h1 className="text-4xl font-black text-[#4A453E] tracking-tighter">FinTrack</h1>
            <p className="text-[#918B82] font-semibold text-sm">Il Tuo Portafoglio Intelligente</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-[#8E7C6815] border border-[#EBE4D8] space-y-6 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
              <div className="w-10 h-10 border-4 theme-border border-t-current theme-primary rounded-full animate-spin"></div>
              <p className="text-[11px] font-black uppercase tracking-widest theme-primary">Elaborazione...</p>
            </div>
          )}

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-[#4A453E]">
              {isLogin ? 'Accedi' : 'Crea Account'}
            </h2>
            <p className="text-xs text-[#918B82] font-medium">Inserisci i tuoi dati per continuare</p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-500 text-[11px] font-bold p-4 rounded-2xl text-center border border-rose-100 animate-in zoom-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-black theme-primary uppercase tracking-widest ml-4">Nome</label>
                <input 
                  type="text" 
                  required
                  disabled={isLoading}
                  className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-bold transition-all placeholder:font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Il tuo nome"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black theme-primary uppercase tracking-widest ml-4">Email</label>
              <input 
                type="email" 
                required
                disabled={isLoading}
                className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-bold transition-all placeholder:font-medium"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="email@esempio.it"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black theme-primary uppercase tracking-widest ml-4">Password</label>
              <input 
                type="password" 
                required
                disabled={isLoading}
                className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-bold transition-all placeholder:font-medium"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between px-2 pt-2">
              <label className="text-xs font-bold text-[#918B82] cursor-pointer flex items-center gap-2" onClick={() => !isLoading && setRememberMe(!rememberMe)}>
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${rememberMe ? 'theme-bg-primary border-transparent text-white' : 'border-[#D9D1C5]'}`}>
                  {rememberMe && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                </div>
                Rimani collegato
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 theme-bg-primary text-white rounded-[1.5rem] font-black text-[16px] shadow-lg active:scale-[0.98] transition-all mt-4 hover:shadow-xl hover:opacity-90"
            >
              {isLogin ? 'Accedi Ora' : 'Registrati Gratis'}
            </button>
          </form>
        </div>

        <div className="text-center">
          <button 
            onClick={() => { if(!isLoading) { setIsLogin(!isLogin); setError(''); } }}
            className="theme-primary font-black text-sm hover:underline tracking-tight"
          >
            {isLogin ? 'Nuovo utente? Crea un account' : 'Hai già un account? Accedi qui'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
