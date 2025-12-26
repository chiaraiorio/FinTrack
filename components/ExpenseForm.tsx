
import React, { useState, useMemo } from 'react';
import { Expense, Category, Account, Repeatability } from '../types';
import { REPEAT_OPTIONS } from '../constants';
import CategoryIcon from './CategoryIcon';

interface ExpenseFormProps {
  categories: Category[];
  accounts: Account[];
  onSave: (expense: Omit<Expense, 'id'>) => void;
  onClose: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ categories, accounts, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: categories[0]?.id || '',
    accountId: accounts[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    repeatability: Repeatability.NONE,
    usedLinkedCard: false
  });

  const selectedAccount = useMemo(() => 
    accounts.find(a => a.id === formData.accountId),
    [accounts, formData.accountId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.categoryId || !formData.accountId) return;
    
    onSave({
      amount: parseFloat(formData.amount),
      categoryId: formData.categoryId,
      accountId: formData.accountId,
      date: formData.date,
      notes: formData.notes,
      repeatability: formData.repeatability,
      usedLinkedCard: formData.usedLinkedCard
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#4A453E]/20 backdrop-blur-[2px] z-[100] flex items-end justify-center">
      <div className="bg-[#FAF7F2] w-full max-w-md rounded-t-[2.5rem] p-6 ios-sheet animate-in slide-in-from-bottom duration-500 ease-out max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="w-12 h-1.5 bg-[#D9D1C5] rounded-full mx-auto mb-6 opacity-50"></div>
        
        <div className="flex justify-between items-center mb-8">
          <button onClick={onClose} className="text-[#8E7C68] font-medium text-lg">Annulla</button>
          <h2 className="text-lg font-bold text-[#4A453E]">Nuova Spesa</h2>
          <button onClick={handleSubmit} className="text-[#8E7C68] font-bold text-lg">Salva</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE4D8]">
            <label className="block text-[11px] font-bold text-[#918B82] uppercase mb-1 px-1">Importo</label>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold text-[#D9D1C5] mr-2">€</span>
              <input
                autoFocus
                type="number"
                step="0.01"
                required
                className="w-full bg-transparent text-4xl font-bold focus:outline-none placeholder:text-[#F0EAE0] text-[#4A453E]"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                  onClick={() => setFormData({...formData, categoryId: c.id})}
                  className="flex flex-col items-center gap-2 min-w-[70px]"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${formData.categoryId === c.id ? 'bg-[#8E7C68] text-white shadow-md' : 'bg-white border border-[#EBE4D8] text-[#8E7C68]'}`}>
                    <CategoryIcon iconName={c.icon} color={formData.categoryId === c.id ? 'white' : c.color} className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase truncate w-full text-center ${formData.categoryId === c.id ? 'text-[#8E7C68]' : 'text-[#918B82]'}`}>
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
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value, usedLinkedCard: false })}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            {selectedAccount?.linkedCardName && (
              <div className="p-4 space-y-3 bg-[#FAF7F2]/50 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-bold text-[#918B82] uppercase tracking-wider">Metodo di Pagamento</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, usedLinkedCard: false })}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-[11px] font-bold uppercase transition-all border ${!formData.usedLinkedCard ? 'bg-[#8E7C68] text-white border-[#8E7C68] shadow-sm' : 'bg-white text-[#918B82] border-[#EBE4D8]'}`}
                  >
                    Conto Diretto
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, usedLinkedCard: true })}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-[11px] font-bold uppercase transition-all border flex items-center justify-center gap-1.5 ${formData.usedLinkedCard ? 'bg-[#8E7C68] text-white border-[#8E7C68] shadow-sm' : 'bg-white text-[#918B82] border-[#EBE4D8]'}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    {selectedAccount.linkedCardName}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center p-4">
              <label className="text-[#918B82] flex-1 font-medium">Data</label>
              <input
                type="date"
                className="bg-transparent text-[#8E7C68] font-bold focus:outline-none text-right"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="flex items-center p-4">
              <label className="text-[#918B82] flex-1 font-medium">Ripeti</label>
              <select
                className="bg-transparent text-[#8E7C68] font-bold focus:outline-none text-right min-w-[100px]"
                value={formData.repeatability}
                onChange={(e) => setFormData({ ...formData, repeatability: e.target.value as Repeatability })}
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
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          
          <div className="pb-8"></div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
