
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthStep = 'login' | 'register';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Piccolo delay per feedback visivo
    await new Promise(resolve => setTimeout(resolve, 600));
    const users: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');

    if (step === 'login') {
      const user = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.password === formData.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Email o password errati.');
        setIsLoading(false);
      }
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Compila tutti i campi.');
        setIsLoading(false);
        return;
      }
      if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
        setError('Email già registrata.');
        setIsLoading(false);
        return;
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password,
        isVerified: true,
        settings: {
          monthlyBudget: 0,
          firstDayOfMonth: 1,
          defaultAccountId: '',
          showDecimals: true,
          textSize: 'medium'
        }
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto animate-logo">
            <div className="absolute inset-0 theme-bg-primary rounded-[2rem] rotate-6 opacity-20 scale-110"></div>
            <div className="relative w-full h-full theme-bg-primary rounded-[2rem] flex items-center justify-center shadow-xl border border-white/20">
              <span className="text-2xl font-black text-white">FT</span>
            </div>
          </div>
          <div className="pt-2">
            <h1 className="text-4xl font-black text-[#4A453E] tracking-tighter">FinTrack</h1>
            <p className="text-[#918B82] font-semibold text-xs uppercase tracking-widest">Risparmio Intelligente</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-[#EBE4D8] space-y-6 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 theme-border border-t-current theme-primary rounded-full animate-spin"></div>
            </div>
          )}

          <div className="text-center">
            <h2 className="text-2xl font-black text-[#4A453E]">{step === 'login' ? 'Bentornato' : 'Inizia ora'}</h2>
          </div>

          {error && <div className="bg-rose-50 text-rose-500 text-[11px] font-bold p-3 rounded-xl text-center border border-rose-100">{error}</div>}

          <form onSubmit={handleAuth} className="space-y-4">
            {step === 'register' && (
              <input 
                type="text" required
                className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none theme-primary font-bold placeholder:font-medium outline-none"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Nome completo"
              />
            )}
            <input 
              type="email" required
              className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none theme-primary font-bold placeholder:font-medium outline-none"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="Email"
            />
            <input 
              type="password" required
              className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none theme-primary font-bold placeholder:font-medium outline-none"
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder="Password"
            />
            <button type="submit" className="w-full py-5 theme-bg-primary text-white rounded-3xl font-black text-[15px] shadow-lg active:scale-95 transition-all">
              {step === 'login' ? 'Accedi' : 'Crea Account'}
            </button>
          </form>
        </div>

        <button onClick={() => setStep(step === 'login' ? 'register' : 'login')} className="w-full text-center theme-primary font-black text-sm hover:underline transition-all">
          {step === 'login' ? 'Nuovo qui? Registrati ora' : 'Hai già un account? Accedi'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
