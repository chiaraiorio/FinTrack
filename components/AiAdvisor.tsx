
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Expense, Category, Account, Language } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AiAdvisorProps {
  expenses: Expense[];
  categories: Category[];
  accounts: Account[];
  onOpenSidebar: () => void;
  language: Language;
}

const AiAdvisor: React.FC<AiAdvisorProps> = ({ expenses, categories, accounts, onOpenSidebar, language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const t = {
    it: { 
      title: 'Consulente AI', 
      placeholder: 'Chiedi al consulente...', 
      subtitle: 'Chat Finanziaria',
      welcome: 'Ciao! Sono il tuo consulente FinTrack. Analizzando i tuoi dati, come posso aiutarti oggi?',
      error: 'Errore nell\'invio del messaggio. Verifica la connessione o la chiave API.',
      retry: 'Riprova',
      online: 'Online'
    },
    en: { 
      title: 'AI Advisor', 
      placeholder: 'Ask the advisor...', 
      subtitle: 'Financial Chat',
      welcome: 'Hello! I am your FinTrack advisor. Based on your data, how can I help you today?',
      error: 'Error sending message. Please check your connection or API key.',
      retry: 'Retry',
      online: 'Online'
    }
  }[language];

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'model', text: t.welcome }]);
    }
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = inputText.trim();
    if (!query || loading) return;

    setInputText("");
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key non configurata nel sistema.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Prepariamo i dati finanziari per il contesto
      const expenseSummary = expenses.slice(0, 30).map(e => ({
        amount: e.amount,
        category: categories.find(c => c.id === e.categoryId)?.name || 'Altro',
        date: e.date
      }));

      const systemInstruction = `
        Sei FinTrack AI, un consulente finanziario personale esperto.
        Dati Utente:
        - Conti: ${JSON.stringify(accounts.map(a => ({ name: a.name, balance: a.balance })))}
        - Ultime Spese: ${JSON.stringify(expenseSummary)}
        
        Regole:
        1. Rispondi in modo amichevole e professionale in lingua ${language === 'it' ? 'Italiana' : 'Inglese'}.
        2. Usa i dati dell'utente per fornire risposte precise su budget e risparmio.
        3. Mantieni le risposte concise.
      `;

      // Costruiamo i contenuti per l'API (escludendo il benvenuto iniziale se è il primo della lista)
      // Gemini richiede che la sequenza inizi con 'user'.
      const historyForApi = messages
        .filter((m, idx) => !(idx === 0 && m.role === 'model')) // Salta il benvenuto se è il primo
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      // Aggiungiamo il messaggio corrente dell'utente
      historyForApi.push({ role: 'user', parts: [{ text: query }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: historyForApi,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = response.text;
      if (responseText) {
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      } else {
        throw new Error("Risposta vuota dal modello.");
      }
    } catch (err) {
      console.error("Gemini Assistant Error:", err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen theme-bg-app animate-in fade-in duration-500">
      <header className="px-5 pt-12 pb-4 flex flex-col gap-4 bg-white/80 backdrop-blur-md border-b theme-border sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <button 
            onClick={onOpenSidebar}
            className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">{t.online}</span>
          </div>
        </div>
        <div>
          <p className="opacity-60 font-bold text-xs uppercase tracking-tight ml-1">{t.subtitle}</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#4A453E]">{t.title}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 no-scrollbar">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] px-5 py-4 rounded-[1.8rem] shadow-sm ${
              m.role === 'user' 
                ? 'theme-bg-primary text-white rounded-br-none' 
                : 'bg-white text-[#4A453E] border theme-border rounded-bl-none'
            }`}>
              <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-6 py-5 rounded-[1.8rem] rounded-bl-none border theme-border shadow-sm flex gap-2">
              <div className="w-2 h-2 bg-[#D9D1C5] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#D9D1C5] rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-[#D9D1C5] rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-center space-y-3 animate-in zoom-in duration-300">
            <p className="text-xs font-bold">{error}</p>
            <button 
              onClick={() => handleSendMessage()}
              className="text-[10px] font-black uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-rose-200 shadow-sm active:scale-95 transition-transform"
            >
              {t.retry}
            </button>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-5 bg-white/90 backdrop-blur-xl border-t theme-border pb-32">
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <input 
            type="text"
            className="w-full pl-6 pr-14 py-4 theme-sub-bg rounded-[2rem] border-none focus:ring-2 focus:ring-current theme-primary font-bold placeholder:text-[#B8B0A5] transition-all shadow-inner"
            placeholder={t.placeholder}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !inputText.trim()}
            className={`absolute right-2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              inputText.trim() && !loading ? 'theme-bg-primary text-white shadow-lg scale-100' : 'bg-gray-100 text-gray-300 scale-90'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAdvisor;
