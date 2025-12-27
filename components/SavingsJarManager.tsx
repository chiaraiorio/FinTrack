
import React, { useState } from 'react';
import { SavingsJar, Account } from '../types';
import CategoryIcon from './CategoryIcon';

interface SavingsJarManagerProps {
  accounts: Account[];
  jars: SavingsJar[];
  onAdd: (jar: Omit<SavingsJar, 'id'>) => void;
  onUpdate: (jar: SavingsJar) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  onOpenSidebar: () => void;
}

const SavingsJarManager: React.FC<SavingsJarManagerProps> = ({ accounts, jars, onAdd, onUpdate, onDelete, onBack, onOpenSidebar }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingJarId, setEditingJarId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Omit<SavingsJar, 'id'>>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    accountId: accounts[0]?.id || '',
    color: '#8E7C68',
    icon: 'briefcase'
  });

  const [transactionAmount, setTransactionAmount] = useState('');
  const [activeJarForTx, setActiveJarForTx] = useState<SavingsJar | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || formState.targetAmount <= 0) return;

    if (editingJarId) {
      onUpdate({ ...formState, id: editingJarId });
    } else {
      onAdd(formState);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormState({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      accountId: accounts[0]?.id || '',
      color: '#8E7C68',
      icon: 'briefcase'
    });
    setEditingJarId(null);
    setShowForm(false);
  };

  const handleUpdateAmount = (jar: SavingsJar, delta: number) => {
    onUpdate({ ...jar, currentAmount: Math.max(0, jar.currentAmount + delta) });
    setActiveJarForTx(null);
    setTransactionAmount('');
  };

  const icons = ['briefcase', 'house', 'car', 'gift', 'bolt', 'heart', 'cup', 'cart'];

  return (
    <div className="px-5 pt-12 space-y-8 pb-32">
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-1 theme-primary -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            <span className="text-lg font-medium">Indietro</span>
          </button>
          <button onClick={onOpenSidebar} className="w-10 h-10 theme-card rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-black text-[#4A453E] tracking-tight">Salvadanai</h1>
          <button 
            onClick={() => setShowForm(true)}
            className="theme-bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg"
          >
            + Nuovo
          </button>
        </div>
        <p className="text-xs text-[#918B82] font-medium leading-relaxed">
          Monitora i tuoi risparmi virtuali legati ai conti senza spostare realmente il saldo.
        </p>
      </header>

      {showForm && (
        <div className="bg-white p-6 rounded-[2.5rem] border theme-border shadow-xl space-y-5 animate-in zoom-in duration-300">
          <h2 className="text-sm font-black theme-primary uppercase tracking-widest text-center">Configura Salvadanaio</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black opacity-60 uppercase mb-1 ml-1">Nome Obiettivo</label>
              <input type="text" className="w-full theme-sub-bg p-3 rounded-2xl theme-primary font-bold outline-none" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} placeholder="Es: Nuova Auto" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black opacity-60 uppercase mb-1 ml-1">Obiettivo (€)</label>
                <input type="number" className="w-full theme-sub-bg p-3 rounded-2xl theme-primary font-bold outline-none" value={formState.targetAmount} onChange={e => setFormState({...formState, targetAmount: parseFloat(e.target.value) || 0})} required />
              </div>
              <div>
                <label className="block text-[10px] font-black opacity-60 uppercase mb-1 ml-1">Già Risparmiati (€)</label>
                <input type="number" className="w-full theme-sub-bg p-3 rounded-2xl theme-primary font-bold outline-none" value={formState.currentAmount} onChange={e => setFormState({...formState, currentAmount: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black opacity-60 uppercase mb-1 ml-1">Conto di Riferimento</label>
              <select className="w-full theme-sub-bg p-3 rounded-2xl theme-primary font-bold outline-none" value={formState.accountId} onChange={e => setFormState({...formState, accountId: e.target.value})}>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black opacity-60 uppercase mb-2 ml-1">Icona</label>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {icons.map(i => (
                  <button key={i} type="button" onClick={() => setFormState({...formState, icon: i})} className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${formState.icon === i ? 'theme-bg-primary text-white scale-110 shadow-md' : 'theme-sub-bg text-gray-400'}`}>
                    <CategoryIcon iconName={i} className="w-5 h-5" color={formState.icon === i ? 'white' : 'currentColor'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-4 theme-bg-primary text-white rounded-2xl font-black text-sm active:scale-95 transition-transform">Salva</button>
              <button type="button" onClick={resetForm} className="px-6 py-4 theme-sub-bg text-[#918B82] rounded-2xl font-black text-sm active:scale-95 transition-transform">Annulla</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {jars.length === 0 ? (
          <div className="text-center py-20 opacity-30 italic">Crea il tuo primo obiettivo di risparmio!</div>
        ) : jars.map(jar => {
          const progress = Math.min(100, (jar.currentAmount / jar.targetAmount) * 100);
          const acc = accounts.find(a => a.id === jar.accountId);
          return (
            <div key={jar.id} className="theme-card rounded-[2.5rem] p-6 bg-white border theme-border shadow-sm space-y-4 hover:scale-[1.01] transition-transform">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 theme-sub-bg rounded-2xl flex items-center justify-center theme-primary shadow-inner">
                    <CategoryIcon iconName={jar.icon} className="w-6 h-6" color="var(--primary)" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#4A453E] leading-tight">{jar.name}</h3>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{acc?.name || 'Conto Sconosciuto'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setFormState(jar); setEditingJarId(jar.id); setShowForm(true); }} className="text-[#D9D1C5] hover:theme-primary"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={() => { if(confirm('Eliminare questo salvadanaio?')) onDelete(jar.id); }} className="text-[#D9D1C5] hover:text-rose-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#4A453E]">€{jar.currentAmount.toLocaleString()}</span>
                      <span className="text-[10px] font-black text-[#918B82] uppercase">su €{jar.targetAmount.toLocaleString()}</span>
                   </div>
                   <span className="text-xs font-black theme-primary">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 theme-sub-bg rounded-full overflow-hidden">
                  <div className="h-full theme-bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setActiveJarForTx(jar)}
                  className="flex-1 py-3 bg-[#FAF7F2] border theme-border theme-primary rounded-xl font-bold text-xs uppercase hover:bg-white active:scale-95 transition-all"
                >
                  Aggiorna Risparmio
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeJarForTx && (
        <div className="fixed inset-0 bg-[#4A453E]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl space-y-6 text-center animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-[#4A453E]">Aggiungi o Rimuovi</h3>
            <p className="text-xs text-[#918B82] font-medium leading-relaxed">Inserisci l'importo da accantonare o prelevare virtualmente per {activeJarForTx.name}.</p>
            <input 
              type="number" autoFocus
              className="w-full text-3xl font-black text-center theme-primary bg-[#FAF7F2] p-4 rounded-2xl border-none outline-none"
              placeholder="0.00"
              value={transactionAmount}
              onChange={e => setTransactionAmount(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <button 
                disabled={!transactionAmount}
                onClick={() => handleUpdateAmount(activeJarForTx, parseFloat(transactionAmount))}
                className="w-full py-4 theme-bg-primary text-white rounded-2xl font-black text-sm active:scale-95 disabled:opacity-50"
              >
                Versa Risparmio
              </button>
              <button 
                disabled={!transactionAmount}
                onClick={() => handleUpdateAmount(activeJarForTx, -parseFloat(transactionAmount))}
                className="w-full py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-sm active:scale-95 disabled:opacity-50"
              >
                Preleva Risparmio
              </button>
              <button onClick={() => setActiveJarForTx(null)} className="w-full py-4 theme-sub-bg text-[#918B82] rounded-2xl font-black text-sm active:scale-95">Chiudi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsJarManager;
