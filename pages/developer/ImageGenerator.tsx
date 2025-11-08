import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';
import { callOpenRouterApi, OpenRouterMessage } from '../../utils/openRouterApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('A futuristic city at sunset, with flying cars and neon lights, highly detailed, 8K, concept art');
    const [conceptText, setConceptText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const generateConcept = async () => {
        if (!prompt.trim()) {
            setError('Please enter a description for the image concept.');
            return;
        }

        setIsLoading(true);
        setError('');
        setConceptText('');

        try {
            const messages: OpenRouterMessage[] = [
                {
                    role: 'system',
                    content: 'You are an AI specialized in generating highly detailed and imaginative textual descriptions for image concepts. Focus on visual elements, style, lighting, composition, and mood, suitable for an artist to draw from. Do not generate an actual image, only text.',
                },
                {
                    role: 'user',
                    content: `Generate a detailed image concept for: "${prompt}"`,
                },
            ];

            const response = await callOpenRouterApi({
                model: 'google/gemini-pro',
                messages: messages,
                temperature: 0.9,
                max_tokens: 500,
            });

            const generatedContent = response.choices?.[0]?.message?.content || '';
            setConceptText(generatedContent);

        } catch (err: any) {
            console.error('AI Image Concept Generation Error:', err);
            setError(err.message || 'An AI error occurred during concept generation.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const longDescription = (
        <>
            <p>
                Our AI Image Concept Generator leverages the power of OpenRouter's advanced language models to create vivid and detailed textual descriptions of images. Instead of producing actual visual art, this tool helps you articulate your creative vision by generating rich, descriptive text that covers aspects like style, composition, lighting, and mood. It's an invaluable asset for artists, designers, writers, and game developers who need to solidify their ideas before moving to visual creation, or for anyone who wants to explore imaginative concepts.
            </p>
            <p>
                Simply provide a brief prompt describing the image you envision, and our AI will expand on it, giving you a comprehensive textual concept that can guide your next creative step. This ensures that even without direct image generation, you can still harness AI to refine your visual ideas.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">How it Works</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Textual Descriptions:</strong> Input your desired image prompt, and the AI generates a detailed text concept, not an image.</li>
                <li><strong>Creative Expansion:</strong> The AI expands on your prompt to include rich visual details, helping to bring your concept to life through words.</li>
                <li><strong>Inspiration & Planning:</strong> Use the generated text as a blueprint for human artists, or as a narrative element in creative writing.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">This tool generates text descriptions of images and does not produce actual image files.</p>
        </>
    );

    return (
        <ToolPageLayout
            title="AI Image Concept Generator"
            description="Generate detailed textual concepts for images based on prompts using OpenRouter."
            longDescription={longDescription}
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-brand-text-secondary mb-1">
                        Describe the image concept you want to generate (e.g., "A futuristic city at sunset...")
                    </label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A fantasy forest with glowing mushrooms and a hidden waterfall."
                        rows={4}
                        className="w-full p-3 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>

                <button
                    onClick={generateConcept}
                    disabled={isLoading}
                    className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg disabled:bg-gray-500"
                >
                    {isLoading ? <AiLoadingSpinner message="Generating concept..." /> : 'Generate Image Concept'}
                </button>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {conceptText && (
                    <div className="space-y-4 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-brand-primary">Generated Concept</h3>
                        <div className="bg-brand-bg p-4 rounded-md whitespace-pre-wrap text-brand-text-primary border border-brand-border">
                            {conceptText}
                        </div>
                        <div className="flex justify-end">
                            <CopyButton textToCopy={conceptText} />
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
};

export default ImageGenerator;