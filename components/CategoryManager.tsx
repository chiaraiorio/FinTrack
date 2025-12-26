
import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import CategoryIcon from './CategoryIcon';
import { CATEGORY_ICON_PATHS } from '../constants';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (cat: Omit<Category, 'id'>) => void;
  onUpdate: (cat: Category) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  onOpenSidebar: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onUpdate, onDelete, onBack, onOpenSidebar }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [formState, setFormState] = useState({ name: '', icon: 'tag', color: '#8E7C68' });

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

    if (editingCategoryId) {
      onUpdate({ ...formState, id: editingCategoryId });
    } else {
      onAdd(formState);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormState({ name: '', icon: 'tag', color: '#8E7C68' });
    setEditingCategoryId(null);
    setShowForm(false);
  };

  const handleEditClick = (cat: Category) => {
    setEditingCategoryId(cat.id);
  };

  const iconOptions = Object.keys(CATEGORY_ICON_PATHS);

  return (
    <div className="p-6">
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 theme-primary -ml-2 active:opacity-50 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-lg font-medium">Indietro</span>
          </button>
          <button 
            onClick={onOpenSidebar}
            className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E]">Categorie</h1>
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
            <label className="block text-xs font-semibold opacity-60 uppercase mb-1">Nome Categoria</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 theme-sub-bg rounded-xl border-none focus:ring-2 focus:ring-current theme-primary placeholder:text-[#D9D1C5] font-medium"
              value={formState.name}
              onChange={e => setFormState({...formState, name: e.target.value})}
              placeholder="Esempio: Palestra, Affitto..."
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
                  className={`aspect-square rounded-xl flex items-center justify-center border transition-all ${formState.icon === iconKey ? 'theme-bg-primary border-transparent text-white shadow-md scale-105' : 'theme-sub-bg theme-border theme-primary hover:bg-white'}`}
                >
                  <CategoryIcon iconName={iconKey} color={formState.icon === iconKey ? 'white' : 'var(--primary)'} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold opacity-60 uppercase mb-1">Colore Tema</label>
            <div className="flex items-center gap-4 theme-sub-bg p-2 rounded-xl">
              <input 
                type="color" 
                className="w-12 h-10 p-1 bg-white rounded-lg border theme-border cursor-pointer"
                value={formState.color}
                onChange={e => setFormState({...formState, color: e.target.value})}
              />
              <span className="text-[13px] font-bold theme-primary font-mono">{formState.color.toUpperCase()}</span>
            </div>
          </div>
          
          <button type="submit" className="w-full py-4 theme-bg-primary text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform">
            {editingCategoryId ? 'Aggiorna Categoria' : 'Salva Categoria'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {categories.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-[1.5rem] flex items-center justify-between border theme-border shadow-sm group active:theme-sub-bg transition-colors">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-[1.1rem] flex items-center justify-center shadow-inner"
                style={{ backgroundColor: `${c.color}10` }}
              >
                <CategoryIcon iconName={c.icon} color={c.color} className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#4A453E] text-[15px]">{c.name}</h3>
                <div className="mt-1">
                  <div className="w-8 h-1 rounded-full" style={{ backgroundColor: c.color }}></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleEditClick(c)}
                className="p-2 text-[#B8B0A5] hover:theme-primary active:scale-90 transition-all opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                onClick={() => { if(window.confirm('Eliminare questa categoria?')) onDelete(c.id); }}
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
      <div className="pb-24"></div>
    </div>
  );
};

export default CategoryManager;
