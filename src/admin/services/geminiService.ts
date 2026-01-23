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

export const generateSkillsList = async (role: string): Promise<{name: string, category: string, proficiency: number}[]> => {
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
