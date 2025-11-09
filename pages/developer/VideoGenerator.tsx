import React, { useState, useEffect, useRef } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';
import { GoogleGenAI } from '@google/genai';

const loadingMessages = [
    "Warming up the digital director's chair...",
    "Casting pixels for their big role...",
    "Storyboarding the digital narrative...",
    "Rendering the first few frames...",
    "This can take a few minutes, good things come to those who wait!",
    "Polishing the final cut...",
    "Finalizing the digital masterpiece...",
];

const VideoGenerator: React.FC = () => {
    const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);
    const [prompt, setPrompt] = useState('A neon hologram of a cat driving at top speed');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState('');
    
    const loadingMessageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Check for API key on mount
    useEffect(() => {
        const checkApiKey = async () => {
            // @ts-ignore
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        };
        checkApiKey();
    }, []);

    // Cleanup object URLs
    useEffect(() => {
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [videoUrl]);

    const handleSelectKey = async () => {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setApiKeySelected(true); // Assume success to avoid race conditions
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeImage = () => {
        setImageFile(null);
        setImageUrl(null);
    };

    const startLoadingMessages = () => {
        setLoadingMessage(loadingMessages[0]);
        let i = 1;
        loadingMessageIntervalRef.current = setInterval(() => {
            setLoadingMessage(loadingMessages[i % loadingMessages.length]);
            i++;
        }, 8000);
    };

    const stopLoadingMessages = () => {
        if (loadingMessageIntervalRef.current) {
            clearInterval(loadingMessageIntervalRef.current);
        }
    };

    const generateVideo = async () => {
        if (!prompt.trim() && !imageFile) {
            setError('Please provide a text prompt or an image.');
            return;
        }

        setIsLoading(true);
        setError('');
        setVideoUrl(null);
        startLoadingMessages();

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const payload: any = {
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: resolution,
                    aspectRatio: aspectRatio,
                }
            };
            
            if (imageFile) {
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(imageFile);
                });
                
                payload.image = {
                    imageBytes: base64Data,
                    mimeType: imageFile.type,
                };
            }
            
            let operation = await ai.models.generateVideos(payload);

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
                throw new Error('Video generation completed, but no video URI was returned.');
            }
            
            setLoadingMessage('Downloading video...');
            const downloadLink = operation.response.generatedVideos[0].video.uri;
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) {
                throw new Error(`Failed to download video: ${videoResponse.statusText}`);
            }
            const videoBlob = await videoResponse.blob();
            const url = URL.createObjectURL(videoBlob);
            setVideoUrl(url);

        } catch (err: any) {
            console.error(err);
            let errorMessage = err.message || 'An unknown error occurred during video generation.';
            if (errorMessage.includes("Requested entity was not found.")) {
                errorMessage = "API Key not found or invalid. Please select a valid API key.";
                setApiKeySelected(false);
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            stopLoadingMessages();
        }
    };

    const longDescription = (
        <>
            <p>
                Bring your ideas to life with our AI Video Generator, powered by Google's state-of-the-art Veo model. This tool allows you to create high-quality, short-form videos from simple text prompts or a starting image. Describe a scene, a character, or an action, and watch as the AI interprets your vision and renders it into a dynamic video. You can also upload an image to guide the generation process, creating an animation that starts from your provided picture.
            </p>
            <p>
                Customize your output by choosing the resolution and aspect ratio, making it perfect for social media, presentations, or creative projects. The video generation process can take a few minutes, as the AI works to create a unique and detailed result. Please be patient while the magic happens.
            </p>
            <p className="text-sm text-brand-text-secondary mt-4">
                This feature requires you to select a Google Cloud API key with the Vertex AI API enabled. For information on billing, please see the official <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Google AI billing documentation</a>.
            </p>
        </>
    );
    
    if (apiKeySelected === null) {
        return (
             <ToolPageLayout title="AI Video Generator" description="Generate high-quality videos from text prompts or images using AI." longDescription={longDescription}>
                <div className="flex justify-center items-center h-40">
                    <AiLoadingSpinner message="Checking API Key..." />
                </div>
             </ToolPageLayout>
        );
    }

    if (!apiKeySelected) {
        return (
             <ToolPageLayout title="AI Video Generator" description="Generate high-quality videos from text prompts or images using AI." longDescription={longDescription}>
                <div className="text-center bg-brand-bg p-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-brand-primary mb-4">API Key Required</h2>
                    <p className="text-brand-text-secondary mb-6">
                        This advanced tool uses the Veo video generation model, which requires a Google Cloud API key with the Vertex AI API enabled. Please select your key to continue.
                    </p>
                    <button onClick={handleSelectKey} className="bg-brand-primary text-white px-6 py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg">
                        Select API Key
                    </button>
                    <p className="text-xs text-brand-text-secondary mt-4">
                         For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">billing documentation</a>.
                    </p>
                </div>
             </ToolPageLayout>
        );
    }
    
    return (
        <ToolPageLayout
            title="AI Video Generator"
            description="Generate high-quality videos from text prompts or images using AI."
            longDescription={longDescription}
        >
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            placeholder="Describe the video you want to create..."
                            className="w-full p-2 bg-brand-bg border border-brand-border rounded-md"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Starting Image (Optional)</label>
                        {imageUrl ? (
                             <div className="relative">
                                <img src={imageUrl} alt="Preview" className="w-full rounded-md"/>
                                <button onClick={removeImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1">&times;</button>
                            </div>
                        ) : (
                             <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"/>
                        )}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-brand-text-secondary">Resolution</label>
                            <select value={resolution} onChange={e => setResolution(e.target.value as any)} className="w-full p-2 mt-1 bg-brand-bg border border-brand-border rounded-md">
                                <option value="720p">720p</option>
                                <option value="1080p">1080p</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-brand-text-secondary">Aspect Ratio</label>
                            <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} className="w-full p-2 mt-1 bg-brand-bg border border-brand-border rounded-md">
                                <option value="16:9">16:9 (Landscape)</option>
                                <option value="9:16">9:16 (Portrait)</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={generateVideo}
                        disabled={isLoading}
                        className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg disabled:bg-gray-500"
                    >
                        {isLoading ? <AiLoadingSpinner message="Generating..." /> : 'Generate Video'}
                    </button>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </div>
                <div className="lg:col-span-3 bg-brand-bg p-4 rounded-lg flex items-center justify-center min-h-[300px] lg:min-h-full">
                    {isLoading ? (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
                            <p className="mt-4 text-brand-text-secondary">{loadingMessage}</p>
                        </div>
                    ) : videoUrl ? (
                        <div className="space-y-4 w-full">
                            <video src={videoUrl} controls autoPlay loop className="max-w-full rounded-md" />
                            <a href={videoUrl} download="dicetools_video.mp4" className="block w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center">
                                Download Video
                            </a>
                        </div>
                    ) : (
                        <p className="text-brand-text-secondary">Your video will appear here.</p>
                    )}
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default VideoGenerator;
