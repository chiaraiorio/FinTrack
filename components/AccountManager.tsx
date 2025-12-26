
import React, { useState, useEffect } from 'react';
import { Account } from '../types';

interface AccountManagerProps {
  accounts: Account[];
  onAdd: (acc: Omit<Account, 'id'>) => void;
  onUpdate: (acc: Account) => void;
  onDelete: (id: string) => void;
  onAddIncome: () => void;
  onMove?: (index: number, direction: 'up' | 'down') => void;
  hideBalances: boolean;
  onToggleHideBalances: () => void;
  onOpenSidebar: () => void;
}

const AccountManager: React.FC<AccountManagerProps> = ({ 
  accounts, onAdd, onUpdate, onDelete, onAddIncome, onMove, 
  hideBalances, onToggleHideBalances, onOpenSidebar 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Omit<Account, 'id'>>({ 
    name: '', 
    balance: 0, 
    type: 'Banca', 
    color: '#8E7C68',
    linkedCardName: ''
  });
  const [hasLinkedCard, setHasLinkedCard] = useState(false);

  useEffect(() => {
    if (editingAccountId) {
      const acc = accounts.find(a => a.id === editingAccountId);
      if (acc) {
        setFormState({ 
          name: acc.name, 
          balance: acc.balance, 
          type: acc.type, 
          color: acc.color,
          linkedCardName: acc.linkedCardName || ''
        });
        setHasLinkedCard(!!acc.linkedCardName);
        setShowForm(true);
      }
    }
  }, [editingAccountId, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.name.trim()) {
      const finalAccount = {
        ...formState,
        linkedCardName: hasLinkedCard ? formState.linkedCardName : undefined
      };
      
      if (editingAccountId) {
        onUpdate({ ...finalAccount, id: editingAccountId });
      } else {
        onAdd(finalAccount);
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setFormState({ name: '', balance: 0, type: 'Banca', color: '#8E7C68', linkedCardName: '' });
    setHasLinkedCard(false);
    setEditingAccountId(null);
    setShowForm(false);
  };

  const handleEditClick = (acc: Account) => {
    setEditingAccountId(acc.id);
  };

  const bankAccounts = accounts.filter(a => a.type === 'Banca' || a.type === 'Carta');
  const cashAccounts = accounts.filter(a => a.type === 'Contanti');
  const otherAccounts = accounts.filter(a => a.type === 'Altro');

  const renderAccountCard = (a: Account) => {
    const isCash = a.type === 'Contanti';
    const globalIndex = accounts.findIndex(acc => acc.id === a.id);
    
    return (
      <div 
        key={a.id} 
        className="relative p-5 rounded-3xl text-white shadow-lg overflow-hidden group transition-all duration-300 active:scale-[0.98] mb-4"
        style={{ 
          background: `linear-gradient(145deg, ${a.color}, ${a.color}DD)`,
          boxShadow: `0 10px 20px -5px ${a.color}30`
        }}
      >
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform pointer-events-none z-0">
          {isCash ? (
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm2 0v12h14V6H5zm2 2h2v2H7V8zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm10-8h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-6-4a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
          ) : (
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V12h16v6zm0-10H4V6h16v2z"/>
            </svg>
          )}
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mb-0.5">{a.type}</span>
              <h3 className="text-lg font-bold tracking-tight leading-tight">{a.name}</h3>
              
              {a.linkedCardName && (
                <div className="mt-2 flex items-center gap-1.5 bg-white/10 w-fit px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                  <svg className="w-3 h-3 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="text-[10px] font-bold text-white/90">{a.linkedCardName}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 bg-black/10 backdrop-blur-md p-1 rounded-xl">
              {onMove && (
                <>
                  <button 
                    onClick={() => onMove(globalIndex, 'up')}
                    disabled={globalIndex === 0}
                    className={`p-1 rounded-md transition-colors ${globalIndex === 0 ? 'opacity-20' : 'hover:bg-white/10 active:scale-90'}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button 
                    onClick={() => onMove(globalIndex, 'down')}
                    disabled={globalIndex === accounts.length - 1}
                    className={`p-1 rounded-md transition-colors ${globalIndex === accounts.length - 1 ? 'opacity-20' : 'hover:bg-white/10 active:scale-90'}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="w-px h-3 bg-white/10 mx-0.5" />
                </>
              )}
              <button 
                onClick={() => handleEditClick(a)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors active:scale-90"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                onClick={() => { if(window.confirm('Eliminare questo conto?')) onDelete(a.id); }}
                className="p-1 hover:bg-rose-500/40 rounded-md transition-colors active:scale-90"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
          
          <div className="mt-auto">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">Saldo Disponibile</p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-medium opacity-80">€</span>
              <span className="text-2xl font-black tabular-nums">
                {hideBalances ? '••••' : a.balance.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex justify-start items-center">
          <button 
            onClick={onOpenSidebar}
            className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E]">I Miei Conti</h1>
          <div className="flex gap-2">
            <button 
              onClick={onToggleHideBalances}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${hideBalances ? 'theme-bg-primary text-white border-transparent' : 'bg-white theme-primary theme-border'}`}
            >
              {hideBalances ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
            <button 
              onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}
              className="theme-bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-transform"
            >
              {showForm ? 'Annulla' : '+ Aggiungi'}
            </button>
          </div>
        </div>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border theme-border shadow-sm mb-10 space-y-4 animate-in fade-in zoom-in duration-300">
          <h2 className="text-xs font-bold theme-primary uppercase tracking-wider mb-2">
            {editingAccountId ? 'Modifica Conto' : 'Nuovo Conto'}
          </h2>
          <div>
            <label className="block text-xs font-semibold opacity-60 uppercase mb-1">Nome Conto</label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 theme-sub-bg rounded-xl border-none focus:ring-2 focus:ring-current theme-primary font-medium"
              value={formState.name}
              onChange={e => setFormState({...formState, name: e.target.value})}
              placeholder="Es: Intesa Sanpaolo"
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold opacity-60 uppercase mb-1">Saldo</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full px-4 py-2.5 theme-sub-bg rounded-xl border-none focus:ring-2 focus:ring-current theme-primary font-medium"
                value={formState.balance}
                onChange={e => setFormState({...formState, balance: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold opacity-60 uppercase mb-1">Tipo</label>
              <select 
                className="w-full px-4 py-2.5 theme-sub-bg rounded-xl border-none focus:ring-2 focus:ring-current theme-primary font-medium"
                value={formState.type}
                onChange={e => setFormState({...formState, type: e.target.value as any})}
              >
                <option value="Banca">Banca</option>
                <option value="Carta">Carta</option>
                <option value="Contanti">Contanti</option>
                <option value="Altro">Altro</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between theme-sub-bg p-3 rounded-xl">
              <label className="text-xs font-bold opacity-60 uppercase">Carta Collegata?</label>
              <button 
                type="button"
                onClick={() => setHasLinkedCard(!hasLinkedCard)}
                className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${hasLinkedCard ? 'theme-bg-primary' : 'bg-[#D9D1C5]'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${hasLinkedCard ? 'left-5.5' : 'left-0.5'}`} style={{ left: hasLinkedCard ? '22px' : '2px' }} />
              </button>
            </div>

            {hasLinkedCard && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-semibold opacity-60 uppercase mb-1">Nome Carta</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 theme-sub-bg rounded-xl border-none focus:ring-2 focus:ring-current theme-primary font-medium"
                  value={formState.linkedCardName}
                  onChange={e => setFormState({...formState, linkedCardName: e.target.value})}
                  placeholder="Es: Carta Debit Intesa"
                />
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-3 theme-bg-primary text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform">
            {editingAccountId ? 'Aggiorna Conto' : 'Crea Conto'}
          </button>
        </form>
      )}

      <div className="space-y-10">
        {bankAccounts.length > 0 && (
          <section>
            <h3 className="text-[10px] font-bold opacity-60 uppercase tracking-[0.15em] mb-3 ml-1">Conti Bancari e Carte</h3>
            <div className="space-y-0">
              {bankAccounts.map(renderAccountCard)}
            </div>
          </section>
        )}

        {cashAccounts.length > 0 && (
          <section>
            <h3 className="text-[10px] font-bold opacity-60 uppercase tracking-[0.15em] mb-3 ml-1">Contanti</h3>
            <div className="space-y-0">
              {cashAccounts.map(renderAccountCard)}
            </div>
          </section>
        )}

        {otherAccounts.length > 0 && (
          <section>
            <h3 className="text-[10px] font-bold opacity-60 uppercase tracking-[0.15em] mb-3 ml-1">Altri Conti</h3>
            <div className="space-y-0">
              {otherAccounts.map(renderAccountCard)}
            </div>
          </section>
        )}
      </div>
      <div className="pb-32"></div>
    </div>
  );
};

export default AccountManager;
