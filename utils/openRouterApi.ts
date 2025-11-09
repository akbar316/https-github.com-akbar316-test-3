// The Replicate API token should be set as an environment variable in your deployment environment.
// For Vite, it should be prefixed with `VITE_`.
// e.g., VITE_REPLICATE_API_TOKEN=r8_...
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_REPLICATE_API_TOKEN: string;
    };
  }
}

const API_HOST = 'https://api.replicate.com';

interface Prediction {
    id: string;
    model: string;
    version: string;
    input: object;
    logs: string | null;
    error: any | null;
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
    urls: {
        get: string;
        cancel: string;
    };
    output: any;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPrediction(predictionUrl: string): Promise<Prediction> {
    if (!import.meta.env.VITE_REPLICATE_API_TOKEN) {
        throw new Error("REPLICATE_API_TOKEN is not defined. Please ensure it is set with the 'VITE_' prefix in your environment variables.");
    }
    const response = await fetch(predictionUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get prediction: ${error.detail}`);
    }
    return response.json();
}

/**
 * Runs a model on Replicate and waits for the result.
 * @param modelId The version ID of the Replicate model.
 * @param input The input object for the model.
 * @returns The output from the Replicate model.
 */
export async function runReplicate(modelId: string, input: object): Promise<any> {
    if (!import.meta.env.VITE_REPLICATE_API_TOKEN) {
        throw new Error("REPLICATE_API_TOKEN is not defined. Please ensure it is set with the 'VITE_' prefix in your environment variables.");
    }

    const startResponse = await fetch(`${API_HOST}/v1/predictions`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            version: modelId,
            input,
        }),
    });

    if (!startResponse.ok) {
        const error = await startResponse.json();
        throw new Error(`Failed to create prediction: ${error.detail}`);
    }

    let prediction: Prediction = await startResponse.json();

    while (
        prediction.status !== 'succeeded' &&
        prediction.status !== 'failed' &&
        prediction.status !== 'canceled'
    ) {
        await sleep(2000); // Poll every 2 seconds
        prediction = await getPrediction(prediction.urls.get);
        if (prediction.error) {
            throw new Error(`Prediction failed: ${prediction.error}`);
        }
    }

    if (prediction.status === 'succeeded') {
        return prediction.output;
    } else {
        throw new Error(`Prediction did not succeed. Status: ${prediction.status} - ${prediction.error || ''}`);
    }
}


/**
 * Converts a File object to a base64 encoded data URL.
 * Used for multimodal content in Replicate API calls.
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
