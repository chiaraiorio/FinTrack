
import React, { useState, useMemo } from 'react';
import { Expense, Income, Category, Account, IncomeCategory, ViewType, Language } from '../types';
import CategoryIcon from './CategoryIcon';

interface SearchViewProps {
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  incomeCategories: IncomeCategory[];
  accounts: Account[];
  onBack: () => void;
  onNavigate: (view: ViewType) => void;
  language: Language;
  showDecimals: boolean;
  hideBalances: boolean;
}

const SearchView: React.FC<SearchViewProps> = ({
  expenses, incomes, categories, incomeCategories, accounts,
  onBack, onNavigate, language, showDecimals, hideBalances
}) => {
  const [query, setQuery] = useState('');

  const t = {
    it: {
      search: 'Cerca',
      placeholder: 'Cerca note, importi, categorie...',
      noResults: 'Nessun risultato trovato',
      expenses: 'Uscite',
      incomes: 'Entrate',
      accounts: 'Conti',
      categories: 'Categorie',
      recent: 'Recenti'
    },
    en: {
      search: 'Search',
      placeholder: 'Search notes, amounts, categories...',
      noResults: 'No results found',
      expenses: 'Expenses',
      incomes: 'Incomes',
      accounts: 'Accounts',
      categories: 'Categories',
      recent: 'Recent'
    }
  }[language];

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { expenses: [], incomes: [], accounts: [], categories: [] };

    const matchedExpenses = expenses.filter(e => {
      const cat = categories.find(c => c.id === e.categoryId);
      return e.notes.toLowerCase().includes(q) || 
             e.amount.toString().includes(q) ||
             cat?.name.toLowerCase().includes(q);
    }).slice(0, 10);

    const matchedIncomes = incomes.filter(i => {
      const cat = incomeCategories.find(c => c.id === i.categoryId);
      return i.notes.toLowerCase().includes(q) || 
             i.amount.toString().includes(q) ||
             cat?.name.toLowerCase().includes(q);
    }).slice(0, 10);

    const matchedAccounts = accounts.filter(a => a.name.toLowerCase().includes(q));
    const matchedCategories = [
      ...categories.filter(c => c.name.toLowerCase().includes(q)),
      ...incomeCategories.filter(c => c.name.toLowerCase().includes(q))
    ];

    return {
      expenses: matchedExpenses,
      incomes: matchedIncomes,
      accounts: matchedAccounts,
      categories: matchedCategories
    };
  }, [query, expenses, incomes, categories, incomeCategories, accounts]);

  const hasAnyResult = query.trim() !== '' && (
    results.expenses.length > 0 || 
    results.incomes.length > 0 || 
    results.accounts.length > 0 || 
    results.categories.length > 0
  );

  const formatAmount = (val: number) => {
    return showDecimals ? val.toFixed(2) : Math.round(val).toString();
  };

  return (
    <div className="px-5 pt-12 space-y-6 pb-32 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform"
        >
          <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-black text-[#4A453E] tracking-tight">{t.search}</h1>
      </header>

      <div className="relative group">
        <input 
          autoFocus
          type="text"
          className="w-full pl-12 pr-12 py-4 bg-white rounded-2xl border theme-border theme-primary font-bold shadow-sm focus:ring-2 focus:ring-current outline-none transition-all placeholder:text-[#D9D1C5]"
          placeholder={t.placeholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D9D1C5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#D9D1C5] hover:text-[#4A453E]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {!query.trim() && (
        <div className="py-20 text-center opacity-30 italic">
          <p>{t.placeholder}</p>
        </div>
      )}

      {query.trim() && !hasAnyResult && (
        <div className="py-20 text-center opacity-40">
          <p className="font-bold">{t.noResults}</p>
        </div>
      )}

      <div className="space-y-8">
        {results.expenses.length > 0 && (
          <section className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-[10px] font-black opacity-60 uppercase tracking-widest ml-4">{t.expenses}</h3>
            <div className="theme-card rounded-3xl overflow-hidden divide-y theme-border bg-white shadow-sm">
              {results.expenses.map(e => {
                const cat = categories.find(c => c.id === e.categoryId);
                return (
                  <div key={e.id} className="p-4 flex items-center gap-4 active:bg-rose-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-50">
                      <CategoryIcon iconName={cat?.icon || 'generic'} color="#F43F5E" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#4A453E] truncate">{e.notes || cat?.name}</p>
                      <p className="text-[10px] opacity-60 font-medium">{e.date}</p>
                    </div>
                    <span className="font-black text-rose-500 whitespace-nowrap">
                      {hideBalances ? '-€ ••' : `-€${formatAmount(e.amount)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {results.incomes.length > 0 && (
          <section className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-[10px] font-black opacity-60 uppercase tracking-widest ml-4">{t.incomes}</h3>
            <div className="theme-card rounded-3xl overflow-hidden divide-y theme-border bg-white shadow-sm">
              {results.incomes.map(i => {
                const cat = incomeCategories.find(c => c.id === i.categoryId);
                return (
                  <div key={i.id} className="p-4 flex items-center gap-4 active:bg-emerald-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50">
                      <CategoryIcon iconName={cat?.icon || 'generic'} color="#10B981" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#4A453E] truncate">{i.notes || cat?.name}</p>
                      <p className="text-[10px] opacity-60 font-medium">{i.date}</p>
                    </div>
                    <span className="font-black text-emerald-500 whitespace-nowrap">
                      {hideBalances ? '+€ ••' : `+€${formatAmount(i.amount)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {results.accounts.length > 0 && (
          <section className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-[10px] font-black opacity-60 uppercase tracking-widest ml-4">{t.accounts}</h3>
            <div className="theme-card rounded-3xl overflow-hidden divide-y theme-border bg-white shadow-sm">
              {results.accounts.map(a => (
                <div key={a.id} className="p-4 flex items-center gap-4 active:theme-sub-bg transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${a.color}20` }}>
                    <svg className="w-5 h-5" style={{ color: a.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#4A453E] truncate">{a.name}</p>
                    <p className="text-[10px] opacity-60 font-medium uppercase">{a.type}</p>
                  </div>
                  <span className="font-black theme-primary whitespace-nowrap">
                    {hideBalances ? '€ ••' : `€${formatAmount(a.balance)}`}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {results.categories.length > 0 && (
          <section className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-[10px] font-black opacity-60 uppercase tracking-widest ml-4">{t.categories}</h3>
            <div className="grid grid-cols-2 gap-3">
              {results.categories.map(c => (
                <div key={c.id} className="theme-card rounded-2xl p-4 flex items-center gap-3 bg-white shadow-sm">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center theme-sub-bg">
                    <CategoryIcon iconName={c.icon} color="var(--primary)" className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-[#4A453E] text-xs truncate">{c.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SearchView;
