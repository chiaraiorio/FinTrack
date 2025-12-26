
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthStep = 'login' | 'register' | 'verify';

interface EmailSimulation {
  to: string;
  code: string;
  show: boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [emailNotice, setEmailNotice] = useState<EmailSimulation>({ to: '', code: '', show: false });

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
    setEmailNotice({ to: email, code, show: true });
    console.log(`%c[EMAIL SIMULATION]`, 'color: #10B981; font-weight: bold;', `Inviata email a ${email} con codice: ${code}`);
    setTimeout(() => {
      setEmailNotice(prev => ({ ...prev, show: false }));
    }, 15000);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const users: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');

    if (step === 'login') {
      const user = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.password === formData.password);
      if (user) {
        if (!user.isVerified) {
          // L'utente esiste ma non è verificato, procedi alla verifica
          const code = generateOTP();
          setGeneratedCode(code);
          simulateEmailSend(user.email, code);
          setFormData({ ...formData, name: user.name }); // Recupera il nome per la sessione
          setStep('verify');
          setSuccess('Bentornato! Completa la verifica per accedere.');
        } else {
          onLogin(user);
        }
      } else {
        setError('Credenziali non valide. Controlla email e password.');
      }
      setIsLoading(false);
    } else if (step === 'register') {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Tutti i campi sono obbligatori.');
        setIsLoading(false);
        return;
      }
      if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
        setError('Questa email è già registrata. Prova ad accedere.');
        setIsLoading(false);
        return;
      }

      // CREAZIONE IMMEDIATA ACCOUNT (Persistenza)
      const newUser: User = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password,
        isVerified: false, // Inizia come non verificato
        settings: {
          monthlyBudget: 0,
          firstDayOfMonth: 1,
          defaultAccountId: '',
          showDecimals: true,
          textSize: 'medium'
        }
      };

      // Salvataggio nel database locale subito
      localStorage.setItem('registered_users', JSON.stringify([...users, newUser]));

      const code = generateOTP();
      setGeneratedCode(code);
      simulateEmailSend(formData.email, code);
      setStep('verify');
      setIsLoading(false);
      setSuccess('Account creato con successo! Verifica la tua email.');
    }
  };

  const handleVerify = async () => {
    const enteredCode = otp.join('');
    if (enteredCode.length < 6) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (enteredCode === generatedCode) {
      const users: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const userIndex = users.findIndex(u => u.email.toLowerCase() === formData.email.toLowerCase());

      if (userIndex !== -1) {
        // Aggiorna lo stato di verifica nel database permanente
        users[userIndex].isVerified = true;
        localStorage.setItem('registered_users', JSON.stringify(users));
        
        setEmailNotice(prev => ({ ...prev, show: false }));
        onLogin(users[userIndex]);
      } else {
        setError('Errore critico: account non trovato. Riprova la registrazione.');
        setStep('register');
        setIsLoading(false);
      }
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
    setSuccess('Nuovo codice inviato correttamente!');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 animate-in fade-in duration-500 relative overflow-hidden">
      
      {/* EMAIL NOTIFICATION SIMULATOR */}
      {emailNotice.show && (
        <div className="fixed top-6 left-6 right-6 z-[200] animate-in slide-in-from-top-10 duration-500">
          <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl border-l-4 border-emerald-500 p-5 flex gap-4 items-start ring-1 ring-black/5">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Simulazione Email</span>
                <button onClick={() => setEmailNotice(prev => ({ ...prev, show: false }))} className="text-[#D9D1C5]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-[13px] font-black text-[#4A453E]">Codice di Verifica FinTrack</p>
              <p className="text-[12px] text-[#918B82] leading-tight mt-0.5">
                Copia questo codice nell'app: <span className="text-emerald-600 font-black text-[16px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{emailNotice.code}</span>
              </p>
            </div>
          </div>
        </div>
      )}

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
            <p className="text-[#918B82] font-semibold text-sm">Gestione Finanziaria Intelligente</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-[#8E7C6810] border border-[#EBE4D8] space-y-6 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
              <div className="w-10 h-10 border-4 theme-border border-t-current theme-primary rounded-full animate-spin"></div>
              <p className="text-[11px] font-black uppercase tracking-widest theme-primary">Sincronizzazione...</p>
            </div>
          )}

          {step !== 'verify' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-[#4A453E]">
                  {step === 'login' ? 'Accedi' : 'Inizia Ora'}
                </h2>
                <p className="text-xs text-[#918B82] font-medium">
                  {step === 'login' ? 'Bentornato, inserisci i tuoi dati' : 'Crea il tuo spazio finanziario sicuro'}
                </p>
              </div>

              {error && <div className="bg-rose-50 text-rose-500 text-[11px] font-bold p-4 rounded-2xl text-center border border-rose-100 animate-pulse">{error}</div>}

              <form onSubmit={handleAuth} className="space-y-4">
                {step === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black theme-primary uppercase tracking-widest ml-4">Nome Completo</label>
                    <input 
                      type="text" required disabled={isLoading}
                      className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-bold transition-all placeholder:font-medium"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Come ti chiami?"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black theme-primary uppercase tracking-widest ml-4">Email</label>
                  <input 
                    type="email" required disabled={isLoading}
                    className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-bold transition-all placeholder:font-medium"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="tua@email.it"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black theme-primary uppercase tracking-widest ml-4">Password</label>
                  <input 
                    type="password" required disabled={isLoading}
                    className="w-full bg-[#FAF7F2] p-4 rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-bold transition-all placeholder:font-medium"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="La tua password"
                  />
                </div>
                <button 
                  type="submit" disabled={isLoading}
                  className="w-full py-5 theme-bg-primary text-white rounded-3xl font-black text-[16px] shadow-lg active:scale-[0.98] transition-all mt-4"
                >
                  {step === 'login' ? 'Accedi' : 'Registrati e Continua'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-2">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h2 className="text-2xl font-black text-[#4A453E]">Verifica Sicura</h2>
                <p className="text-xs text-[#918B82] font-medium leading-relaxed">
                  Abbiamo inviato il codice a <br/><span className="theme-primary font-bold">{formData.email}</span>
                </p>
                <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 py-1.5 px-4 rounded-full inline-block mt-2 border border-emerald-100 animate-bounce">
                  Controlla la notifica in alto!
                </div>
              </div>

              {error && <div className="bg-rose-50 text-rose-500 text-[11px] font-bold p-4 rounded-2xl text-center border border-rose-100">{error}</div>}
              {success && <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold p-3 rounded-2xl text-center border border-emerald-100">{success}</div>}

              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-10 h-14 bg-[#FAF7F2] rounded-xl text-center text-xl font-black theme-primary focus:ring-2 focus:ring-current outline-none transition-shadow"
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
                Verifica Account
              </button>

              <div className="text-center space-y-3">
                <button 
                  onClick={resendCode}
                  disabled={countdown > 0}
                  className={`text-[11px] font-black uppercase tracking-widest transition-colors ${countdown > 0 ? 'text-[#D9D1C5]' : 'theme-primary'}`}
                >
                  {countdown > 0 ? `Nuovo codice tra ${countdown}s` : 'Reinvia codice di sicurezza'}
                </button>
                <button 
                  onClick={() => { setStep('login'); setOtp(['','','','','','']); setError(''); setEmailNotice(prev => ({ ...prev, show: false })); }}
                  className="block mx-auto text-[11px] font-bold text-[#918B82] uppercase hover:theme-primary transition-colors"
                >
                  Cambia Email o Password
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
              {step === 'login' ? 'Non hai un account? Registrati ora' : 'Sei già registrato? Accedi subito'}
            </button>
          </div>
        )}
      </div>
      
      {/* Footer info persistence */}
      <div className="mt-8 text-[10px] font-bold text-[#918B82] opacity-40 uppercase tracking-widest text-center px-10">
        I tuoi dati sono salvati in modo sicuro su questo dispositivo
      </div>
    </div>
  );
};

export default Auth;
