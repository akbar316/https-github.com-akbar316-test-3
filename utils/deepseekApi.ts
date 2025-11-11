import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * FIX: Implemented runDeepSeekWithSchema to fix missing export error.
 * Based on project guidelines, this function uses the Gemini API to handle schema-based JSON generation,
 * treating the "DeepSeek" name as a placeholder for this functionality.
 */
export const runDeepSeekWithSchema = async (model: string, prompt: string, schema: any): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Ignoring the `model` parameter as instructed to use Gemini. 'gemini-2.5-pro' is for complex text tasks.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    let jsonStr = response.text.trim();
    return jsonStr;
};
