
import React, { useState, useEffect } from 'react';
import { Account, SavingsJar, LinkedCard } from '../types';
import CategoryIcon from './CategoryIcon';

interface AccountManagerProps {
  accounts: Account[];
  onAdd: (acc: Omit<Account, 'id'>) => void;
  onUpdate: (acc: Account) => void;
  onDelete: (id: string) => void;
  hideBalances: boolean;
  onToggleHideBalances: () => void;
  onOpenSidebar: () => void;
  jars: SavingsJar[];
  onAddJar: (jar: Omit<SavingsJar, 'id'>) => void;
  onUpdateJar: (jar: SavingsJar) => void;
  onDeleteJar: (id: string) => void;
  onMoveFunds: (amount: number, from: {type: 'acc' | 'card' | 'jar', id: string}, to: {type: 'acc' | 'card' | 'jar', id: string}, notes: string) => void;
}

const AccountManager: React.FC<AccountManagerProps> = ({ 
  accounts, onAdd, onUpdate, onDelete, 
  hideBalances, onToggleHideBalances, onOpenSidebar,
  jars, onAddJar, onUpdateJar, onDeleteJar, onMoveFunds
}) => {
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
  const [showAccForm, setShowAccForm] = useState(false);
  const [showJarForm, setShowJarForm] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState<string | null>(null);
  const [activeTransfer, setActiveTransfer] = useState<{from: any, jar?: SavingsJar, card?: LinkedCard} | null>(null);
  
  const [accName, setAccName] = useState('');
  const [accBalance, setAccBalance] = useState('');
  const [accType, setAccType] = useState<'Banca' | 'Contanti' | 'Carta' | 'Altro'>('Banca');
  
  const [jarName, setJarName] = useState('');
  const [jarTarget, setJarTarget] = useState('');

  const [cardName, setCardName] = useState('');
  const [cardBalance, setCardBalance] = useState('');
  const [cardType, setCardType] = useState<'Credito' | 'Prepagata' | 'Debito'>('Debito');

  const [txAmount, setTxAmount] = useState('');

  const handleAccSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;
    onAdd({ name: accName, balance: parseFloat(accBalance) || 0, type: accType, color: '#8E7C68', cards: [] });
    setAccName(''); setAccBalance(''); setShowAccForm(false);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !showCardForm) return;
    const acc = accounts.find(a => a.id === showCardForm);
    if (!acc) return;
    const newCard: LinkedCard = { id: crypto.randomUUID(), name: cardName, balance: parseFloat(cardBalance) || 0, type: cardType };
    onUpdate({ ...acc, cards: [...acc.cards, newCard] });
    setCardName(''); setCardBalance(''); setShowCardForm(null);
  };

  const handleJarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jarName.trim() || !jarTarget || !showJarForm) return;
    onAddJar({ name: jarName, targetAmount: parseFloat(jarTarget) || 0, currentAmount: 0, accountId: showJarForm, color: '#8E7C68', icon: 'briefcase' });
    setJarName(''); setJarTarget(''); setShowJarForm(null);
  };

  const executeTransfer = (isToJar: boolean) => {
    const amount = parseFloat(txAmount);
    if (!activeTransfer || isNaN(amount) || amount <= 0) return;
    
    if (activeTransfer.jar) {
      const from = isToJar ? {type: 'acc' as const, id: activeTransfer.from} : {type: 'jar' as const, id: activeTransfer.jar.id};
      const to = isToJar ? {type: 'jar' as const, id: activeTransfer.jar.id} : {type: 'acc' as const, id: activeTransfer.from};
      onMoveFunds(amount, from, to, isToJar ? `Risparmio per ${activeTransfer.jar.name}` : `Prelievo da ${activeTransfer.jar.name}`);
    } else if (activeTransfer.card) {
      const from = isToJar ? {type: 'acc' as const, id: activeTransfer.from} : {type: 'card' as const, id: activeTransfer.card.id};
      const to = isToJar ? {type: 'card' as const, id: activeTransfer.card.id} : {type: 'acc' as const, id: activeTransfer.from};
      onMoveFunds(amount, from, to, isToJar ? `Ricarica ${activeTransfer.card.name}` : `Storno da ${activeTransfer.card.name}`);
    }
    
    setActiveTransfer(null);
    setTxAmount('');
  };

  return (
    <div className="px-5 pt-12 space-y-8 pb-40">
      <header className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <button onClick={onOpenSidebar} className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform">
            <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <button onClick={onToggleHideBalances} className="w-10 h-10 theme-card rounded-full flex items-center justify-center theme-primary">
            {hideBalances ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          </button>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-black text-[#4A453E] tracking-tight">I miei Conti</h1>
          <button onClick={() => setShowAccForm(true)} className="theme-bg-primary text-white p-2.5 rounded-2xl shadow-lg active:scale-95 transition-all">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
        </div>
      </header>

      <section className="space-y-4">
        {accounts.map(a => {
          const isExpanded = expandedAccountId === a.id;
          const accountJars = jars.filter(j => j.accountId === a.id);
          const totalAssets = a.balance + a.cards.reduce((s, c) => s + c.balance, 0) + accountJars.reduce((s, j) => s + j.currentAmount, 0);

          return (
            <div key={a.id} className={`bg-white rounded-[2.5rem] border theme-border shadow-sm transition-all duration-300 ${isExpanded ? 'ring-2 theme-primary ring-opacity-20' : ''}`}>
              <div onClick={() => setExpandedAccountId(isExpanded ? null : a.id)} className="p-6 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: a.color }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-black text-[#4A453E] text-lg leading-tight">{a.name}</h4>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Patrimonio</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-xl font-black text-[#4A453E] tracking-tight">{hideBalances ? '€ ••••' : `€${totalAssets.toLocaleString('it-IT')}`}</p>
                    <p className="text-[10px] font-bold theme-primary uppercase">{isExpanded ? 'Chiudi' : 'Espandi'}</p>
                  </div>
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-8 space-y-8 animate-in slide-in-from-top-4 border-t theme-border pt-6">
                  <div className="bg-gray-50 p-5 rounded-3xl flex items-center justify-between border theme-border">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center theme-primary shadow-sm">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       </div>
                       <div>
                         <p className="text-xs font-black text-[#4A453E]">Disponibilità</p>
                       </div>
                    </div>
                    <p className="text-lg font-black text-[#4A453E]">€{a.balance.toLocaleString('it-IT')}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h5 className="text-[10px] font-black opacity-50 uppercase tracking-widest">Carte Collegate</h5>
                      <button onClick={() => setShowCardForm(a.id)} className="text-[10px] font-black uppercase theme-primary">+ Aggiungi</button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {a.cards.map(card => (
                        <div key={card.id} className="theme-sub-bg p-4 rounded-2xl flex items-center justify-between border theme-border group">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-10 h-6 bg-white border theme-border rounded flex items-center justify-center flex-shrink-0">
                               <div className="w-4 h-3 bg-gray-200 rounded-sm"></div>
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-black text-[#4A453E] truncate">{card.name}</p>
                              <p className="text-[9px] font-bold opacity-40 uppercase">{card.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <p className="text-sm font-black text-[#4A453E]">€{card.balance.toLocaleString('it-IT')}</p>
                            <button onClick={() => setActiveTransfer({from: a.id, card: card})} className="p-2 theme-primary bg-white rounded-lg shadow-sm active:scale-90 transition-transform">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h5 className="text-[10px] font-black opacity-50 uppercase tracking-widest">Salvadanai</h5>
                      <button onClick={() => setShowJarForm(a.id)} className="text-[10px] font-black uppercase theme-primary">+ Crea</button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {accountJars.map(jar => {
                        const progress = (jar.currentAmount / jar.targetAmount) * 100;
                        return (
                          <div key={jar.id} className="theme-sub-bg p-4 rounded-[2rem] border theme-border space-y-4">
                            <div className="flex justify-between items-center gap-2">
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <div className="w-7 h-7 bg-white rounded-lg flex-shrink-0 flex items-center justify-center theme-primary shadow-sm">
                                  <CategoryIcon iconName={jar.icon} className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black text-[#4A453E] truncate">{jar.name}</span>
                              </div>
                              <button 
                                onClick={() => setActiveTransfer({from: a.id, jar: jar})} 
                                className="px-2 py-1 bg-white rounded-lg text-[7px] font-black theme-primary uppercase tracking-tighter shadow-sm active:scale-95 border theme-border flex-shrink-0"
                              >
                                Sposta
                              </button>
                            </div>
                            <div className="space-y-1.5 px-1">
                              <div className="flex justify-between items-baseline">
                                <p className="text-sm font-black text-[#4A453E]">€{jar.currentAmount.toLocaleString()} <span className="text-[9px] opacity-30 font-bold">/ {jar.targetAmount.toLocaleString()}</span></p>
                                <span className="text-[9px] font-black theme-primary">{progress.toFixed(0)}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                                <div className="h-full theme-bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {showAccForm && (
        <div className="fixed inset-0 bg-[#4A453E]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <form onSubmit={handleAccSubmit} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-center text-[#4A453E]">Nuovo Conto</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nome Banca" className="w-full p-4 theme-sub-bg rounded-2xl theme-primary font-bold outline-none" value={accName} onChange={e => setAccName(e.target.value)} required />
              <input type="number" placeholder="Saldo Iniziale" className="w-full p-4 theme-sub-bg rounded-2xl theme-primary font-bold outline-none" value={accBalance} onChange={e => setAccBalance(e.target.value)} required />
              <select className="w-full p-4 theme-sub-bg rounded-2xl theme-primary font-bold outline-none" value={accType} onChange={e => setAccType(e.target.value as any)}>
                <option value="Banca">Banca</option>
                <option value="Contanti">Contanti</option>
                <option value="Carta">Prepagata</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-4 theme-bg-primary text-white rounded-2xl font-black text-sm">Crea</button>
              <button type="button" onClick={() => setShowAccForm(false)} className="px-6 py-4 theme-sub-bg text-[#918B82] rounded-2xl font-black text-sm">Chiudi</button>
            </div>
          </form>
        </div>
      )}

      {showCardForm && (
        <div className="fixed inset-0 bg-[#4A453E]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <form onSubmit={handleCardSubmit} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-center text-[#4A453E]">Aggiungi Carta</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nome Carta" className="w-full p-4 theme-sub-bg rounded-2xl theme-primary font-bold outline-none" value={cardName} onChange={e => setCardName(e.target.value)} required />
              <input type="number" placeholder="Saldo Attuale" className="w-full p-4 theme-sub-bg rounded-2xl theme-primary font-bold outline-none" value={cardBalance} onChange={e => setCardBalance(e.target.value)} required />
              <select className="w-full p-4 theme-sub-bg rounded-2xl theme-primary font-bold outline-none" value={cardType} onChange={e => setCardType(e.target.value as any)}>
                <option value="Debito">Debito</option>
                <option value="Prepagata">Prepagata</option>
                <option value="Credito">Credito</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-4 theme-bg-primary text-white rounded-2xl font-black text-sm">Aggiungi</button>
              <button type="button" onClick={() => setShowCardForm(null)} className="px-6 py-4 theme-sub-bg text-[#918B82] rounded-2xl font-black text-sm">Indietro</button>
            </div>
          </form>
        </div>
      )}

      {showJarForm && (
        <div className="fixed inset-0 bg-[#4A453E]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
          <form onSubmit={handleJarSubmit} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-black text-center text-[#4A453E]">Nuovo Risparmio</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Cosa stai risparmiando?" className="w-full p-4 theme-sub-bg rounded-2xl theme-primary font-bold outline-none" value={jarName} onChange={e => setJarName(e.target.value)} required />
              <input type="number" placeholder="Obiettivo (€)" className="w-full p-4 theme-sub-bg rounded-2xl theme-primary font-bold outline-none" value={jarTarget} onChange={e => setJarTarget(e.target.value)} required />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-4 theme-bg-primary text-white rounded-2xl font-black text-sm">Crea</button>
              <button type="button" onClick={() => setShowJarForm(null)} className="px-6 py-4 theme-sub-bg text-[#918B82] rounded-2xl font-black text-sm">Indietro</button>
            </div>
          </form>
        </div>
      )}

      {activeTransfer && (
        <div className="fixed inset-0 bg-[#4A453E]/40 backdrop-blur-sm z-[120] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-black text-[#4A453E]">Trasferisci</h3>
              <p className="text-[10px] text-[#918B82] font-black uppercase mt-1 tracking-widest">{activeTransfer.jar?.name || activeTransfer.card?.name}</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black theme-primary">€</span>
                <input type="number" autoFocus className="w-full pl-8 pr-4 py-4 bg-[#FAF7F2] rounded-2xl text-2xl font-black theme-primary outline-none text-center" placeholder="0.00" value={txAmount} onChange={e => setTxAmount(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => executeTransfer(true)} className="w-full py-4 theme-bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform">Versa</button>
              <button onClick={() => executeTransfer(false)} className="w-full py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform border border-rose-100">Preleva</button>
              <button onClick={() => setActiveTransfer(null)} className="w-full py-3 text-[#918B82] font-bold text-xs uppercase tracking-widest mt-2">Chiudi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManager;
