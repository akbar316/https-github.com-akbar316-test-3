import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';
import { runGeminiWithSchema } from '../../utils/geminiApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';
import { Type } from '@google/genai';
import { useApiKey } from '../../context/ApiKeyContext';

interface SerpOptimization {
    title: string;
    description: string;
    focusKeyword: string;
    aiRecommendations: string[];
    conceptualClickThroughRate: string; // e.g., "Good (5-8%)"
}

const SerpPreview: React.FC<{ title: string; description: string; url: string }> = ({ title, description, url }) => (
    <div className="p-4 bg-white dark:bg-brand-bg rounded-lg border border-brand-border font-sans">
        <p className="text-sm text-gray-700 dark:text-brand-text-secondary truncate">{url || 'https://www.example.com'}</p>
        <h3 className="text-blue-600 dark:text-blue-500 text-xl truncate hover:underline">{title || 'Meta Title Appears Here'}</h3>
        <p className="text-sm text-gray-600 dark:text-brand-text-secondary">{description || 'This is where your meta description will be shown. Keep it concise and compelling to attract clicks from search results.'}</p>
    </div>
);

const GoogleSerpPreviewTool: React.FC = () => {
    const [title, setTitle] = useState('DiceTools - Free Online Tools');
    const [description, setDescription] = useState('A powerful suite of 80+ free online tools for text manipulation, data conversion, development, AI, PDF editing, and more.');
    const [url, setUrl] = useState('https://dicetools.com');
    const [focusKeyword, setFocusKeyword] = useState('free online tools');
    const [optimization, setOptimization] = useState<SerpOptimization | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { invalidateApiKey } = useApiKey();

    const generateRecommendations = async () => {
        if (!title.trim() || !description.trim() || !focusKeyword.trim()) {
            setError('Please fill in the Title, Description, and Focus Keyword fields.');
            return;
        }

        setIsLoading(true);
        setError('');
        setOptimization(null);

        try {
            const schema = {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "An optimized title suggestion." },
                    description: { type: Type.STRING, description: "An optimized description suggestion." },
                    focusKeyword: { type: Type.STRING, description: "The original focus keyword provided." },
                    aiRecommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of actionable recommendations." },
                    conceptualClickThroughRate: { type: Type.STRING, description: "A conceptual CTR estimate, e.g., Good (5-8%)" },
                },
                required: ["title", "description", "focusKeyword", "aiRecommendations", "conceptualClickThroughRate"]
            };

            const prompt = `You are an AI SEO expert specializing in Google SERP snippet optimization. Analyze the provided title, description, and focus keyword for a webpage. Provide an optimized title, an optimized description, actionable recommendations to improve click-through rate (CTR) and relevance, and give a conceptual estimate of the CTR.
            
            Analyze this snippet:
            Title: "${title}"
            Description: "${description}"
            URL: "${url}"
            Focus Keyword: "${focusKeyword}"`;
            
            const jsonString = await runGeminiWithSchema('gemini-2.5-flash', prompt, schema);
            const parsedOptimization: SerpOptimization = JSON.parse(jsonString);
            setOptimization(parsedOptimization);

        } catch (err: any) {
            console.error('AI SERP Optimization Error:', err);
            const errorMessage = err.message || 'An AI error occurred during SERP optimization.';
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
    
    const longDescription = (
        <>
            <p>
                Our AI Google SERP Preview & Optimizer, powered by the Gemini API, helps you craft compelling search engine result page (SERP) snippets. This tool allows you to visualize how your website's title, description, and URL will appear in Google search results, providing a real-time preview. Beyond just visualization, it leverages advanced AI to analyze your snippet against a focus keyword and generate actionable recommendations for improvement. This helps you optimize for higher click-through rates (CTR) and better visibility.
            </p>
            <p>
                Input your current meta title, description, and target keyword, and the AI will suggest enhancements, ensuring your snippet is enticing and relevant to searchers. This is an indispensable tool for SEO specialists, content marketers, and webmasters aiming to stand out in competitive search results.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key AI-Driven Insights</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Live SERP Preview:</strong> Instantly see how your title, description, and URL will appear on Google.</li>
                <li><strong>AI Recommendations:</strong> Get intelligent suggestions to improve your snippet for better CTR and keyword relevance.</li>
                <li><strong>Conceptual CTR Estimate:</strong> Receive an AI-driven conceptual estimate of your snippet's potential click-through rate.</li>
            </ul>
        </>
    );

    return (
        <ToolPageLayout
            title="AI Google SERP Preview & Optimizer"
            description="Preview your SERP snippet and get AI-powered recommendations to improve it via Gemini."
            longDescription={longDescription}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <label className="flex justify-between text-sm font-medium text-brand-text-secondary mb-1">
                            <span>Title</span>
                            <span className={title.length > 60 ? 'text-red-500' : ''}>{title.length} / 60</span>
                        </label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-brand-bg border border-brand-border rounded-md" />
                    </div>
                    <div>
                        <label className="flex justify-between text-sm font-medium text-brand-text-secondary mb-1">
                            <span>Description</span>
                            <span className={description.length > 160 ? 'text-red-500' : ''}>{description.length} / 160</span>
                        </label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full p-2 bg-brand-bg border border-brand-border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">URL</label>
                        <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full p-2 bg-brand-bg border border-brand-border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Focus Keyword</label>
                        <input type="text" value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)} className="w-full p-2 bg-brand-bg border border-brand-border rounded-md" />
                    </div>
                    <button
                        onClick={generateRecommendations}
                        disabled={isLoading || !title.trim() || !description.trim() || !focusKeyword.trim()}
                        className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg disabled:bg-gray-500"
                    >
                        {isLoading ? <AiLoadingSpinner message="Optimizing snippet..." /> : 'Get AI Recommendations'}
                    </button>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </div>
                <div className="space-y-4">
                    <h3 className="font-semibold text-brand-text-primary">Live SERP Preview</h3>
                    <SerpPreview title={title} description={description} url={url} />

                    {optimization && (
                        <div className="space-y-4 animate-fade-in-up">
                            <h3 className="font-semibold text-brand-text-primary mt-4">AI Optimization Results</h3>
                            <div className="bg-brand-bg p-4 rounded-md border border-brand-border space-y-3">
                                <div>
                                    <p className="text-sm text-brand-text-secondary">Optimized Title:</p>
                                    <p className="font-semibold text-brand-text-primary">{optimization.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-brand-text-secondary">Optimized Description:</p>
                                    <p className="font-semibold text-brand-text-primary">{optimization.description}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-brand-text-secondary">Conceptual CTR:</p>
                                    <p className="font-semibold text-brand-text-primary">{optimization.conceptualClickThroughRate}</p>
                                </div>
                                {optimization.aiRecommendations.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-brand-text-primary mt-2 mb-1">Recommendations:</h4>
                                        <ul className="list-disc list-inside text-brand-text-secondary">
                                            {optimization.aiRecommendations.map((item, index) => <li key={index}>{item}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <CopyButton textToCopy={JSON.stringify(optimization, null, 2)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default GoogleSerpPreviewTool;