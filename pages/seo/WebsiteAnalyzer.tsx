import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';
import { callOpenRouterApi, OpenRouterMessage } from '../../utils/openRouterApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';

interface SeoReport {
    domain: string;
    seoScore: string; // e.g., "75/100 (Good)"
    summary: string;
    keyFindings: string[];
    recommendations: string[];
}

const WebsiteAnalyzer: React.FC = () => {
    const [domain, setDomain] = useState('dicetools.com');
    const [report, setReport] = useState<SeoReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const runAnalysis = async () => {
        if (!domain.trim()) {
            setError('Please enter a domain to analyze.');
            return;
        }

        setIsLoading(true);
        setError('');
        setReport(null);

        try {
            const messages: OpenRouterMessage[] = [
                {
                    role: 'system',
                    content: `You are an expert SEO website analysis assistant. Your task is to provide a conceptual SEO analysis for a given website domain. Generate an SEO score (e.g., "75/100 (Good)"), a brief summary of its conceptual SEO health, key findings (e.g., areas of strength or weakness), and actionable recommendations. Respond in a JSON object format. The structure should be:
{
  "domain": "example.com",
  "seoScore": "e.g., 75/100 (Good)",
  "summary": "A brief overview of the conceptual SEO performance.",
  "keyFindings": ["finding 1", "finding 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}
Remember this is a conceptual analysis based on general SEO knowledge, not real-time data.`,
                },
                {
                    role: 'user',
                    content: `Perform a conceptual SEO analysis for the website: "${domain}"`,
                },
            ];

            const response = await callOpenRouterApi({
                model: 'google/gemini-1.5-flash', // Changed model to google/gemini-1.5-flash
                messages: messages,
                temperature: 0.7,
                max_tokens: 1200,
                response_format: { type: "json_object" },
            });

            // FIX: Add type assertion to `string` because `response_format: { type: "json_object" }` guarantees a JSON string output.
            const jsonString = (response.choices?.[0]?.message?.content as string) || '';
            const parsedReport: SeoReport = JSON.parse(jsonString);
            setReport(parsedReport);

        } catch (err: any) {
            console.error('AI Website Analyzer Error:', err);
            setError(err.message || 'An AI error occurred during website analysis. Please try again or with a different domain.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const longDescription = (
        <>
            <p>
                Our AI Website SEO Analyzer, powered by OpenRouter, provides a conceptual SEO audit and optimization report for any website domain. This tool utilizes advanced AI to synthesize general SEO best practices and offer insights into a website's conceptual performance across various parameters like technical SEO, content quality, and user experience signals. It's an excellent resource for getting an AI-driven overview and actionable recommendations without requiring real-time crawling or extensive data collection.
            </p>
            <p>
                Input a domain, and the AI will generate a structured report that includes a conceptual SEO score, key findings highlighting areas of strength and weakness, and specific recommendations for improvement. This helps digital marketers and website owners to prioritize their SEO efforts more effectively.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Conceptual Insights</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>SEO Score:</strong> A conceptual rating of the website's overall SEO health.</li>
                <li><strong>Summary:</strong> A brief overview of the conceptual SEO performance.</li>
                <li><strong>Key Findings:</strong> AI-driven identification of conceptual strengths and weaknesses.</li>
                <li><strong>Recommendations:</strong> Actionable suggestions for improving the website's SEO.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">
                This tool provides a conceptual analysis based on AI's general SEO knowledge and does not perform live website crawling or real-time data fetching.
            </p>
        </>
    );

    return (
        <ToolPageLayout
            title="AI Website SEO Analyzer"
            description="Get an AI-powered SEO score and optimization report for your website (conceptual analysis via OpenRouter)."
            longDescription={longDescription}
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <label htmlFor="domain-input" className="block text-sm font-medium text-brand-text-secondary mb-1">
                        Enter Website Domain (e.g., "dicetools.com")
                    </label>
                    <input
                        type="text"
                        id="domain-input"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="e.g., 'wikipedia.org'"
                        className="w-full p-3 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>

                <button
                    onClick={runAnalysis}
                    disabled={isLoading || !domain.trim()}
                    className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg disabled:bg-gray-500"
                >
                    {isLoading ? <AiLoadingSpinner message="Analyzing website..." /> : 'Analyze Website SEO with AI'}
                </button>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {report && (
                    <div className="space-y-4 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-brand-primary mb-2">SEO Report for {report.domain}</h3>
                        <div className="bg-brand-bg p-4 rounded-md border border-brand-border space-y-3">
                            <div className="text-center mb-4">
                                <p className="text-sm text-brand-text-secondary">Overall SEO Score</p>
                                <p className="text-4xl font-bold text-brand-primary">{report.seoScore}</p>
                            </div>
                            <p className="text-brand-text-primary">{report.summary}</p>
                            {report.keyFindings.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-brand-text-primary mt-2 mb-1">Key Findings:</h4>
                                    <ul className="list-disc list-inside text-brand-text-secondary">
                                        {report.keyFindings.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                            )}
                            {report.recommendations.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-brand-text-primary mt-2 mb-1">Recommendations:</h4>
                                    <ul className="list-disc list-inside text-brand-text-secondary">
                                        {report.recommendations.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <CopyButton textToCopy={JSON.stringify(report, null, 2)} />
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
};

export default WebsiteAnalyzer;