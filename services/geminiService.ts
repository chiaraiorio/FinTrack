import { GoogleGenAI } from "@google/genai";
import { Expense, Category, Account } from "../types";

export const getFinancialAdvice = async (
  expenses: Expense[],
  categories: Category[],
  accounts: Account[]
): Promise<string> => {
  if (expenses.length === 0) return "Inizia ad aggiungere spese per ricevere consigli personalizzati!";

  // Fix: Initialize GoogleGenAI inside the function to ensure up-to-date API key usage from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const expenseData = expenses.map(e => ({
    amount: e.amount,
    date: e.date,
    category: categories.find(c => c.id === e.categoryId)?.name || 'Sconosciuta'
  }));

  const prompt = `
    Agisci come un consulente finanziario esperto. Analizza le seguenti spese e fornisci un breve riassunto (massimo 100 parole)
    con 3 suggerimenti pratici per risparmiare.
    Spese: ${JSON.stringify(expenseData)}
    Rispondi in italiano in modo amichevole e professionale.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Fix: Access .text property directly (not a method) as per SDK specifications
    return response.text || "Non è stato possibile generare un'analisi al momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analisi intelligente non disponibile. Controlla la tua connessione.";
  }
};