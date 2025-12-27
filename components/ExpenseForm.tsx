
import React, { useState, useMemo, useEffect } from 'react';
import { Expense, Category, Account, Repeatability } from '../types';
import { REPEAT_OPTIONS } from '../constants';
import CategoryIcon from './CategoryIcon';

interface ExpenseFormProps {
  categories: Category[];
  accounts: Account[];
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
    <div className="fixed inset-0 bg-red-900/10 backdrop-blur-[2px] z-[100] flex items-end justify-center">
      <div className="bg-[#FAF7F2] w-full max-w-md rounded-t-[2.5rem] p-6 ios-sheet animate-in slide-in-from-bottom duration-500 ease-out max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
        <div className="w-12 h-1.5 bg-red-200 rounded-full mx-auto mb-6 opacity-50"></div>
        
        <div className="flex justify-between items-center mb-8">
          <button onClick={onClose} className="text-gray-400 font-bold text-lg">Annulla</button>
          <h2 className="text-lg font-black text-[#4A453E]">{initialData ? 'Modifica Spesa' : 'Nuova Spesa'}</h2>
          <button onClick={handleSubmit} className="text-red-600 font-black text-lg">Salva</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-50">
            <label className="block text-[11px] font-black text-red-400 uppercase mb-1 px-1">Quanto hai speso?</label>
            <div className="flex items-baseline">
              <span className="text-3xl font-black text-red-200 mr-2">€</span>
              <input
                autoFocus={!initialData}
                type="number"
                step="0.01"
                required
                className="w-full bg-transparent text-4xl font-black focus:outline-none placeholder:text-red-50 text-red-600"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase mb-3 px-1">Scegli Categoria</label>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className="flex flex-col items-center gap-2 min-w-[70px]"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${categoryId === c.id ? 'bg-red-500 text-white shadow-lg scale-105' : 'bg-white border border-gray-100 text-red-400'}`}>
                    <CategoryIcon iconName={c.icon} color={categoryId === c.id ? 'white' : '#EF4444'} className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-black uppercase truncate w-full text-center ${categoryId === c.id ? 'text-red-600' : 'text-gray-400'}`}>
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50 border border-gray-100">
            <div className="flex items-center p-4">
              <label className="text-gray-400 flex-1 font-black text-xs uppercase tracking-wider">Paga con</label>
              <select
                className="bg-transparent text-red-600 font-black focus:outline-none text-right min-w-[120px]"
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
              <div className="p-4 space-y-3 bg-red-50/20">
                <label className="block text-[10px] font-black text-red-400 uppercase tracking-widest">Quale carta?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardId('')}
                    className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase transition-all border ${!cardId ? 'bg-red-500 text-white border-transparent shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}
                  >
                    Saldo Conto
                  </button>
                  {selectedAccount.cards.map(card => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setCardId(card.id)}
                      className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase transition-all border truncate ${cardId === card.id ? 'bg-red-500 text-white border-transparent shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}
                    >
                      {card.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center p-4">
              <label className="text-gray-400 flex-1 font-black text-xs uppercase tracking-wider">In data</label>
              <input
                type="date"
                className="bg-transparent text-red-600 font-black focus:outline-none text-right"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex items-center p-4">
              <label className="text-gray-400 flex-1 font-black text-xs uppercase tracking-wider">Ripeti</label>
              <select
                className="bg-transparent text-red-600 font-black focus:outline-none text-right min-w-[100px]"
                value={repeatability}
                onChange={(e) => setRepeatability(e.target.value as Repeatability)}
              >
                {REPEAT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
             <textarea
              className="w-full bg-transparent focus:outline-none resize-none text-[#4A453E] font-bold placeholder:text-gray-200"
              rows={2}
              placeholder="Per cosa hai pagato? (opzionale)"
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
