
import React, { useState, useEffect } from 'react';
import { IncomeCategory } from '../types';
import CategoryIcon from './CategoryIcon';
import { CATEGORY_ICON_PATHS } from '../constants';

interface IncomeCategoryManagerProps {
  categories: IncomeCategory[];
  onAdd: (cat: Omit<IncomeCategory, 'id'>) => void;
  onUpdate: (cat: IncomeCategory) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const IncomeCategoryManager: React.FC<IncomeCategoryManagerProps> = ({ categories, onAdd, onUpdate, onDelete, onBack }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [formState, setFormState] = useState({ name: '', icon: 'tag', color: '#10B981' });

  useEffect(() => {
    if (editingCategoryId) {
      const cat = categories.find(c => c.id === editingCategoryId);
      if (cat) {
        setFormState({ name: cat.name, icon: cat.icon, color: cat.color });
        setShowForm(true);
      }
    }
  }, [editingCategoryId, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) return;

    // Added updatedAt: Date.now() to satisfy the IncomeCategory type
    if (editingCategoryId) {
      onUpdate({ ...formState, id: editingCategoryId, updatedAt: Date.now() });
    } else {
      onAdd({ ...formState, updatedAt: Date.now() });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormState({ name: '', icon: 'tag', color: '#10B981' });
    setEditingCategoryId(null);
    setShowForm(false);
  };

  const iconOptions = Object.keys(CATEGORY_ICON_PATHS);

  return (
    <div className="p-6">
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex justify-start items-center">
          <button 
            onClick={onBack}
            className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#4A453E]">Categorie Entrate</h1>
          <button 
            onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}
            className="theme-bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-transform"
          >
            {showForm ? 'Annulla' : '+ Nuova'}
          </button>
        </div>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border theme-border shadow-sm mb-8 space-y-5 animate-in fade-in zoom-in duration-300">
          <h2 className="text-sm font-bold theme-primary uppercase tracking-wider mb-2">
            {editingCategoryId ? 'Modifica Categoria' : 'Nuova Categoria'}
          </h2>
          
          <div>
            <label className="block text-xs font-semibold opacity-60 uppercase mb-1">Nome</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 theme-sub-bg rounded-xl border-none focus:ring-2 focus:ring-current theme-primary font-medium"
              value={formState.name}
              onChange={e => setFormState({...formState, name: e.target.value})}
              placeholder="Esempio: Stipendio, Bonus..."
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold opacity-60 uppercase mb-2">Icona</label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map(iconKey => (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => setFormState({...formState, icon: iconKey})}
                  className={`aspect-square rounded-xl flex items-center justify-center border transition-all ${formState.icon === iconKey ? 'bg-emerald-500 border-transparent text-white shadow-md scale-105' : 'theme-sub-bg theme-border theme-primary hover:bg-white'}`}
                >
                  <CategoryIcon iconName={iconKey} color={formState.icon === iconKey ? 'white' : 'var(--primary)'} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
          
          <button type="submit" className="w-full py-4 theme-bg-primary text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform">
            Salva
          </button>
        </form>
      )}

      <div className="space-y-3">
        {categories.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-[1.5rem] flex items-center justify-between border theme-border shadow-sm group active:theme-sub-bg transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1.1rem] flex items-center justify-center theme-sub-bg">
                <CategoryIcon iconName={c.icon} color="#10B981" className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#4A453E] text-[15px]">{c.name}</h3>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setEditingCategoryId(c.id)}
                className="p-2 text-[#B8B0A5] hover:theme-primary transition-all opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                onClick={() => { if(window.confirm('Eliminare questa categoria?')) onDelete(c.id); }}
                className="p-2 text-[#D9D1C5] hover:text-rose-500 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="pb-24"></div>
    </div>
  );
};

export default IncomeCategoryManager;
