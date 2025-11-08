import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';
import { callOpenRouterApi, OpenRouterMessage } from '../../utils/openRouterApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';

interface BrokenLinkReport {
    domain: string;
    summary: string;
    conceptualBrokenLinks: Array<{ url: string; reason: string; priority: 'High' | 'Medium' | 'Low' }>;
    recommendations: string[];
}

const BrokenLinkChecker: React.FC = () => {
    const [domain, setDomain] = useState('dicetools.com');
    const [report, setReport] = useState<BrokenLinkReport | null>(null);
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
                    content: `You are an AI SEO assistant specialized in conceptual broken link checking. For a given domain, provide a summary of potential broken link issues, a list of *conceptual* broken links (e.g., common patterns or types of broken links that might occur on a site like this, not actual crawled URLs), their hypothetical reasons, and a priority level. Also, include recommendations for fixing and preventing them. Respond in a JSON object format. The structure should be:
{
  "domain": "example.com",
  "summary": "A conceptual summary of potential broken link issues.",
  "conceptualBrokenLinks": [
    {
      "url": "e.g., https://example.com/old-page",
      "reason": "e.g., Page removed without redirect",
      "priority": "High | Medium | Low"
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}
Remember this is a conceptual analysis based on general SEO knowledge, not real-time crawling.`,
                },
                {
                    role: 'user',
                    content: `Perform a conceptual broken link analysis for the domain: "${domain}"`,
                },
            ];

            const response = await callOpenRouterApi({
                model: 'google/gemini-2.5-flash-image', // Changed model
                messages: messages,
                temperature: 0.7,
                max_tokens: 1200,
                response_format: { type: "json_object" },
            });

            // FIX: Add type assertion to `string` because `response_format: { type: "json_object" }` guarantees a JSON string output.
            const jsonString = (response.choices?.[0]?.message?.content as string) || '';
            const parsedReport: BrokenLinkReport = JSON.parse(jsonString);
            setReport(parsedReport);

        } catch (err: any) {
            console.error('AI Broken Link Checker Error:', err);
            setError(err.message || 'An AI error occurred during broken link analysis. Please try again or with a different domain.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const longDescription = (
        <>
            <p>
                Our AI Broken Link Checker, powered by OpenRouter, offers a conceptual analysis of potential broken links on any domain. This tool utilizes advanced AI to synthesize general web best practices and SEO knowledge, providing insights into common causes and types of broken links that might affect a website. It's an excellent resource for understanding potential crawlability issues and user experience problems related to outdated or missing content without performing actual website crawls.
            </p>
            <p>
                Input a domain, and the AI will generate a structured report that includes a summary of potential issues, a list of *hypothetical* broken links with reasons and priority levels, and actionable recommendations for prevention and repair. This helps website administrators and SEO specialists to be proactive in maintaining site health.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Conceptual Insights</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Summary:</strong> A conceptual overview of potential broken link challenges for the domain.</li>
                <li><strong>Conceptual Broken Links:</strong> Examples of likely broken links, their reasons, and a priority for addressing them.</li>
                <li><strong>Recommendations:</strong> AI-driven advice on how to find, fix, and prevent broken links.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">
                This tool provides a conceptual analysis based on AI's general SEO knowledge and does not perform live website crawling or real-time link checking.
            </p>
        </>
    );

    const getPriorityColor = (priority: 'High' | 'Medium' | 'Low') => {
        switch (priority) {
            case 'High': return 'text-red-400';
            case 'Medium': return 'text-yellow-400';
            case 'Low': return 'text-green-400';
            default: return 'text-brand-text-secondary';
        }
    };

    return (
        <ToolPageLayout
            title="AI Broken Link Checker"
            description="Scan a domain for broken or outdated links using AI analysis (conceptual scanning via OpenRouter)."
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
                        placeholder="e.g., 'oldsite.com'"
                        className="w-full p-3 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>

                <button
                    onClick={runAnalysis}
                    disabled={isLoading || !domain.trim()}
                    className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg disabled:bg-gray-500"
                >
                    {isLoading ? <AiLoadingSpinner message="Analyzing links..." /> : 'Analyze Broken Links with AI'}
                </button>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {report && (
                    <div className="space-y-4 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-brand-primary mb-2">Broken Link Analysis for {report.domain}</h3>
                        <div className="bg-brand-bg p-4 rounded-md border border-brand-border space-y-3">
                            <p className="text-brand-text-primary mb-2">{report.summary}</p>
                            {report.conceptualBrokenLinks.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-brand-text-primary mt-2 mb-1">Conceptual Broken Links:</h4>
                                    <ul className="list-disc list-inside text-brand-text-secondary">
                                        {report.conceptualBrokenLinks.map((item, index) => (
                                            <li key={index}>
                                                <span className="font-semibold">{item.url}</span> - {item.reason} (<span className={getPriorityColor(item.priority)}>{item.priority} Priority</span>)
                                            </li>
                                        ))}
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

export default BrokenLinkChecker;