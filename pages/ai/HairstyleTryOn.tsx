import React, { useState } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';
import { fileToDataUrl } from '../../utils/imageUtils';
import { editImageWithGemini } from '../../utils/geminiApi';
import { useApiKey } from '../../context/ApiKeyContext';

const HairstyleTryOn: React.FC = () => {
    const [baseImageFile, setBaseImageFile] = useState<File | null>(null);
    const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('long curly brown hair');
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [preset, setPreset] = useState('');
    const { invalidateApiKey, apiKeySelected, isLoading: isApiKeyLoading } = useApiKey();

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
    
    const applyHairstyle = async () => {
        const finalPrompt = `Give this person ${preset || prompt}`;
        if (!baseImageFile) {
            setError('Please upload a photo.');
            return;
        }
        setIsLoading(true);
        setError('');
        setEditedImageUrl(null);
    
        try {
            const outputBase64 = await editImageWithGemini(finalPrompt, baseImageFile);
            setEditedImageUrl(`data:image/png;base64,${outputBase64}`);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || 'An error occurred while applying the hairstyle.';
            if (errorMessage.includes("Requested entity was not found.") || errorMessage.includes("API Key")) {
                setError("API Key not found or invalid. Please select a valid API key.");
                invalidateApiKey();
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const presetStyles = ['Short Pixie Cut', 'Modern Bob', 'Long Wavy Hair', 'Braided Updo', 'Spiky Blue Hair'];

    return (
        <ToolPageLayout
            title="AI Hairstyle Try-On"
            description="Upload a photo and try on different hairstyles with the Gemini API."
        >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <label className="block text-sm font-medium text-brand-text-secondary mb-1">1. Upload Your Photo</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"/>
                    
                    <label className="block text-sm font-medium text-brand-text-secondary mb-1">2. Describe a Hairstyle</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => { setPrompt(e.target.value); setPreset(''); }}
                        rows={2}
                        placeholder="e.g., long curly brown hair"
                        className="w-full p-2 bg-brand-bg border border-brand-border rounded-md"
                    />

                    <p className="text-sm text-center text-brand-text-secondary">or try a preset style:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {presetStyles.map(style => (
                            <button key={style} onClick={() => { setPreset(style); setPrompt(style); }} className={`px-3 py-1 text-sm rounded-full ${preset === style ? 'bg-brand-primary text-white' : 'bg-brand-surface hover:bg-brand-border'}`}>{style}</button>
                        ))}
                    </div>
                    
                    <button
                        onClick={applyHairstyle}
                        disabled={isLoading || !baseImageFile || isApiKeyLoading || !apiKeySelected}
                        className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <AiLoadingSpinner message="Generating style..." /> : 'Generate Style'}
                    </button>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </div>
                <div className="lg:col-span-3 bg-brand-bg p-4 rounded-lg min-h-[400px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        <div className="flex flex-col items-center justify-center border border-dashed border-brand-border rounded-md p-2">
                             {baseImageUrl ? <img src={baseImageUrl} alt="Original" className="max-w-full max-h-full object-contain rounded-md" /> : <p className="text-brand-text-secondary text-center">Your Photo</p>}
                        </div>
                        <div className="flex flex-col items-center justify-center border border-dashed border-brand-border rounded-md p-2">
                             {isLoading ? (
                                <AiLoadingSpinner message="Generating hairstyle..."/>
                             ) : editedImageUrl ? (
                                <div className="space-y-2 w-full text-center">
                                    <img src={editedImageUrl} alt="Edited" className="max-w-full max-h-full object-contain rounded-md" />
                                    <a href={editedImageUrl} download="hairstyle_try_on.png" className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                                        Download
                                    </a>
                                </div>
                             ) : <p className="text-brand-text-secondary text-center">Hairstyle Result</p>}
                        </div>
                    </div>
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default HairstyleTryOn;