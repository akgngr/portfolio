import { GoogleGenerativeAI } from "@google/generative-ai";

// Cloudflare Pages'de env değişkenleri runtime'dan gelir.
// İstemci tarafında kullanmak için PUBLIC_ öneki gerekir.
const apiKey = (import.meta as any).env?.PUBLIC_GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const modelName = 'gemini-1.5-flash';

export const generateBlogContent = async (topic: string, tone: string = 'professional'): Promise<string> => {
  if (!genAI) return "API Key is missing. Please configure PUBLIC_GEMINI_API_KEY.";

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(`Write a comprehensive blog post about "${topic}". The tone should be ${tone}. Use Markdown formatting. Include a catchy title in the first line, followed by an introduction, key points, and a conclusion.`);
    const response = await result.response;
    return response.text() || "Failed to generate content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please try again.";
  }
};

export const enhanceServiceDescription = async (currentDescription: string): Promise<string> => {
  if (!genAI) return currentDescription;

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(`Improve the following service description to be more compelling and marketing-focused for a portfolio website. Keep it concise (under 50 words). \n\nOriginal: "${currentDescription}"`);
    const response = await result.response;
    return response.text()?.replace(/^"|"$/g, '') || currentDescription;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return currentDescription;
  }
};

export const generateSkillsList = async (role: string): Promise<{
  [x: string]: any;name: string, category: string, proficiency: number
}[]> => {
    if (!genAI) return [];
    
    try {
        const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
                responseMimeType: "application/json"
            }
        });
        const result = await model.generateContent(`Generate a list of 5 essential technical skills for a "${role}". Return ONLY a JSON array with objects containing 'name', 'category' (one of: frontend, backend, design, tools), and 'proficiency' (integer 70-100).`);
        const response = await result.response;
        const text = response.text();
        if (!text) return [];
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini API Error:", error);
        return [];
    }
}

export const enhanceContent = async (text: string, action: 'improve' | 'summarize' | 'expand' | 'tone-professional' | 'tone-friendly'): Promise<string> => {
  if (!genAI) return text;

  let prompt = "";
  switch (action) {
    case 'improve':
      prompt = `Improve the following text for better clarity, grammar, and flow. Maintain the original meaning but make it more professional and engaging. Return ONLY the improved text:\n\n"${text}"`;
      break;
    case 'summarize':
      prompt = `Summarize the following text into a concise version while keeping the core message. Return ONLY the summary:\n\n"${text}"`;
      break;
    case 'expand':
      prompt = `Expand the following text with more details and context while maintaining the same message. Return ONLY the expanded version:\n\n"${text}"`;
      break;
    case 'tone-professional':
      prompt = `Rewrite the following text in a professional, corporate tone. Return ONLY the rewritten text:\n\n"${text}"`;
      break;
    case 'tone-friendly':
      prompt = `Rewrite the following text in a friendly, conversational tone. Return ONLY the rewritten text:\n\n"${text}"`;
      break;
    default:
      prompt = `Improve the following text:\n\n"${text}"`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text()?.trim().replace(/^"|"$/g, '') || text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return text;
  }
};
