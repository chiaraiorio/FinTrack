
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
    Sei un estrattore dati specializzato in estratti conto bancari italiani (Fineco, BPER, Intesa, etc.).
    Analizza il documento (PDF o Testo) e trasforma TUTTI i movimenti in un array JSON.

    ISTRUZIONI CRITICHE PER IL FORMATO ITALIANO:
    1. **COLONNE IMPORTO**: 
       - Se vedi colonne separate "USCITE" e "ENTRATE" (tipico Fineco): Se un valore è in USCITE, crea un oggetto con type: "SPESA". Se è in ENTRATE, type: "ENTRATA".
       - Se vedi una colonna unica "Importo" (tipico BPER): Se il numero è negativo o indica un addebito, type: "SPESA". Se positivo o accredito, type: "ENTRATA".
    2. **NUMERI E DECIMALI**: Gli estratti conto italiani usano la virgola (,) come separatore decimale (es. 1.250,50). Convertili in numeri validi per il JSON (punto per i decimali, es. 1250.50). L'importo finale nel JSON deve essere sempre POSITIVO.
    3. **DATE**: Converti le date (es: 07.01.25, 23/10/2025) nel formato standard YYYY-MM-DD.
    4. **DESCRIZIONE (Note)**: Estrai il beneficiario o la causale completa (es: "Amazon Prime", "Stipendio Sandrini Metalli", "Iperal Costa Volpino"). Rimuovi codici operazione inutili.
    5. **CATEGORIZZAZIONE**: Usa gli ID forniti. Sii intelligente: "Lidl/Iperal" -> Spesa, "Amazon/Shein" -> Svago o Spesa, "Stipendio" -> Stipendio.
       - ID USCITE disponibili: ${JSON.stringify(categories.map(c => ({ id: c.id, name: c.name })))}
       - ID ENTRATE disponibili: ${JSON.stringify(incomeCategories.map(c => ({ id: c.id, name: c.name })))}

    NON saltare righe. Ignora i saldi iniziali/finali, estrai solo i movimenti individuali.
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
    parts.push({ text: `Testo da analizzare: ${input.text}` });
  }
  
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts }],
      config: {
        thinkingConfig: { thinkingBudget: 8000 }, // Budget elevato per analisi riga per riga
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

    const data = JSON.parse(response.text || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw error;
  }
};
