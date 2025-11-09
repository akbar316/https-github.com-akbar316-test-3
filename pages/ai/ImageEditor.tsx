import React, { useState, useCallback } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';
import { fileToDataUrl } from '../../utils/imageUtils';
import { editImageWithGemini } from '../../utils/openRouterApi';

const ImageEditor: React.FC = () => {
    const [baseImageFile, setBaseImageFile] = useState<File | null>(null);
    const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('make the sky look like a sunset');
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBaseImageFile(file);
            setEditedImageUrl(null);
            setError('');
            try {
                const url = await fileToDataUrl(file);
                setBaseImageUrl(url);
            } catch (err) {
                setError('Could not preview image.');
                setBaseImageUrl(null);
            }
        }
    };

    const editImage = async () => {
        if (!baseImageFile || !prompt.trim()) {
            setError('Please upload an image and provide an edit instruction.');
            return;
        }
        setIsLoading(true);
        setError('');
        setEditedImageUrl(null);
    
        try {
            const outputBase64 = await editImageWithGemini(prompt, baseImageFile);
            setEditedImageUrl(`data:image/png;base64,${outputBase64}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred while editing the image.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <ToolPageLayout
            title="AI Image Editor"
            description="Edit your images with simple text instructions using the Gemini API."
        >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <label className="block text-sm font-medium text-brand-text-secondary mb-1">1. Upload Image</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"/>
                    
                    <label className="block text-sm font-medium text-brand-text-secondary mb-1">2. Describe Your Edit</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        placeholder="e.g., make the sky look like a sunset"
                        className="w-full p-2 bg-brand-bg border border-brand-border rounded-md"
                    />
                    
                    <button
                        onClick={editImage}
                        disabled={isLoading || !baseImageFile}
                        className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg disabled:bg-gray-500"
                    >
                        {isLoading ? <AiLoadingSpinner message="Applying edit..." /> : 'Apply Edit with AI'}
                    </button>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </div>
                <div className="lg:col-span-3 bg-brand-bg p-4 rounded-lg min-h-[400px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        <div className="flex flex-col items-center justify-center border border-dashed border-brand-border rounded-md p-2">
                             {baseImageUrl ? <img src={baseImageUrl} alt="Original" className="max-w-full max-h-full object-contain rounded-md" /> : <p className="text-brand-text-secondary text-center">Original Image</p>}
                        </div>
                        <div className="flex flex-col items-center justify-center border border-dashed border-brand-border rounded-md p-2">
                             {isLoading ? (
                                <AiLoadingSpinner message="Generating image..."/>
                             ) : editedImageUrl ? (
                                <div className="space-y-2 w-full text-center">
                                    <img src={editedImageUrl} alt="Edited" className="max-w-full max-h-full object-contain rounded-md" />
                                    <a href={editedImageUrl} download="edited_image.png" className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                                        Download
                                    </a>
                                </div>
                             ) : <p className="text-brand-text-secondary text-center">Edited Image</p>}
                        </div>
                    </div>
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default ImageEditor;
