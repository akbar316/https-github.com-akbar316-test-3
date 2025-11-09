import { GoogleGenAI, GenerateContentResponse, Modality, Type, GenerateContentParameters } from "@google/genai";

// The guidelines are strict to use process.env.API_KEY.
// We assume the build environment makes this available to the client-side code.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A helper function to convert a File object to a base64 encoded string for the Gemini API.
 * @param file The file to convert.
 * @returns A promise that resolves with an object suitable for the Gemini API.
 */
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

/**
 * Runs a Gemini model for text-only prompts.
 */
export const runGemini = async (model: string, prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    return response.text;
};


/**
 * Runs a Gemini vision model with a data URL (e.g., from a canvas).
 */
export const runGeminiVisionWithDataUrl = async (prompt: string, dataUrl: string): Promise<string> => {
    const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
    const base64Data = dataUrl.split(',')[1];
    const imagePart = {
        inlineData: { data: base64Data, mimeType },
    };
    const textPart = { text: prompt };
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [imagePart, textPart] },
    });
    return response.text;
};


/**
 * Generates an image using Gemini.
 */
export const generateImageWithGemini = async (prompt: string): Promise<string> => {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data; // base64 encoded string
        }
    }
    throw new Error("No image data found in Gemini response.");
};


/**
 * Edits an image using Gemini.
 */
export const editImageWithGemini = async (prompt: string, file: File): Promise<string> => {
     const imagePart = await fileToGenerativePart(file);
     const textPart = { text: prompt };
     const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
     for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("No edited image data found in Gemini response.");
};

/**
 * Runs a Gemini model with a specified JSON schema for structured output.
 */
export const runGeminiWithSchema = async (model: string, prompt: string, schema: any): Promise<string> => {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });
    return response.text;
};
