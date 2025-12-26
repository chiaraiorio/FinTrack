
import React, { useState } from 'react';
import { Account } from '../types';

interface TransferFormProps {
  accounts: Account[];
  onSave: (amount: number, fromId: string, toId: string, notes: string, date: string) => void;
  onClose: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ accounts, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    fromAccountId: accounts[0]?.id || '',
    toAccountId: accounts[1]?.id || accounts[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.fromAccountId || !formData.toAccountId) return;
    if (formData.fromAccountId === formData.toAccountId) {
      alert("Il conto di origine e destinazione non possono coincidere.");
      return;
    }
    
    onSave(
      parseFloat(formData.amount),
      formData.fromAccountId,
      formData.toAccountId,
      formData.notes,
      formData.date
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#4A453E]/20 backdrop-blur-[2px] z-[100] flex items-end justify-center">
      <div className="bg-[#FAF7F2] w-full max-w-md rounded-t-[2.5rem] p-6 ios-sheet animate-in slide-in-from-bottom duration-500 ease-out max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="w-12 h-1.5 bg-[#D9D1C5] rounded-full mx-auto mb-6 opacity-50"></div>
        
        <div className="flex justify-between items-center mb-8">
          <button onClick={onClose} className="text-[#8E7C68] font-medium text-lg">Annulla</button>
          <h2 className="text-lg font-bold text-[#4A453E]">Trasferimento</h2>
          <button onClick={handleSubmit} className="text-[#8E7C68] font-bold text-lg">Esegui</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE4D8]">
            <label className="block text-[11px] font-bold text-[#918B82] uppercase mb-1 px-1">Importo da Trasferire</label>
            <div className="flex items-baseline">
              <span className="text-3xl font-semibold text-sky-300 mr-2">€</span>
              <input
                autoFocus
                type="number"
                step="0.01"
                required
                className="w-full bg-transparent text-4xl font-bold focus:outline-none placeholder:text-[#F0EAE0] text-sky-600"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-[#F5F1EA] border border-[#EBE4D8]">
            <div className="flex items-center p-4">
              <label className="text-[#918B82] flex-1 font-medium text-sm">Dal Conto</label>
              <select
                className="bg-transparent text-rose-400 font-bold focus:outline-none text-right min-w-[120px]"
                value={formData.fromAccountId}
                onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center p-4">
              <label className="text-[#918B82] flex-1 font-medium text-sm">Al Conto</label>
              <select
                className="bg-transparent text-emerald-500 font-bold focus:outline-none text-right min-w-[120px]"
                value={formData.toAccountId}
                onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center p-4">
              <label className="text-[#918B82] flex-1 font-medium text-sm">Data</label>
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
              placeholder="Aggiungi una nota (es: Giroconto...)"
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

export default TransferForm;
