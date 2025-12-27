
import { GoogleGenAI } from "@google/genai";
import { Expense, Category, Account } from "../types";

export const getFinancialAdvice = async (
  expenses: Expense[],
  categories: Category[],
  accounts: Account[]
): Promise<string> => {
  if (expenses.length === 0) return "Inizia ad aggiungere spese per ricevere consigli personalizzati!";

  // Inizializzazione conforme alle linee guida
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Sintesi dei dati per il prompt
  const expenseData = expenses.slice(0, 50).map(e => ({
    amount: e.amount,
    date: e.date,
    category: categories.find(c => c.id === e.categoryId)?.name || 'Altro'
  }));

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const prompt = `
    Agisci come un consulente finanziario esperto. Analizza la situazione di questo utente:
    - Saldo Totale: €${totalBalance.toFixed(2)}
    - Ultime Spese: ${JSON.stringify(expenseData)}
    
    Fornisci un breve riassunto (massimo 100 parole) con 3 suggerimenti pratici e specifici per risparmiare basandoti su questi dati.
    Rispondi in italiano in modo amichevole.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    
    // Accesso diretto alla proprietà .text come richiesto
    return response.text || "Non è stato possibile generare un'analisi al momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "L'assistente AI non è riuscito a elaborare i dati. Verifica la configurazione della chiave API.";
  }
};
