
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Category, Account } from "../types";

export const getFinancialAdvice = async (
  expenses: Expense[],
  categories: Category[],
  accounts: Account[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (expenses.length === 0) return "Inizia ad aggiungere spese per ricevere consigli personalizzati!";

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
    });
    return response.text || "Non è stato possibile generare un'analisi.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "L'assistente AI non è riuscito a elaborare i dati.";
  }
};

export interface BankParseInput {
  text?: string;
  file?: {
    data: string;
    mimeType: string;
  };
}

export const parseBankStatement = async (input: BankParseInput, categories: Category[], incomeCategories: any[]): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Sei un assistente esperto in contabilità bancaria italiana. Analizza l'estratto conto allegato (PDF o testo).
    
    ISTRUZIONI PER IL LAYOUT:
    1. **FINECO**: Cerca le colonne "USCITE" e "ENTRATE". Se un valore è in "USCITE", è una SPESA. Se è in "ENTRATE", è un'ENTRATA.
    2. **BPER / ALTRE**: Cerca la colonna "Importo Euro". Se il numero è preceduto da "-" o è indicato come addebito, è una SPESA. Se è positivo o accredito, è un'ENTRATA.
    3. **DECIMALI**: Gli importi usano la virgola (es. 10,50). Convertili in formato numerico standard (es. 10.50). L'importo nel JSON deve essere sempre POSITIVO.
    4. **DATE**: Formato richiesto YYYY-MM-DD.
    5. **CATEGORIE**: Associa ogni riga all'ID più logico:
       - USCITE: ${JSON.stringify(categories.map(c => ({ id: c.id, name: c.name })))}
       - ENTRATE: ${JSON.stringify(incomeCategories.map(c => ({ id: c.id, name: c.name })))}

    Estrai SOLO i singoli movimenti. Ignora i riepiloghi, i saldi iniziali/finali e le competenze.
    Restituisci un array JSON piatto di oggetti.
  `;

  const parts: any[] = [];
  if (input.file) {
    parts.push({
      inlineData: {
        data: input.file.data,
        mimeType: input.file.mimeType
      }
    });
  }
  
  parts.push({ text: input.text ? `${prompt}\n\nTESTO AGGIUNTIVO: ${input.text}` : prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts }],
      config: {
        // Configurazione cruciale per Gemini 3: budget di pensiero + limite output
        thinkingConfig: { thinkingBudget: 10000 },
        maxOutputTokens: 20000, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ["SPESA", "ENTRATA"] },
              date: { type: Type.STRING },
              categoryId: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["amount", "type", "date", "categoryId", "notes"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Risposta vuota dal modello.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw error;
  }
};
