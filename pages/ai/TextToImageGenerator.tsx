import React, { useState } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';
import { generateImageWithGemini } from '../../utils/geminiApi';
import { useApiKey } from '../../context/ApiKeyContext';

const TextToImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('A photorealistic image of a futuristic city with flying cars, neon lights, and lush vertical gardens on skyscrapers.');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { invalidateApiKey } = useApiKey();

    const generateImage = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError('');
        setImageUrl(null);

        try {
            const outputBase64 = await generateImageWithGemini(prompt);
            setImageUrl(`data:image/png;base64,${outputBase64}`);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || 'An error occurred while generating the image.';
            if (errorMessage.includes("Requested entity was not found.")) {
                setError("API Key not found or invalid. Please select a valid API key.");
                invalidateApiKey();
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ToolPageLayout
            title="AI Text-to-Image Generator"
            description="Generate high-quality images from text prompts using the Gemini API."
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={6}
                            placeholder="Describe the image you want to create..."
                            className="w-full p-2 bg-brand-bg border border-brand-border rounded-md"
                        />
                    </div>
                    <button
                        onClick={generateImage}
                        disabled={isLoading}
                        className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg disabled:bg-gray-500"
                    >
                        {isLoading ? <AiLoadingSpinner message="Generating..." /> : 'Generate Image'}
                    </button>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </div>
                <div className="bg-brand-bg p-4 rounded-lg flex items-center justify-center min-h-[300px] lg:min-h-full">
                    {isLoading ? (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
                            <p className="mt-4 text-brand-text-secondary">Generating image, this can take a moment...</p>
                        </div>
                    ) : imageUrl ? (
                        <div className="space-y-4">
                            <img src={imageUrl} alt="Generated" className="max-w-full max-h-[400px] rounded-md" />
                            <a href={imageUrl} download="dicetools_image.png" className="block w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center">
                                Download Image
                            </a>
                        </div>
                    ) : (
                        <p className="text-brand-text-secondary">Your image will appear here.</p>
                    )}
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default TextToImageGenerator;