
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Category, Account } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (
  expenses: Expense[],
  categories: Category[],
  accounts: Account[]
): Promise<string> => {
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
  const textPart = {
    text: `
      Analizza questo estratto conto bancario (fornito come testo o file PDF).
      Estrai ogni singola transazione e convertila in un oggetto JSON.
      
      Istruzioni Cruciali:
      1. Importo: numero positivo sempre.
      2. Tipo: "SPESA" per addebiti/uscite, "ENTRATA" per accrediti/stipendi/bonifici in entrata.
      3. Data: formato YYYY-MM-DD.
      4. Categoria: Scegli l'ID più adatto tra:
         - SPESE: ${JSON.stringify(categories.map(c => ({ id: c.id, name: c.name })))}
         - ENTRATE: ${JSON.stringify(incomeCategories.map(c => ({ id: c.id, name: c.name })))}
      5. Note: Descrizione pulita (es. "Amazon", "Stipendio", "Affitto").

      Restituisci solo un array JSON puro.
    `
  };

  const parts: any[] = [textPart];
  
  if (input.file) {
    parts.push({
      inlineData: {
        data: input.file.data,
        mimeType: input.file.mimeType
      }
    });
  } else if (input.text) {
    parts.push({ text: `Testo estratto conto: "${input.text}"` });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
      config: {
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

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw error;
  }
};
