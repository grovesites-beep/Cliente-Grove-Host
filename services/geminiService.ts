import { GoogleGenAI } from "@google/genai";
import { GenerateBlogParams } from '../types';

// Initialize Gemini
// NOTA: Em um app de produção real, você deve usar um proxy no backend para ocultar a chave,
// mas para esta demonstração no frontend, usamos a variável de ambiente diretamente.
const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("Chave de API ausente");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateBlogOutline = async (params: GenerateBlogParams): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Erro: Chave de API não configurada.";

  try {
    const prompt = `
      Você é um redator especialista em SEO. Crie um esboço detalhado de postagem de blog para um site de negócios.
      O idioma DEVE ser Português do Brasil.
      
      Tópico: ${params.topic}
      Tom de voz: ${params.tone}
      Palavras-chave alvo: ${params.keywords}
      
      Formate a saída como uma lista HTML estruturada (<ul>, <li>), mas retorne como uma string.
      Inclua uma sugestão de Título atraente no topo, envolvida em uma tag <h3>.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Falha ao gerar o esboço.";
  } catch (error) {
    console.error("Erro na Geração IA:", error);
    return "Erro ao gerar conteúdo. Verifique sua chave de API.";
  }
};

export const generateFullPost = async (outline: string, params: GenerateBlogParams): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Erro: Chave de API não configurada.";

  try {
    const prompt = `
      Escreva uma postagem de blog completa e de alta conversão baseada neste esboço:
      ${outline}

      Contexto:
      Tópico: ${params.topic}
      Tom de voz: ${params.tone}
      Idioma: Português do Brasil
      
      Regras:
      1. Use formatação HTML (<p>, <h2>, <h3>, <strong>, <ul>).
      2. Mantenha os parágrafos curtos e legíveis.
      3. Otimize para SEO com base nas palavras-chave: ${params.keywords}.
      4. Não inclua crases de markdown (backticks).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Falha ao gerar o post.";
  } catch (error) {
    console.error("Erro na Geração IA:", error);
    return "Erro ao gerar postagem completa.";
  }
};