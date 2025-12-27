
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
    const users: User[] = JSON.parse(localStorage.getItem('registered_users') || '[]');

    if (isRegister) {
      if (users.find(u => u.email === formData.email)) {
        setError('Email già registrata.');
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        updatedAt: Date.now()
      };
      localStorage.setItem('registered_users', JSON.stringify([...users, newUser]));
      onLogin(newUser);
    } else {
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Email o password errati.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 theme-bg-primary rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl mx-auto shadow-xl">FT</div>
          <h1 className="text-3xl font-black text-[#4A453E]">FinTrack</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-[#EBE4D8] space-y-6">
          <h2 className="text-xl font-black text-center text-[#4A453E]">
            {isRegister ? 'Nuovo Account' : 'Bentornato'}
          </h2>
          {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}
          <div className="space-y-4">
            {isRegister && <input type="text" placeholder="Nome" className="w-full p-4 theme-sub-bg rounded-2xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />}
            <input type="email" placeholder="Email" className="w-full p-4 theme-sub-bg rounded-2xl outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            <input type="password" placeholder="Password" className="w-full p-4 theme-sub-bg rounded-2xl outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
          <button type="submit" className="w-full py-5 theme-bg-primary text-white rounded-3xl font-black shadow-lg active:scale-95 transition-all">
            {isRegister ? 'Registrati' : 'Accedi'}
          </button>
        </form>

        <button onClick={() => setIsRegister(!isRegister)} className="w-full text-center theme-primary font-black text-xs uppercase tracking-widest">
          {isRegister ? 'Hai già un account? Accedi' : 'Crea un nuovo account'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
