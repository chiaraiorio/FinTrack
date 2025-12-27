
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
  const prompt = `
    Analizza questo estratto conto bancario. Estrai OGNI singola transazione (movimento) e convertila in JSON.
    Il documento potrebbe essere una tabella complessa in PDF o un testo incollato.
    
    REGOLE DI ESTRAZIONE:
    1. Importo: DEVE essere un numero positivo.
    2. Tipo: "SPESA" se il movimento è un addebito/uscita (segno meno, colonna 'Avere' o 'Debiti'), "ENTRATA" se è un accredito/stipendio/bonifico (segno più, colonna 'Dare' o 'Crediti').
    3. Data: Formato standard YYYY-MM-DD. Cerca le date dei movimenti/valuta.
    4. Categoria: Associa ogni movimento all'ID più pertinente tra questi:
       - USCITE: ${JSON.stringify(categories.map(c => ({ id: c.id, name: c.name })))}
       - ENTRATE: ${JSON.stringify(incomeCategories.map(c => ({ id: c.id, name: c.name })))}
       Se non trovi corrispondenze, usa l'ID della categoria più generica (es. "Spesa" o "Altro").
    5. Note: Estrai il beneficiario o la causale (es. "Lidl", "Enel", "Stipendio Rossi"). Pulisci il testo da codici superflui.

    IMPORTANTE: Sii meticoloso. Se vedi tabelle, analizza riga per riga. Ignora i saldi intermedi, estrai solo i movimenti individuali.
  `;

  const parts: any[] = [];
  
  if (input.file) {
    // Inseriamo prima il file per dare contesto visivo immediato al modello
    parts.push({
      inlineData: {
        data: input.file.data,
        mimeType: input.file.mimeType
      }
    });
  }
  
  parts.push({ text: input.text ? `${prompt}\n\nTesto da analizzare: "${input.text}"` : prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Passiamo al modello Pro per una migliore lettura dei PDF complessi
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
