import React, { useState } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';
import { runReplicate } from '../../utils/openRouterApi';

const SDXL_MODEL = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

const TextToImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('A photorealistic image of a futuristic city with flying cars, neon lights, and lush vertical gardens on skyscrapers.');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const generateImage = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError('');
        setImageUrl(null);

        try {
            const aspectRatioMap: { [key: string]: { width: number, height: number } } = {
                '1:1': { width: 1024, height: 1024 },
                '16:9': { width: 1344, height: 768 },
                '9:16': { width: 768, height: 1344 },
                '4:3': { width: 1152, height: 896 },
                '3:4': { width: 896, height: 1152 },
            };
            const { width, height } = aspectRatioMap[aspectRatio] || { width: 1024, height: 1024 };

            const output = await runReplicate(SDXL_MODEL, {
                prompt: prompt,
                width: width,
                height: height,
            });

            if (output && Array.isArray(output) && output.length > 0) {
                setImageUrl(output[0]);
            } else {
                throw new Error('AI did not return a valid image.');
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred while generating the image.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ToolPageLayout
            title="AI Text-to-Image Generator"
            description="Generate high-quality images from text prompts using AI."
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
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Aspect Ratio</label>
                        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full p-2 bg-brand-bg border border-brand-border rounded-md">
                            <option value="1:1">Square (1:1)</option>
                            <option value="16:9">Landscape (16:9)</option>
                            <option value="9:16">Portrait (9:16)</option>
                            <option value="4:3">Standard (4:3)</option>
                            <option value="3:4">Tall (3:4)</option>
                        </select>
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
