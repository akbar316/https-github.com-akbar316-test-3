import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { fileToDataUrl } from "./imageUtils";

/**
 * FIX: Implemented runGeminiVisionWithDataUrl to fix missing export error.
 * This function sends a prompt and an image (as a data URL) to the Gemini vision model.
 */
export const runGeminiVisionWithDataUrl = async (prompt: string, imageUrl: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const parts = imageUrl.split(',');
    const mimeTypePart = parts[0];
    const base64Data = parts[1];

    if (!mimeTypePart || !base64Data) {
        throw new Error("Invalid data URL for image.");
    }
    const mimeTypeMatch = mimeTypePart.match(/:(.*?);/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'application/octet-stream';

    const imagePart = {
        inlineData: {
            mimeType,
            data: base64Data,
        },
    };

    const textPart = {
        text: prompt,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });

    return response.text;
};

/**
 * FIX: Implemented editImageWithGemini to fix missing export error.
 * This function sends a prompt and a base image to the Gemini image editing model.
 */
export const editImageWithGemini = async (prompt: string, baseImageFile: File): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const dataUrl = await fileToDataUrl(baseImageFile);
    const base64ImageData = dataUrl.split(',')[1];
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType: baseImageFile.type,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error("No image was generated in the response.");
};

/**
 * FIX: Implemented generateImageWithGemini to fix missing export error.
 * This function sends a prompt to the Gemini image generation model.
 */
export const generateImageWithGemini = async (prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error("No image was generated in the response.");
};
