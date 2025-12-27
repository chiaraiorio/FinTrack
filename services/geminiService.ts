
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
    Sei un assistente contabile esperto. Analizza l'estratto conto bancario fornito.
    
    REGOLE DI FILTRO:
    - IGNORA le pagine di informativa legale, glossari o pubblicità (es. pagine "Modulo Standard").
    - TROVA le tabelle dei movimenti.
    
    REGOLE DI ESTRAZIONE:
    1. FINECO: Se trovi colonne separate "USCITE" e "ENTRATE", assegna il tipo "SPESA" se il valore è in USCITE, "ENTRATA" se è in ENTRATE.
    2. BPER: Se trovi la colonna "Importo Euro", usa il segno per distinguere (negativo = SPESA, positivo = ENTRATA).
    3. NUMERI: Converti la virgola decimale italiana in punto (es. 1.250,50 -> 1250.50). L'importo nel JSON deve essere sempre un numero POSITIVO.
    4. DATE: Formato standard YYYY-MM-DD.
    5. CATEGORIE: Associa ogni riga a uno degli ID forniti sotto:
       - USCITE: ${JSON.stringify(categories.map(c => ({ id: c.id, name: c.name })))}
       - ENTRATE: ${JSON.stringify(incomeCategories.map(c => ({ id: c.id, name: c.name })))}
       Se incerto, usa "Altro".

    RESTITUISCI SOLO UN ARRAY JSON PIATTO.
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
  
  if (input.text) {
    parts.push({ text: `TESTO ESTRATTO: ${input.text}` });
  }

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts }],
      config: {
        // Ridotto il budget di pensiero per evitare timeout del server
        thinkingConfig: { thinkingBudget: 5000 },
        // Rimosso maxOutputTokens per evitare blocchi sulla lunghezza della risposta
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
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw error;
  }
};
