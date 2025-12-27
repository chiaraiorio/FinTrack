
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  onImportSync: (code: string) => boolean;
}

type AuthStep = 'login' | 'register' | 'import';

const Auth: React.FC<AuthProps> = ({ onLogin, onImportSync }) => {
  const [step, setStep] = useState<AuthStep>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [syncCode, setSyncCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const users: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');

      if (step === 'login') {
        const user = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.password === formData.password);
        if (user) onLogin(user);
        else setError('Credenziali errate.');
      } else if (step === 'register') {
        if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
          setError('Email già esistente.');
        } else {
          const newUser: User = { 
            id: generateId(), 
            ...formData, 
            updatedAt: Date.now(),
            settings: { monthlyBudget: 0, firstDayOfMonth: 1, defaultAccountId: '', showDecimals: true, textSize: 'medium' } 
          };
          localStorage.setItem('registered_users', JSON.stringify([...users, newUser]));
          onLogin(newUser);
        }
      } else if (step === 'import') {
        if (onImportSync(syncCode)) {
          // Successo gestito da App.tsx
        } else {
          setError('Codice non valido o corrotto.');
        }
      }
    } catch (err) { setError('Errore imprevisto.'); }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 animate-in fade-in">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 theme-bg-primary rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl mx-auto shadow-xl">FT</div>
          <h1 className="text-3xl font-black text-[#4A453E]">FinTrack</h1>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-[#EBE4D8] space-y-6">
          <h2 className="text-xl font-black text-center text-[#4A453E]">
            {step === 'login' ? 'Bentornato' : step === 'register' ? 'Nuovo Account' : 'Importa Dati'}
          </h2>

          {error && <p className="text-rose-500 text-[10px] font-bold text-center bg-rose-50 p-2 rounded-xl">{error}</p>}

          <form onSubmit={handleAuth} className="space-y-4">
            {step === 'import' ? (
              <textarea 
                className="w-full h-32 p-4 theme-sub-bg rounded-2xl font-mono text-[10px] outline-none" 
                placeholder="Incolla qui il tuo Sync Code..."
                value={syncCode}
                onChange={e => setSyncCode(e.target.value)}
                required
              />
            ) : (
              <>
                {step === 'register' && <input type="text" placeholder="Nome" className="w-full p-4 theme-sub-bg rounded-2xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />}
                <input type="email" placeholder="Email" className="w-full p-4 theme-sub-bg rounded-2xl outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                <input type="password" placeholder="Password" className="w-full p-4 theme-sub-bg rounded-2xl outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              </>
            )}
            <button type="submit" disabled={isLoading} className="w-full py-5 theme-bg-primary text-white rounded-3xl font-black shadow-lg">
              {isLoading ? 'Attendere...' : step === 'login' ? 'Accedi' : step === 'register' ? 'Registrati' : 'Importa ora'}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => setStep(step === 'login' ? 'register' : 'login')} className="text-center theme-primary font-black text-xs">
            {step === 'login' ? 'Crea un nuovo account' : 'Torna al Login'}
          </button>
          <button onClick={() => setStep('import')} className="text-center opacity-40 font-black text-[10px] uppercase tracking-widest">
            Usa Codice Sincronizzazione
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
