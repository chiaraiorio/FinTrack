
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
    Analizza attentamente questo estratto conto bancario italiano. 
    Il tuo compito è estrarre OGNI movimento di denaro presente.

    REGOLE CRITICHE DI ANALISI:
    1. FORMATO NUMERICO: Negli estratti conto italiani, la virgola (,) è spesso usata per i decimali. Converti tutto nel formato numerico standard (punto per i decimali).
    2. SEGNO E TIPO: 
       - Se l'importo è un addebito (Uscita, Segno meno, Colonna Avere/Debiti), usa type: "SPESA".
       - Se l'importo è un accredito (Entrata, Bonifico, Stipendio, Colonna Dare/Crediti), usa type: "ENTRATA".
       - L'importo nel JSON finale deve essere sempre POSITIVO.
    3. DATE: Converti le date (spesso GG/MM o GG/MM/AA) nel formato standard YYYY-MM-DD. Assumi l'anno corrente se non specificato.
    4. CATEGORIZZAZIONE: Associa ogni riga a uno di questi ID:
       - USCITE: ${JSON.stringify(categories.map(c => ({ id: c.id, name: c.name })))}
       - ENTRATE: ${JSON.stringify(incomeCategories.map(c => ({ id: c.id, name: c.name })))}
    5. NOTE: Scrivi una descrizione pulita (es: "Supermercato Conad", "Bonifico Stipendio").

    DOC DA ANALIZZARE: PDF o Testo allegato. Analizza riga per riga la tabella dei movimenti.
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
  parts.push({ text: input.text ? `${prompt}\n\nTESTO: ${input.text}` : prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts }],
      config: {
        thinkingConfig: { thinkingBudget: 4000 }, // Budget di pensiero per analizzare tabelle PDF complesse
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
