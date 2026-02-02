import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

export const analyzeStock = async (products: Product[], query: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare context data
    const inventoryContext = JSON.stringify(products.map(p => ({
      name: p.name,
      category: p.category,
      qty: p.quantity,
      price: p.price,
      status: p.quantity < p.min_stock ? 'BAIXO ESTOQUE' : 'OK'
    })));

    const prompt = `
      Você é um especialista em gestão de estoque.
      Analise os seguintes dados de inventário (em formato JSON) e responda à pergunta do usuário.
      Seja conciso, direto e dê insights práticos.
      
      Dados do Estoque:
      ${inventoryContext}

      Pergunta do Usuário:
      ${query}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao consultar a IA. Verifique sua conexão e chave de API.";
  }
};