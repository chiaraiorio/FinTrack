
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
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const initChat = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const expenseSummary = expenses.map(e => ({
      amount: e.amount,
      category: categories.find(c => c.id === e.categoryId)?.name || 'Sconosciuta',
      date: e.date
    }));

    const systemInstruction = `
      Sei FinTrack AI, un consulente finanziario personale esperto.
      L'utente ha questi dati:
      - Spese: ${JSON.stringify(expenseSummary)}
      - Conti: ${JSON.stringify(accounts.map(a => ({ name: a.name, balance: a.balance })))}
      
      I tuoi compiti:
      1. Rispondi in modo cordiale, professionale e conciso (italiano).
      2. Analizza i dati reali dell'utente per fornire consigli su risparmio, budget e trend.
      3. Se l'utente fa domande non finanziarie, riportalo gentilmente sulla gestione dei soldi.
      4. Sii proattivo: se noti troppe spese in una categoria, segnalalo.
    `;

    chatRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Messaggio di benvenuto automatico
    setLoading(true);
    try {
      const response = await chatRef.current.sendMessage({ message: "Fai un brevissimo saluto iniziale basandoti sui miei dati finanziari attuali." });
      setMessages([{ role: 'model', text: response.text || "Ciao! Sono il tuo consulente FinTrack. Come posso aiutarti oggi?" }]);
    } catch (e) {
      setMessages([{ role: 'model', text: "Ciao! Sono pronto ad aiutarti con la tua gestione finanziaria. Chiedimi pure qualsiasi cosa!" }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    initChat();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || loading || !chatRef.current) return;

    const userMessage = inputText.trim();
    setInputText("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: result.text || "Mi dispiace, non sono riuscito a elaborare la risposta." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Si è verificato un errore di connessione. Riprova tra poco." }]);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    it: { title: 'Consulente AI', placeholder: 'Chiedi al consulente...', subtitle: 'Chat Finanziaria' },
    en: { title: 'AI Advisor', placeholder: 'Ask the advisor...', subtitle: 'Financial Chat' }
  }[language];

  return (
    <div className="flex flex-col h-screen theme-bg-app animate-in fade-in duration-500">
      <header className="px-5 pt-12 pb-4 flex flex-col gap-4 bg-white/50 backdrop-blur-md border-b theme-border sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <button 
            onClick={onOpenSidebar}
            className="w-10 h-10 theme-card rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6 theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Online</span>
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
              <p className="text-[15px] leading-relaxed font-medium">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-6 py-4 rounded-[1.8rem] rounded-bl-none border theme-border shadow-sm flex gap-1.5">
              <div className="w-2 h-2 bg-[#D9D1C5] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#D9D1C5] rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-[#D9D1C5] rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-5 bg-white/80 backdrop-blur-lg border-t theme-border pb-32">
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <input 
            type="text"
            className="w-full pl-6 pr-14 py-4 theme-sub-bg rounded-2xl border-none focus:ring-2 focus:ring-current theme-primary font-bold placeholder:text-[#B8B0A5] transition-all"
            placeholder={t.placeholder}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !inputText.trim()}
            className={`absolute right-2 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              inputText.trim() && !loading ? 'theme-bg-primary text-white shadow-lg scale-100' : 'bg-gray-100 text-gray-400 scale-90'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAdvisor;
