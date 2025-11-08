// This file provides a centralized function to call the OpenRouter API.
// It abstracts away the API key management and SDK initialization.

interface OpenRouterMessage {
  role: 'user' | 'system' | 'assistant' | 'tool';
  content: string | Array<{ type: 'text', text: string } | { type: 'image_url', image_url: { url: string } }>;
  tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>;
  tool_call_id?: string;
}

interface OpenRouterChatCompletionRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  response_format?: { type: "json_object" };
  tools?: any[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  seed?: number;
  // Custom headers to pass to fetch, not to the API body
  request_headers?: {
    'HTTP-Referer'?: string;
    'X-Title'?: string;
  };
}

interface OpenRouterChatCompletionResponse {
  id: string;
  choices: Array<{
    finish_reason: string;
    index: number;
    message: OpenRouterMessage;
  }>;
  created: number;
  model: string;
  object: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Calls the OpenRouter Chat Completions API.
 *
 * @param {OpenRouterChatCompletionRequest} request - The request payload for the API call.
 * @returns {Promise<OpenRouterChatCompletionResponse>} The response from the OpenRouter API.
 * @throws {Error} If the API key is missing or the API call fails.
 */
export async function callOpenRouterApi(request: OpenRouterChatCompletionRequest): Promise<OpenRouterChatCompletionResponse> {
  // Use import.meta.env for Vite client-side environment variables
  if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not defined in environment variables. Please ensure it is set with the 'VITE_' prefix in your Vercel project settings.");
  }

  const defaultHeaders = {
    'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': request.request_headers?.['HTTP-Referer'] || 'https://dicetools.com', // Replace with your actual domain
    'X-Title': request.request_headers?.['X-Title'] || 'DiceTools AI Integration',
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        ...request,
        request_headers: undefined, // Ensure custom headers are not in the body
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error response:", errorData);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorData.message || JSON.stringify(errorData)}`);
    }

    const data: OpenRouterChatCompletionResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error("OpenRouter API call failed:", error);
    throw new Error(`OpenRouter API error: ${error.message || 'Unknown error occurred.'}`);
  }
}

/**
 * Converts a File object to a base64 encoded data URL.
 * Used for multimodal content in OpenRouter API calls.
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as data URL."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a File object to an OpenRouter-compatible image_url content part.
 */
export async function fileToImageUrlContent(file: File): Promise<{ type: 'image_url', image_url: { url: string, detail?: 'low' | 'high' } }> {
  const base64Url = await fileToBase64(file);
  return { type: 'image_url', image_url: { url: base64Url, detail: 'high' } };
}

// Re-export types for convenience
export type { OpenRouterChatCompletionRequest, OpenRouterChatCompletionResponse, OpenRouterMessage };