import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';
import { callOpenRouterApi, fileToImageUrlContent, OpenRouterMessage } from '../../utils/openRouterApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';

const HairstyleTryOn: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [hairstylePrompt, setHairstylePrompt] = useState('a modern bob with highlights');
    const [conceptText, setConceptText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
            setError('');
            setConceptText('');
        }
    };

    const generateHairstyleConcept = async () => {
        if (!imageFile) {
            setError('Please upload an image first.');
            return;
        }
        if (!hairstylePrompt.trim()) {
            setError('Please describe the hairstyle concept.');
            return;
        }

        setIsLoading(true);
        setError('');
        setConceptText('');

        try {
            const imageContent = await fileToImageUrlContent(imageFile);

            const messages: OpenRouterMessage[] = [
                {
                    role: 'system',
                    content: 'You are an AI assistant that analyzes a person\'s image and a hairstyle prompt, then generates a detailed textual concept of how that person would look with the described hairstyle. Focus on hair length, cut, color, texture, and how it frames the face. Do not generate an/an image, only text.',
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: `Given this image of a person, describe them with the following hairstyle: "${hairstylePrompt}"` },
                        imageContent
                    ],
                },
            ];

            const response = await callOpenRouterApi({
                model: 'google/gemini-1.5-flash', // Changed model to google/gemini-1.5-flash
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
            });

            const generatedContent = (response.choices?.[0]?.message?.content as string) || '';
            setConceptText(generatedContent);

        } catch (err: any) {
            console.error('AI Hairstyle Concept Generation Error:', err);
            setError(err.message || 'An AI error occurred during concept generation.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const longDescription = (
        <>
            <p>
                The AI Hairstyle Concept Generator utilizes OpenRouter's multimodal capabilities to help you visualize new looks without a single snip! Upload a photo of yourself, describe the hairstyle you're dreaming of, and our AI will generate a detailed textual concept describing how that style would look on you. This tool doesn't produce an actual image, but rather a rich, descriptive paragraph that brings your imagined hairstyle to life through words. It's perfect for discussing ideas with your stylist, exploring new trends, or just having fun with virtual makeovers.
            </p>
            <p>
                From subtle changes like highlights to dramatic cuts and colors, the AI focuses on how the hairstyle would complement your facial features, skin tone, and overall appearance, providing a personalized textual preview.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">How it Works</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Image Upload:</strong> Provide a clear image of a person's face.</li>
                <li><strong>Hairstyle Prompt:</strong> Describe the desired haircut, color, length, or style (e.g., "short pixie cut with purple streaks," "long wavy blonde hair").</li>
                <li><strong>Textual Concept:</strong> Receive a detailed text description of how the hairstyle would appear on the person in the image.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">This tool generates text descriptions of hairstyles and does not produce actual image files.</p>
        </>
    );

    return (
        <ToolPageLayout
            title="AI Hairstyle Concept Generator"
            description="Generate textual concepts of people with different hairstyles and colors from an uploaded image using OpenRouter."
            longDescription={longDescription}
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-brand-text-secondary mb-1">
                        Upload an image (e.g., a selfie)
                    </label>
                    <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                    />
                    {imagePreviewUrl && (
                        <div className="mt-4 flex justify-center">
                            <img src={imagePreviewUrl} alt="Preview" className="max-w-full h-48 object-contain border border-brand-border rounded-md" />
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="hairstyle-prompt" className="block text-sm font-medium text-brand-text-secondary mb-1">
                        Describe the desired hairstyle (e.g., "a modern bob with highlights")
                    </label>
                    <textarea
                        id="hairstyle-prompt"
                        value={hairstylePrompt}
                        onChange={(e) => setHairstylePrompt(e.target.value)}
                        placeholder="e.g., Long, flowing, curly red hair with bangs."
                        rows={3}
                        className="w-full p-3 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>

                <button
                    onClick={generateHairstyleConcept}
                    disabled={isLoading || !imageFile || !hairstylePrompt.trim()}
                    className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg disabled:bg-gray-500"
                >
                    {isLoading ? <AiLoadingSpinner message="Generating concept..." /> : 'Generate Hairstyle Concept'}
                </button>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {conceptText && (
                    <div className="space-y-4 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-brand-primary">Generated Hairstyle Concept</h3>
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

export default HairstyleTryOn;