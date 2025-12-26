
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthStep = 'login' | 'register' | 'verify';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const simulateEmailSend = (email: string, code: string) => {
    console.log(`%c[EMAIL SIMULATION]`, 'color: #10B981; font-weight: bold;', `Inviata email a ${email} con codice: ${code}`);
    // In un'app reale qui chiameremmo un servizio come SendGrid o AWS SES
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1200));
    const users: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');

    if (step === 'login') {
      const user = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.password === formData.password);
      if (user) {
        if (!user.isVerified) {
          const code = generateOTP();
          setGeneratedCode(code);
          simulateEmailSend(user.email, code);
          setStep('verify');
          setIsLoading(false);
        } else {
          onLogin(user);
        }
      } else {
        setError('Credenziali non valide. Controlla email e password.');
        setIsLoading(false);
      }
    } else if (step === 'register') {
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

      const code = generateOTP();
      setGeneratedCode(code);
      simulateEmailSend(formData.email, code);
      setStep('verify');
      setIsLoading(false);
      setSuccess('Codice di verifica inviato alla tua email!');
    }
  };

  const handleVerify = async () => {
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (enteredCode === generatedCode) {
      const users: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');
      let user = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());

      if (!user) {
        // Registrazione nuovo utente
        user = {
          id: crypto.randomUUID(),
          name: formData.name,
          email: formData.email,
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
        localStorage.setItem('registered_users', JSON.stringify([...users, user]));
      } else {
        // Aggiorna utente esistente a verificato
        user.isVerified = true;
        const updatedUsers = users.map(u => u.id === user?.id ? user! : u);
        localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
      }

      onLogin(user);
    } else {
      setError('Codice non corretto. Riprova.');
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const resendCode = () => {
    if (countdown > 0) return;
    const code = generateOTP();
    setGeneratedCode(code);
    simulateEmailSend(formData.email, code);
    setCountdown(60);
    setSuccess('Nuovo codice inviato!');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 animate-in fade-in duration-500">
      <div className="w-full max-w-sm space-y-10">
        
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto animate-logo">
            <div className="absolute inset-0 theme-bg-primary rounded-[2.5rem] rotate-6 opacity-20 scale-110"></div>
            <div className="relative w-full h-full theme-bg-primary rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-current/20 border border-white/20">
              <span className="text-3xl font-black text-white">FT</span>
            </div>
          </div>
          <div className="pt-2">
            <h1 className="text-4xl font-black text-[#4A453E] tracking-tighter">FinTrack</h1>
            <p className="text-[#918B82] font-semibold text-sm">Autenticazione Sicura</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-[#8E7C6810] border border-[#EBE4D8] space-y-6 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
              <div className="w-10 h-10 border-4 theme-border border-t-current theme-primary rounded-full animate-spin"></div>
              <p className="text-[11px] font-black uppercase tracking-widest theme-primary">Elaborazione...</p>
            </div>
          )}

          {step !== 'verify' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-[#4A453E]">
                  {step === 'login' ? 'Accedi' : 'Crea Account'}
                </h2>
                <p className="text-xs text-[#918B82] font-medium">Inserisci le tue credenziali</p>
              </div>

              {error && <div className="bg-rose-50 text-rose-500 text-[11px] font-bold p-3 rounded-2xl text-center border border-rose-100">{error}</div>}

              <form onSubmit={handleAuth} className="space-y-4">
                {step === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black theme-primary uppercase tracking-widest ml-4">Nome</label>
                    <input 
                      type="text" required disabled={isLoading}
                      className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-bold transition-all placeholder:font-medium"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Il tuo nome"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black theme-primary uppercase tracking-widest ml-4">Email</label>
                  <input 
                    type="email" required disabled={isLoading}
                    className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-bold transition-all placeholder:font-medium"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="email@esempio.it"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black theme-primary uppercase tracking-widest ml-4">Password</label>
                  <input 
                    type="password" required disabled={isLoading}
                    className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-bold transition-all placeholder:font-medium"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                <button 
                  type="submit" disabled={isLoading}
                  className="w-full py-5 theme-bg-primary text-white rounded-3xl font-black text-[16px] shadow-lg active:scale-[0.98] transition-all mt-4"
                >
                  {step === 'login' ? 'Accedi' : 'Continua'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-2">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-2xl font-black text-[#4A453E]">Verifica Email</h2>
                <p className="text-xs text-[#918B82] font-medium leading-relaxed">
                  Abbiamo inviato un codice a 6 cifre a <br/><span className="theme-primary font-bold">{formData.email}</span>
                </p>
              </div>

              {error && <div className="bg-rose-50 text-rose-500 text-[11px] font-bold p-3 rounded-2xl text-center border border-rose-100">{error}</div>}
              {success && <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold p-3 rounded-2xl text-center border border-emerald-100">{success}</div>}

              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-10 h-14 bg-[#FAF7F2] rounded-xl text-center text-xl font-black theme-primary focus:ring-2 focus:ring-current outline-none"
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !digit && i > 0) {
                        document.getElementById(`otp-${i-1}`)?.focus();
                      }
                    }}
                  />
                ))}
              </div>

              <button 
                onClick={handleVerify}
                disabled={isLoading || otp.some(d => !d)}
                className="w-full py-5 theme-bg-primary text-white rounded-3xl font-black text-[16px] shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Conferma Codice
              </button>

              <div className="text-center space-y-3">
                <button 
                  onClick={resendCode}
                  disabled={countdown > 0}
                  className={`text-[11px] font-black uppercase tracking-widest ${countdown > 0 ? 'text-[#D9D1C5]' : 'theme-primary'}`}
                >
                  {countdown > 0 ? `Invia di nuovo tra ${countdown}s` : 'Non hai ricevuto nulla? Reinvia'}
                </button>
                <button 
                  onClick={() => { setStep('login'); setOtp(['','','','','','']); setError(''); }}
                  className="block mx-auto text-[11px] font-bold text-[#918B82] uppercase"
                >
                  Torna indietro
                </button>
              </div>
            </div>
          )}
        </div>

        {step !== 'verify' && (
          <div className="text-center">
            <button 
              onClick={() => { if(!isLoading) { setStep(step === 'login' ? 'register' : 'login'); setError(''); } }}
              className="theme-primary font-black text-sm hover:underline tracking-tight"
            >
              {step === 'login' ? 'Nuovo utente? Crea un account' : 'Hai già un account? Accedi qui'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
