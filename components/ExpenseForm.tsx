
import React, { useState, useMemo, useEffect } from 'react';
import { Expense, Category, Account, Repeatability } from '../types';
import { REPEAT_OPTIONS } from '../constants';
import CategoryIcon from './CategoryIcon';

interface ExpenseFormProps {
  categories: Category[];
  accounts: Account[];
  // Changed onSave to omit updatedAt as it is handled in App.tsx
  onSave: (expense: Omit<Expense, 'id' | 'updatedAt'>) => void;
  onUpdate?: (expense: Expense) => void;
  onClose: () => void;
  initialData?: Expense;
  defaultAccountId?: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ categories, accounts, onSave, onUpdate, onClose, initialData, defaultAccountId }) => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [accountId, setAccountId] = useState(defaultAccountId && accounts.some(a => a.id === defaultAccountId) 
    ? defaultAccountId 
    : (accounts[0]?.id || ''));
  const [cardId, setCardId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [repeatability, setRepeatability] = useState(Repeatability.NONE);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCategoryId(initialData.categoryId);
      setAccountId(initialData.accountId);
      setCardId(initialData.cardId || '');
      setDate(initialData.date);
      setNotes(initialData.notes);
      setRepeatability(initialData.repeatability);
    }
  }, [initialData]);

  const selectedAccount = useMemo(() => 
    accounts.find(a => a.id === accountId),
    [accounts, accountId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || !categoryId || !accountId) return;
    
    if (initialData && onUpdate) {
      // Added updatedAt to satisfy the Expense type
      onUpdate({
        ...initialData,
        amount: amountNum,
        categoryId,
        accountId,
        cardId: cardId || undefined,
        date,
        notes,
        repeatability,
        updatedAt: Date.now()
      });
    } else {
      onSave({
        amount: amountNum,
        categoryId,
        accountId,
        cardId: cardId || undefined,
        date,
        notes,
        repeatability,
        usedLinkedCard: !!cardId
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#4A453E]/20 backdrop-blur-[2px] z-[100] flex items-end justify-center">
      <div className="bg-[#FAF7F2] w-full max-w-md rounded-t-[2.5rem] p-6 ios-sheet animate-in slide-in-from-bottom duration-500 ease-out max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="w-12 h-1.5 bg-[#D9D1C5] rounded-full mx-auto mb-6 opacity-50"></div>
        
        <div className="flex justify-between items-center mb-8">
          <button onClick={onClose} className="text-[#8E7C68] font-medium text-lg">Esci</button>
          <h2 className="text-lg font-bold text-[#4A453E]">{initialData ? 'Modifica Spesa' : 'Nuova Spesa'}</h2>
          <button onClick={handleSubmit} className="text-[#8E7C68] font-bold text-lg">Salva</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE4D8]">
            <label className="block text-[11px] font-bold text-[#918B82] uppercase mb-1 px-1">Importo</label>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold text-[#D9D1C5] mr-2">€</span>
              <input
                autoFocus={!initialData}
                type="number"
                step="0.01"
                required
                className="w-full bg-transparent text-4xl font-bold focus:outline-none placeholder:text-[#F0EAE0] text-[#4A453E]"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#918B82] uppercase mb-3 px-1">Categoria</label>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className="flex flex-col items-center gap-2 min-w-[70px]"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${categoryId === c.id ? 'bg-[#8E7C68] text-white shadow-md' : 'bg-white border border-[#EBE4D8] text-[#8E7C68]'}`}>
                    <CategoryIcon iconName={c.icon} color={categoryId === c.id ? 'white' : c.color} className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase truncate w-full text-center ${categoryId === c.id ? 'text-[#8E7C68]' : 'text-[#918B82]'}`}>
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-[#F5F1EA] border border-[#EBE4D8]">
            <div className="flex items-center p-4">
              <label className="text-[#918B82] flex-1 font-medium">Conto</label>
              <select
                className="bg-transparent text-[#8E7C68] font-bold focus:outline-none text-right min-w-[120px]"
                value={accountId}
                onChange={(e) => {
                  setAccountId(e.target.value);
                  setCardId('');
                }}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            {selectedAccount && selectedAccount.cards.length > 0 && (
              <div className="p-4 space-y-3 bg-[#FAF7F2]/50">
                <label className="block text-[10px] font-bold text-[#918B82] uppercase tracking-wider">Carta utilizzata</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardId('')}
                    className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${!cardId ? 'theme-bg-primary text-white border-transparent' : 'bg-white text-[#918B82] theme-border'}`}
                  >
                    Conto Diretto
                  </button>
                  {selectedAccount.cards.map(card => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setCardId(card.id)}
                      className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase transition-all border truncate ${cardId === card.id ? 'theme-bg-primary text-white border-transparent' : 'bg-white text-[#918B82] theme-border'}`}
                    >
                      {card.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center p-4">
              <label className="text-[#918B82] flex-1 font-medium">Data</label>
              <input
                type="date"
                className="bg-transparent text-[#8E7C68] font-bold focus:outline-none text-right"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex items-center p-4">
              <label className="text-[#918B82] flex-1 font-medium">Ripeti</label>
              <select
                className="bg-transparent text-[#8E7C68] font-bold focus:outline-none text-right min-w-[100px]"
                value={repeatability}
                onChange={(e) => setRepeatability(e.target.value as Repeatability)}
              >
                {REPEAT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE4D8]">
             <textarea
              className="w-full bg-transparent focus:outline-none resize-none text-[#4A453E] placeholder:text-[#F0EAE0]"
              rows={2}
              placeholder="Aggiungi una nota..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="pb-8"></div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
