import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';
import { callOpenRouterApi, OpenRouterMessage } from '../../utils/openRouterApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';

const TextToImageGenerator: React.FC = () => {
    const [textPrompt, setTextPrompt] = useState('A majestic lion roaring in the African savanna during golden hour, photographic, detailed fur, dynamic pose, bokeh background');
    const [conceptText, setConceptText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const generateImageConcept = async () => {
        if (!textPrompt.trim()) {
            setError('Please enter a text prompt for the image concept.');
            return;
        }

        setIsLoading(true);
        setError('');
        setConceptText('');

        try {
            const messages: OpenRouterMessage[] = [
                {
                    role: 'system',
                    content: 'You are an AI that converts a simple text prompt into a highly detailed and evocative textual description of an image. Your output should include artistic style, mood, composition, lighting, color palette, and any specific elements that would guide an image generation model or an artist. Do not generate an actual image, only text.',
                },
                {
                    role: 'user',
                    content: `Convert the following text prompt into a detailed image concept: "${textPrompt}"`,
                },
            ];

            const response = await callOpenRouterApi({
                model: 'google/gemini-pro-1.5',
                messages: messages,
                temperature: 0.9,
                max_tokens: 500,
            });

            const generatedContent = (response.choices?.[0]?.message?.content as string) || '';
            setConceptText(generatedContent);

        } catch (err: any) {
            console.error('AI Text to Image Concept Generation Error:', err);
            setError(err.message || 'An AI error occurred during concept generation.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const longDescription = (
        <>
            <p>
                The AI Text to Image Concept tool utilizes OpenRouter's language models to transform your concise text prompts into elaborate textual descriptions of potential images. While it does not create visual images directly, it crafts rich, detailed text that serves as an excellent blueprint for visual artists or dedicated image generation models. This tool is perfect for refining your ideas, exploring creative directions, and ensuring your vision is clearly articulated.
            </p>
            <p>
                Input a simple phrase like "a dog flying a spaceship," and the AI will expand it into a comprehensive narrative of the scene, detailing the spaceship's design, the dog's expression, the background, and the overall artistic style. This text-based output empowers you with a solid foundation for your next visual project.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Why Use Text-Based Image Concepts?</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Detailed Blueprints:</strong> Get a descriptive text output that guides human artists or advanced image generation tools.</li>
                <li><strong>Creative Exploration:</strong> Quickly iterate on ideas and see how different elements can be described and combined.</li>
                <li><strong>Clarity of Vision:</strong> Ensure your image concept is fully fleshed out before committing to visual production.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">This tool generates text descriptions of images and does not produce actual image files.</p>
        </>
    );

    return (
        <ToolPageLayout
            title="AI Text to Image Concept"
            description="Create stunning textual descriptions for images from text prompts using OpenRouter."
            longDescription={longDescription}
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <label htmlFor="text-prompt" className="block text-sm font-medium text-brand-text-secondary mb-1">
                        Enter your text prompt (e.g., "A majestic lion roaring...")
                    </label>
                    <textarea
                        id="text-prompt"
                        value={textPrompt}
                        onChange={(e) => setTextPrompt(e.target.value)}
                        placeholder="e.g., A neon cityscape with rain reflecting off the streets, film noir style, dramatic lighting."
                        rows={4}
                        className="w-full p-3 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>

                <button
                    onClick={generateImageConcept}
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

export default TextToImageGenerator;