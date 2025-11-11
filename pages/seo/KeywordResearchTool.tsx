import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';
import { runDeepSeekWithSchema } from '../../utils/deepseekApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';
import { Type } from '@google/genai';
import { useApiKey } from '../../context/ApiKeyContext';

interface KeywordInsight {
    keyword: string;
    searchIntent: string;
    difficulty: 'Easy' | 'Medium' | 'Difficult' | 'Very Difficult';
    searchVolume: string; // e.g., "1K-10K"
    cpc: string; // Cost Per Click, e.g., "$0.50 - $1.50"
    relatedQueries: string[];
}

const KeywordResearchTool: React.FC = () => {
    const [seedKeyword, setSeedKeyword] = useState('online tools');
    const [insights, setInsights] = useState<KeywordInsight[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { invalidateApiKey, apiKeySelected, isLoading: isApiKeyLoading } = useApiKey();

    const generateInsights = async () => {
        if (!seedKeyword.trim()) {
            setError('Please enter a seed keyword.');
            return;
        }

        setIsLoading(true);
        setError('');
        setInsights(null);

        try {
            const schema = {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING, description: "The keyword being analyzed." },
                  searchIntent: { type: Type.STRING, description: "Informational, Navigational, Commercial, or Transactional" },
                  difficulty: { type: Type.STRING, description: "Easy, Medium, Difficult, or Very Difficult" },
                  searchVolume: { type: Type.STRING, description: "Estimated monthly search volume range, e.g., 1K-10K" },
                  cpc: { type: Type.STRING, description: "Estimated Cost Per Click range, e.g., $0.50 - $1.50" },
                  relatedQueries: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of related long-tail keywords." },
                },
                required: ['keyword', 'searchIntent', 'difficulty', 'searchVolume', 'cpc', 'relatedQueries']
              }
            };
            
            const prompt = `You are an expert SEO keyword research assistant. Provide detailed insights for the seed keyword "${seedKeyword}". Include search intent, estimated difficulty, search volume, Cost Per Click (CPC) range, and related long-tail queries. Provide insights for the seed keyword and 2-3 highly relevant related queries. For search volume and CPC, use ranges as specific numbers are hard to predict.`;

            const jsonString = await runDeepSeekWithSchema('deepseek-chat', prompt, schema);
            const parsedInsights: KeywordInsight[] = JSON.parse(jsonString);
            setInsights(parsedInsights);

        } catch (err: any) {
            console.error('AI Keyword Research Error:', err);
            const errorMessage = err.message || 'An AI error occurred during keyword research.';
            setError(`An error occurred. Please ensure you have selected the correct DeepSeek API key. Error: ${errorMessage}`);
            invalidateApiKey();
        } finally {
            setIsLoading(false);
        }
    };
    
    const longDescription = (
        <>
            <p>
                Our AI Keyword Research Tool, powered by the DeepSeek API, provides you with crucial insights to enhance your SEO strategy. Instead of relying on expensive tools, you can get AI-driven conceptual analysis for search intent, estimated difficulty, search volume ranges, and potential Cost Per Click (CPC) for any seed keyword. This tool is designed to give marketers, content creators, and SEO specialists a quick overview of keyword potential and discover relevant long-tail queries.
            </p>
            <p>
                Simply input your primary keyword, and our AI will generate structured data that helps you understand market demand and competition. This facilitates more informed decisions for content creation and paid advertising campaigns.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key AI-Driven Insights</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Search Intent:</strong> Understand whether users are looking for information, navigation, commercial products, or transactions.</li>
                <li><strong>Difficulty & Volume:</strong> Get conceptual estimations of how hard it might be to rank for a keyword and its potential search popularity.</li>
                <li><strong>CPC Estimates:</strong> Receive approximate Cost Per Click ranges for potential paid campaigns.</li>
                <li><strong>Related Queries:</strong> Discover additional relevant keywords and long-tail variations to broaden your content strategy.</li>
            </ul>
        </>
    );

    return (
        <ToolPageLayout
            title="AI Keyword Research Tool"
            description="Get AI-driven insights including search intent, difficulty, volume, and CPC via the DeepSeek API."
            longDescription={longDescription}
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <label htmlFor="seed-keyword" className="block text-sm font-medium text-brand-text-secondary mb-1">
                        Enter a seed keyword (e.g., "online tools")
                    </label>
                    <input
                        type="text"
                        id="seed-keyword"
                        value={seedKeyword}
                        onChange={(e) => setSeedKeyword(e.target.value)}
                        placeholder="e.g., 'best coffee maker'"
                        className="w-full p-3 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>

                <button
                    onClick={generateInsights}
                    disabled={isLoading || !seedKeyword.trim() || isApiKeyLoading || !apiKeySelected}
                    className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg disabled:bg-gray-500"
                >
                    {isLoading ? <AiLoadingSpinner message="Generating insights..." /> : 'Generate Keyword Insights'}
                </button>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {insights && (
                    <div className="space-y-4 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-brand-primary">Keyword Insights</h3>
                        <div className="overflow-x-auto bg-brand-bg rounded-lg border border-brand-border">
                            <table className="w-full text-left table-auto">
                                <thead className="bg-brand-surface text-sm text-brand-text-secondary">
                                    <tr>
                                        <th className="p-3 whitespace-nowrap">Keyword</th>
                                        <th className="p-3 whitespace-nowrap">Intent</th>
                                        <th className="p-3 whitespace-nowrap">Difficulty</th>
                                        <th className="p-3 whitespace-nowrap">Volume</th>
                                        <th className="p-3 whitespace-nowrap">CPC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {insights.map((item, index) => (
                                        <React.Fragment key={index}>
                                            <tr className="border-t border-brand-border">
                                                <td className="p-3 font-semibold">{item.keyword}</td>
                                                <td className="p-3">{item.searchIntent}</td>
                                                <td className="p-3">{item.difficulty}</td>
                                                <td className="p-3">{item.searchVolume}</td>
                                                <td className="p-3">{item.cpc}</td>
                                            </tr>
                                            {item.relatedQueries && item.relatedQueries.length > 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-3 pt-1 text-sm text-brand-text-secondary bg-brand-surface/50">
                                                        <strong>Related:</strong> {item.relatedQueries.join(', ')}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end">
                            <CopyButton textToCopy={JSON.stringify(insights, null, 2)} />
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
};

export default KeywordResearchTool;
