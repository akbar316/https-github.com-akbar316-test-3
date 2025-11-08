import React, { useState } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';
import { callOpenRouterApi } from '../../utils/openRouterApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';

interface AnalysisItem {
    factor: string;
    status: 'Good' | 'Needs Improvement' | 'Missing';
    recommendation: string;
}

interface SerpAnalysisResult {
    optimizedTitle: string;
    optimizedDescription: string;
    analysis: AnalysisItem[];
}

const SerpPreview: React.FC<{ title: string; description: string; url: string }> = ({ title, description, url }) => (
    <div className="p-4 bg-white dark:bg-brand-bg rounded-lg border border-brand-border font-sans">
        <p className="text-sm text-gray-700 dark:text-brand-text-secondary truncate">{url || 'https://www.example.com/page-path'}</p>
        <h3 className="text-blue-600 dark:text-blue-500 text-xl truncate hover:underline cursor-pointer">{title || 'Your SEO Title Will Appear Here'}</h3>
        <p className="text-sm text-gray-600 dark:text-brand-text-secondary">{description || 'This is how your meta description will look in the Google search results. Make it count!'}</p>
    </div>
);

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
    if (status === 'Good') return <span className="text-green-500">✔</span>;
    if (status === 'Needs Improvement') return <span className="text-yellow-500">!</span>;
    if (status === 'Missing') return <span className="text-red-500">✖</span>;
    return null;
};


const GoogleSerpPreviewTool: React.FC = () => {
    const [title, setTitle] = useState('DiceTools | The Best Free Online Tools');
    const [description, setDescription] = useState('A powerful suite of 80+ free online tools for text manipulation, data conversion, development, AI, PDF editing, and more.');
    const [url, setUrl] = useState('https://dicetools.com');
    const [focusKeyword, setFocusKeyword] = useState('free online tools'); // Corrected line here
    
    const [analysisResult, setAnalysisResult] = useState<SerpAnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleOptimize = async () => {
        if (!title.trim() || !description.trim() || !url.trim() || !focusKeyword.trim()) {
            setError('All fields (Title, Description, URL, Focus Keyword) are required.');
            return;
        }

        setLoading(true);
        setError('');
        setAnalysisResult(null);

        try {
            const prompt = `Act as an expert SEO copywriter and strategist for Google SERP snippets.
            I need to optimize a SERP snippet for the following details:
            - Current Title: "${title}"
            - Current Description: "${description}"
            - Target URL: "${url}"
            - Focus Keyword: "${focusKeyword}"

            Your task is to:
            1.  Provide an 'optimizedTitle' (max 60 characters) and 'optimizedDescription' (max 160 characters) that are more compelling and SEO-friendly, targeting the focus keyword.
            2.  Generate an 'analysis' array, evaluating the 'Current Title', 'Current Description', and 'Focus Keyword Usage'.
                For each item in the analysis, include:
                - 'factor': The aspect being evaluated (e.g., 'Current Title Length').
                - 'status': 'Good', 'Needs Improvement', or 'Missing'.
                - 'recommendation': A detailed, actionable recommendation to improve this factor, considering character limits and keyword optimization.

            The output MUST be a JSON object with 'optimizedTitle', 'optimizedDescription', and 'analysis' as top-level keys.`;

            const response = await callOpenRouterApi({
                model: 'google/gemini-pro-1.5', // OpenRouter model for complex tasks
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            });

            const resultString = Array.isArray(response.choices?.[0]?.message?.content)
                ? response.choices[0].message.content.filter(part => part.type === 'text').map(part => (part as {type: 'text', text: string}).text).join('')
                : response.choices?.[0]?.message?.content || '';

            if (resultString) {
                try {
                    const parsedResult: SerpAnalysisResult = JSON.parse(resultString);
                    setAnalysisResult(parsedResult);
                } catch (parseError) {
                    console.error("Failed to parse AI response as JSON:", resultString, parseError);
                    setError("The AI returned a response in an unexpected format. Please try again.");
                }
            } else {
                setError("No analysis results were returned by the AI.");
            }

        } catch (e: any) {
            console.error(e);
            setError(`An AI error occurred: ${e.message || 'Failed to generate SERP optimization.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout
            title="AI Google SERP Preview & Optimizer"
            description="Preview your SERP snippet and get AI-powered recommendations to improve it."
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-brand-text-primary mb-2">Your Current Snippet</h3>
                        <div>
                            <label className="flex justify-between text-sm font-medium text-brand-text-secondary mb-1">
                                <span>Title</span>
                                <span className={title.length > 60 ? 'text-red-500' : ''}>{title.length} / 60</span>
                            </label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-brand-bg border border-brand-border rounded-md" disabled={loading} />
                        </div>
                        <div>
                            <label className="flex justify-between text-sm font-medium text-brand-text-secondary mb-1">
                                <span>Description</span>
                                <span className={description.length > 160 ? 'text-red-500' : ''}>{description.length} / 160</span>
                            </label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full p-2 bg-brand-bg border border-brand-border rounded-md" disabled={loading} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text-secondary mb-1">URL</label>
                            <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full p-2 bg-brand-bg border border-brand-border rounded-md" disabled={loading} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text-secondary mb-1">Focus Keyword</label>
                            <input type="text" value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)} placeholder="e.g., free online tools" className="w-full p-2 bg-brand-bg border border-brand-border rounded-md" disabled={loading} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-brand-text-primary mb-2">Google SERP Preview</h3>
                        <SerpPreview title={analysisResult?.optimizedTitle || title} description={analysisResult?.optimizedDescription || description} url={url} />
                         <div className="text-sm text-brand-text-secondary p-4 bg-brand-bg rounded-lg">
                            <p>This preview is a simulation. Actual display may vary slightly based on Google's algorithms and user queries.</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleOptimize}
                    disabled={loading}
                    className="w-full bg-brand-primary text-white px-8 py-3 rounded-md hover:bg-brand-primary-hover transition-colors disabled:bg-gray-500 font-semibold"
                >
                    {loading ? <AiLoadingSpinner message="Optimizing SERP snippet..." /> : 'Get AI Optimization'}
                </button>
                {error && <p className="text-red-500 text-center">{error}</p>}

                {analysisResult && (
                    <div className="animate-fade-in-up space-y-4 pt-6 border-t border-brand-border">
                        <h3 className="text-xl font-semibold text-brand-text-primary">AI Optimization & Recommendations</h3>
                        {analysisResult.analysis.map((item, index) => (
                            <div key={index} className="bg-brand-bg p-4 rounded-lg">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <StatusIcon status={item.status} />
                                    <span>{item.factor}</span>
                                    <span className="ml-auto text-xs px-2 py-1 rounded-full bg-brand-surface">{item.status}</span>
                                </h4>
                                <p className="text-sm text-brand-text-secondary mt-1 pl-6 whitespace-pre-wrap">{item.recommendation}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
};

export default GoogleSerpPreviewTool;