
import React, { useState, useEffect } from 'react';
import { Category, IncomeCategory } from '../types';
import CategoryIcon from './CategoryIcon';
import { CATEGORY_ICON_PATHS } from '../constants';

interface CategoryManagerProps {
  expensesCategories: Category[];
  incomeCategories: IncomeCategory[];
  onAddExpenseCat: (cat: Omit<Category, 'id'>) => void;
  onUpdateExpenseCat: (cat: Category) => void;
  onDeleteExpenseCat: (id: string) => void;
  onAddIncomeCat: (cat: Omit<IncomeCategory, 'id'>) => void;
  onUpdateIncomeCat: (cat: IncomeCategory) => void;
  onDeleteIncomeCat: (id: string) => void;
  onOpenSidebar: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  expensesCategories, 
  incomeCategories, 
  onAddExpenseCat, 
  onUpdateExpenseCat, 
  onDeleteExpenseCat,
  onAddIncomeCat,
  onUpdateIncomeCat,
  onDeleteIncomeCat,
  onOpenSidebar 
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes'>('expenses');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<{ name: string; icon: string; color: string; budget: string }>({ 
    name: '', 
    icon: 'tag', 
    color: '#8E7C68',
    budget: ''
  });

  const currentCategories = activeTab === 'expenses' ? expensesCategories : incomeCategories;

  useEffect(() => {
    if (editingId) {
      const cat = currentCategories.find(c => c.id === editingId);
      if (cat) {
        setFormState({ 
          name: cat.name, 
          icon: cat.icon, 
          color: cat.color,
          budget: (cat as Category).budget?.toString() || ''
        });
        setShowForm(true);
      }
    }
  }, [editingId, activeTab, expensesCategories, incomeCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) return;

    const budgetVal = formState.budget ? parseFloat(formState.budget) : undefined;
    
    if (activeTab === 'expenses') {
      const payload = { name: formState.name, icon: formState.icon, color: formState.color, budget: budgetVal };
      if (editingId) onUpdateExpenseCat({ ...payload, id: editingId });
      else onAddExpenseCat(payload);
    } else {
      const payload = { name: formState.name, icon: formState.icon, color: formState.color };
      if (editingId) onUpdateIncomeCat({ ...payload, id: editingId });
      else onAddIncomeCat(payload);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormState({ name: '', icon: 'tag', color: activeTab === 'expenses' ? '#8E7C68' : '#10B981', budget: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (cat: any) => {
    setEditingId(cat.id);
  };

  const iconOptions = Object.keys(CATEGORY_ICON_PATHS);

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6 pt-6">
        <h1 className="text-3xl font-black text-[#4A453E] tracking-tight">Categorie</h1>
        <button 
          onClick={onOpenSidebar}
          className="w-12 h-12 theme-card rounded-2xl flex items-center justify-center active:scale-90 transition-transform shadow-sm"
        >
          <svg className="w-7 h-7 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </header>

      {/* TABS */}
      <div className="flex bg-white rounded-2xl p-1 mb-8 border theme-border shadow-sm">
        <button 
          onClick={() => { setActiveTab('expenses'); setShowForm(false); }}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'expenses' ? 'theme-bg-primary text-white shadow-md' : 'text-[#918B82]'}`}
        >
          Uscite
        </button>
        <button 
          onClick={() => { setActiveTab('incomes'); setShowForm(false); }}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'incomes' ? 'bg-emerald-500 text-white shadow-md' : 'text-[#918B82]'}`}
        >
          Entrate
        </button>
      </div>

      <div className="flex justify-between items-end mb-6">
        <h2 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] ml-1">
          {activeTab === 'expenses' ? 'Lista Uscite' : 'Lista Entrate'}
        </h2>
        <button 
          onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}
          className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all ${activeTab === 'expenses' ? 'theme-bg-primary text-white' : 'bg-emerald-500 text-white'}`}
        >
          {showForm ? 'Annulla' : '+ Nuova'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2.5rem] border theme-border shadow-sm mb-8 space-y-5 animate-in fade-in zoom-in duration-300">
          <h2 className="text-sm font-black theme-primary uppercase tracking-widest mb-2">
            {editingId ? 'Modifica' : 'Crea'} Categoria
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black opacity-60 uppercase mb-1 ml-1 tracking-widest">Nome</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 theme-sub-bg rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary placeholder:text-[#D9D1C5] font-bold"
                value={formState.name}
                onChange={e => setFormState({...formState, name: e.target.value})}
                placeholder="Esempio: Casa, Stipendio..."
                autoFocus
              />
            </div>

            {activeTab === 'expenses' && (
              <div>
                <label className="block text-[10px] font-black opacity-60 uppercase mb-1 ml-1 tracking-widest">Budget Mensile (€)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full px-4 py-3 theme-sub-bg rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary placeholder:text-[#D9D1C5] font-bold"
                  value={formState.budget}
                  onChange={e => setFormState({...formState, budget: e.target.value})}
                  placeholder="0.00 (opzionale)"
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-[10px] font-black opacity-60 uppercase mb-2 ml-1 tracking-widest">Icona</label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map(iconKey => (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => setFormState({...formState, icon: iconKey})}
                  className={`aspect-square rounded-xl flex items-center justify-center border transition-all ${formState.icon === iconKey ? (activeTab === 'expenses' ? 'theme-bg-primary' : 'bg-emerald-500') + ' border-transparent text-white shadow-md scale-105' : 'theme-sub-bg theme-border theme-primary'}`}
                >
                  <CategoryIcon iconName={iconKey} color={formState.icon === iconKey ? 'white' : (activeTab === 'expenses' ? 'var(--primary)' : '#10B981')} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
          
          <button type="submit" className={`w-full py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all text-sm text-white ${activeTab === 'expenses' ? 'theme-bg-primary' : 'bg-emerald-500'}`}>
            {editingId ? 'Aggiorna' : 'Salva'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {currentCategories.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-[2rem] flex items-center justify-between border theme-border shadow-sm group active:theme-sub-bg transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shadow-inner ${activeTab === 'expenses' ? 'theme-sub-bg' : 'bg-emerald-50'}`}>
                <CategoryIcon iconName={c.icon} color={activeTab === 'expenses' ? 'var(--primary)' : '#10B981'} className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-[#4A453E] text-[15px] truncate">{c.name}</h3>
                {activeTab === 'expenses' && (c as Category).budget ? (
                  <p className="text-[10px] font-bold theme-primary uppercase opacity-60">Budget: €{(c as Category).budget?.toLocaleString('it-IT')}</p>
                ) : activeTab === 'expenses' ? (
                  <p className="text-[10px] font-bold opacity-30 uppercase">Senza Budget</p>
                ) : null}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleEditClick(c)}
                className="p-2 text-[#B8B0A5] hover:theme-primary active:scale-90 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                onClick={() => { 
                  if(window.confirm('Eliminare questa categoria?')) {
                    if(activeTab === 'expenses') onDeleteExpenseCat(c.id);
                    else onDeleteIncomeCat(c.id);
                  }
                }}
                className="p-2 text-[#D9D1C5] hover:text-rose-500 active:scale-90 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="pb-32"></div>
    </div>
  );
};

export default CategoryManager;
