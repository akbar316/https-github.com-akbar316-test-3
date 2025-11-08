import React, { useState, useCallback } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';
import { callOpenRouterApi, fileToImageUrlContent } from '../../utils/openRouterApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner'; // Import shared spinner

const HairstyleTryOn: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [hairstylePrompt, setHairstylePrompt] = useState('a short bob, blonde color');
    const [generatedConcept, setGeneratedConcept] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const handleImageUpload = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError("Image file is too large. Please upload an image smaller than 5MB.");
                return;
            }
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
            setGeneratedConcept(null);
            setError(null);
        } else {
            setError("Please upload a valid image file (JPG, PNG, GIF).");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    }, []);

    const handleDragEvents = (isEntering: boolean) => (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isEntering);
    };

    const handleGenerate = async () => {
        if (!imageFile) {
            setError('Please upload an image first.');
            return;
        }
        if (!hairstylePrompt.trim()) {
            setError('Please enter a hairstyle description.');
            return;
        }

        setLoading(true);
        setError('');
        setGeneratedConcept(null);

        try {
            const imageContentPart = await fileToImageUrlContent(imageFile);

            const openRouterPrompt = `Act as an advanced AI stylist. Analyze the provided image of a person and the user's requested hairstyle/color. Generate a detailed textual concept describing how the person would look with the new style. Focus on details like hair length, cut, texture, color, and how it frames the face. Do NOT generate actual image data, only the textual description.

User's requested hairstyle/color: "${hairstylePrompt}"

Provide a detailed, vivid description (approximately 100-150 words) of the new look, as if an image AI were to render it.`;

            const response = await callOpenRouterApi({
                model: 'google/gemini-pro-1.5', // Using Gemini Pro on OpenRouter for multimodal text generation
                messages: [{
                    role: 'user',
                    content: [
                        imageContentPart,
                        { type: 'text', text: openRouterPrompt }
                    ]
                }],
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
                setError('No hairstyle concept could be generated. Please try a different prompt or image.');
            }

        } catch (e: any) {
            console.error(e);
            setError(`An AI error occurred: ${e.message || 'Failed to generate hairstyle concept.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout
            title="AI Hairstyle Concept Generator"
            description="Generate textual concepts of people with different hairstyles and colors from an uploaded image using OpenRouter."
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xl font-semibold text-brand-text-primary">1. Upload Image & Describe Hairstyle</h3>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragEvents(true)}
                        onDragEnter={handleDragEvents(true)}
                        onDragLeave={handleDragEvents(false)}
                        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors min-h-[15rem] flex flex-col justify-center items-center ${isDragging ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border'}`}
                    >
                        {imageUrl ? (
                            <div className="text-center">
                                <img src={imageUrl} alt="Uploaded for Hairstyle" className="max-h-48 max-w-full object-contain rounded-md mb-2 mx-auto" />
                                <p className="font-semibold text-brand-text-primary truncate max-w-xs">{imageFile?.name}</p>
                            </div>
                        ) : (
                            <div className="text-center text-brand-text-secondary">
                                <p>Drag & drop your photo here</p>
                                <p className="my-2">(Max 5MB, JPG/PNG)</p>
                                <label className="cursor-pointer font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover px-5 py-2 rounded-md transition-colors">
                                    Browse Files
                                    <input type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        )}
                        {imageFile && (
                            <button onClick={() => { setImageFile(null); setImageUrl(null); setGeneratedConcept(null); setError(null); }} className="text-sm text-red-500 mt-2">Remove Image</button>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Desired Hairstyle / Color</label>
                        <input
                            type="text"
                            value={hairstylePrompt}
                            onChange={(e) => setHairstylePrompt(e.target.value)}
                            placeholder="e.g., short pixie cut, dark brown; long wavy hair, platinum blonde"
                            className="w-full p-3 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            disabled={loading}
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !imageFile || !hairstylePrompt.trim()}
                        className="w-full bg-brand-primary text-white px-6 py-3 rounded-md hover:bg-brand-primary-hover transition-colors disabled:bg-gray-600 font-semibold text-lg"
                    >
                        {loading ? <AiLoadingSpinner message="Generating concept..." /> : 'Generate Hairstyle Concept'}
                    </button>
                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                </div>

                <div className="md:col-span-1 space-y-4">
                    <h3 className="font-semibold text-brand-text-primary">2. Generated Hairstyle Concept (Text)</h3>
                    <div className="relative bg-brand-bg p-4 rounded-md min-h-[15rem] flex flex-col justify-between">
                        {loading && !generatedConcept ? (
                            <div className="flex-grow flex items-center justify-center">
                                <AiLoadingSpinner message="Generating concept..." />
                            </div>
                        ) : generatedConcept ? (
                            <p className="text-brand-text-secondary whitespace-pre-wrap">{generatedConcept}</p>
                        ) : (
                            <p className="text-brand-text-secondary opacity-70 italic text-center m-auto">Your AI-generated hairstyle concept will appear here after processing.</p>
                        )}
                        {generatedConcept && (
                            <div className="flex justify-end mt-4">
                                <CopyButton textToCopy={generatedConcept} />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-brand-text-secondary text-center">
                        Note: This tool generates a detailed textual description of a hairstyle concept using AI, not an actual visual image.
                        You can use this description as a prompt for external image generation services.
                    </p>
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default HairstyleTryOn;