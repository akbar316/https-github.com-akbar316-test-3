import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';
import { callOpenRouterApi } from '../../utils/openRouterApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner'; // Import shared spinner

const TextToImageGenerator: React.FC = () => {
    const [textPrompt, setTextPrompt] = useState('An astronaut riding a horse on the moon, cinematic shot, hyperrealistic, 8k');
    const [generatedConcept, setGeneratedConcept] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!textPrompt.trim()) {
            setError('Please enter a text prompt for the image concept.');
            return;
        }

        setLoading(true);
        setError('');
        setGeneratedConcept(null);

        try {
            const openRouterPrompt = `Act as an advanced AI image generation prompt creator. Based on the following user text prompt, generate a highly detailed textual concept for a visual image. Focus on descriptive elements like subject, action, environment, mood, lighting, art style, and any specific visual effects. Do NOT generate actual image data, only the textual description.

User text prompt: "${textPrompt}"

Provide a detailed, vivid description (approximately 100-150 words) that an image AI could use to generate a stunning visual.`;

            const response = await callOpenRouterApi({
                model: 'google/gemini-pro-1.5', // Using Gemini Pro on OpenRouter for detailed text generation
                messages: [{ role: 'user', content: openRouterPrompt }],
                temperature: 0.9, // Higher temperature for more creative descriptions
                max_tokens: 500,
            });

            // Ensure conceptText is a string by extracting text content from message.content
            const conceptText = Array.isArray(response.choices?.[0]?.message?.content)
                ? response.choices[0].message.content.filter(part => part.type === 'text').map(part => (part as {type: 'text', text: string}).text).join('')
                : response.choices?.[0]?.message?.content || '';

            if (conceptText) {
                setGeneratedConcept(conceptText);
            } else {
                setError('No image concept could be generated. Please try a different prompt.');
            }

        } catch (e: any) {
            console.error(e);
            setError(`An AI error occurred: ${e.message || 'Failed to create image concept.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout
            title="AI Text to Image Concept"
            description="Create stunning textual descriptions for images from text prompts using OpenRouter."
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Text Prompt</label>
                        <textarea
                            value={textPrompt}
                            onChange={(e) => setTextPrompt(e.target.value)}
                            placeholder="Enter a detailed description of the image you want to create..."
                            rows={8}
                            className="w-full p-3 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            disabled={loading}
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-brand-primary text-white px-6 py-3 rounded-md hover:bg-brand-primary-hover transition-colors disabled:bg-gray-600 font-semibold text-lg"
                    >
                        {loading ? <AiLoadingSpinner message="Creating concept..." /> : 'Generate Image Concept'}
                    </button>
                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                </div>

                <div className="md:col-span-1 space-y-4">
                    <h3 className="font-semibold text-brand-text-primary">Generated Image Concept (Text)</h3>
                    <div className="relative bg-brand-bg p-4 rounded-md min-h-[15rem] flex flex-col justify-between">
                        {loading && !generatedConcept ? (
                            <div className="flex-grow flex items-center justify-center">
                                <AiLoadingSpinner message="Creating concept..." />
                            </div>
                        ) : generatedConcept ? (
                            <p className="text-brand-text-secondary whitespace-pre-wrap">{generatedConcept}</p>
                        ) : (
                            <p className="text-brand-text-secondary opacity-70 italic text-center m-auto">Your AI-generated image concept will appear here.</p>
                        )}
                        {generatedConcept && (
                            <div className="flex justify-end mt-4">
                                <CopyButton textToCopy={generatedConcept} />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-brand-text-secondary text-center">
                        Note: This tool generates a detailed textual description of an image using AI, not an actual visual image file.
                        You can use this description as a prompt for external image generation services.
                    </p>
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default TextToImageGenerator;