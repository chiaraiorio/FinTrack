
import React, { useState } from 'react';
import { Income, Account, IncomeCategory } from '../types';
import CategoryIcon from './CategoryIcon';

interface IncomeFormProps {
  accounts: Account[];
  incomeCategories: IncomeCategory[];
  onSave: (income: Omit<Income, 'id'>) => void;
  onClose: () => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ accounts, incomeCategories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    accountId: accounts[0]?.id || '',
    categoryId: incomeCategories[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.accountId || !formData.categoryId) return;
    
    onSave({
      amount: parseFloat(formData.amount),
      accountId: formData.accountId,
      categoryId: formData.categoryId,
      date: formData.date,
      notes: formData.notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#4A453E]/20 backdrop-blur-[2px] z-[100] flex items-end justify-center">
      <div className="bg-[#FAF7F2] w-full max-w-md rounded-t-[2.5rem] p-6 ios-sheet animate-in slide-in-from-bottom duration-500 ease-out max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="w-12 h-1.5 bg-[#D9D1C5] rounded-full mx-auto mb-6 opacity-50"></div>
        
        <div className="flex justify-between items-center mb-8">
          <button onClick={onClose} className="text-[#8E7C68] font-medium text-lg">Annulla</button>
          <h2 className="text-lg font-bold text-[#4A453E]">Nuova Entrata</h2>
          <button onClick={handleSubmit} className="text-[#8E7C68] font-bold text-lg">Salva</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE4D8]">
            <label className="block text-[11px] font-bold text-[#918B82] uppercase mb-1 px-1">Importo Ricevuto</label>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold text-emerald-300 mr-2">€</span>
              <input
                autoFocus
                type="number"
                step="0.01"
                required
                className="w-full bg-transparent text-4xl font-bold focus:outline-none placeholder:text-[#F0EAE0] text-emerald-600"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#918B82] uppercase mb-3 px-1">Categoria Entrata</label>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {incomeCategories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFormData({...formData, categoryId: c.id})}
                  className="flex flex-col items-center gap-2 min-w-[70px]"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${formData.categoryId === c.id ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-[#EBE4D8] text-emerald-500'}`}>
                    <CategoryIcon iconName={c.icon} color={formData.categoryId === c.id ? 'white' : c.color} className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase truncate w-full text-center ${formData.categoryId === c.id ? 'text-emerald-700' : 'text-[#918B82]'}`}>
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-[#F5F1EA] border border-[#EBE4D8]">
            <div className="flex items-center p-4">
              <label className="text-[#918B82] flex-1 font-medium">Conto di Accredito</label>
              <select
                className="bg-transparent text-[#8E7C68] font-bold focus:outline-none text-right min-w-[120px]"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center p-4">
              <label className="text-[#918B82] flex-1 font-medium">Data</label>
              <input
                type="date"
                className="bg-transparent text-[#8E7C68] font-bold focus:outline-none text-right"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE4D8]">
             <textarea
              className="w-full bg-transparent focus:outline-none resize-none text-[#4A453E] placeholder:text-[#F0EAE0]"
              rows={2}
              placeholder="Causale entrata (es: Stipendio, Regalo...)"
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

export default IncomeForm;
