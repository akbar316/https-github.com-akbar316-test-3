import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';
import { callOpenRouterApi, OpenRouterMessage } from '../../utils/openRouterApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';

interface DomainAuthorityReport {
    domain: string;
    domainAuthority: string; // e.g., "High (70-85)"
    pageAuthority: string; // e.g., "Medium (50-65)"
    conceptualRating: string; // e.g., "Strong"
    keyFactors: string[];
    recommendations: string[];
}

const DomainAuthorityChecker: React.FC = () => {
    const [domain, setDomain] = useState('dicetools.com');
    const [report, setReport] = useState<DomainAuthorityReport | null>(null);
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
                    content: `You are an AI SEO assistant specialized in conceptual domain authority analysis. For a given domain, provide a conceptual Domain Authority (DA) and Page Authority (PA) rating (use qualitative descriptions or score ranges), an overall conceptual rating (e.g., "Strong", "Moderate", "Weak"), key factors that conceptually influence this authority, and recommendations for improvement. Respond in a JSON object format. The structure should be:
{
  "domain": "example.com",
  "domainAuthority": "e.g., High (70-85)",
  "pageAuthority": "e.g., Medium (50-65)",
  "conceptualRating": "e.g., Strong",
  "keyFactors": ["factor 1", "factor 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}
Remember this is a conceptual analysis based on general SEO knowledge, not real-time data from specific SEO tools.`,
                },
                {
                    role: 'user',
                    content: `Perform a conceptual domain authority analysis for the domain: "${domain}"`,
                },
            ];

            const response = await callOpenRouterApi({
                model: 'google/gemini-2.5-flash-image', // Changed model
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000,
                response_format: { type: "json_object" },
            });

            // FIX: Add type assertion to `string` because `response_format: { type: "json_object" }` guarantees a JSON string output.
            const jsonString = (response.choices?.[0]?.message?.content as string) || '';
            const parsedReport: DomainAuthorityReport = JSON.parse(jsonString);
            setReport(parsedReport);

        } catch (err: any) {
            console.error('AI Domain Authority Checker Error:', err);
            setError(err.message || 'An AI error occurred during domain authority analysis. Please try again or with a different domain.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const longDescription = (
        <>
            <p>
                Our AI Domain Authority Checker, powered by OpenRouter, provides a conceptual analysis of a domain's authority and page authority. This tool utilizes advanced AI to synthesize general SEO principles and offer insights into what conceptually drives a website's authority in search engine rankings. It's an excellent resource for getting an AI-driven overview of a website's perceived strength and credibility without requiring real-time data from specific SEO metrics providers.
            </p>
            <p>
                Input a domain, and the AI will generate a structured report that includes conceptual DA/PA ratings, an overall conceptual strength rating, key factors influencing this authority, and actionable recommendations for improvement. This helps SEO professionals and website owners to understand and strategize around improving their domain's standing.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Conceptual Insights</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Domain Authority (DA) & Page Authority (PA):</strong> Conceptual ratings of a domain's and a specific page's strength.</li>
                <li><strong>Conceptual Rating:</strong> An overall assessment (e.g., Strong, Moderate) of the domain's authority.</li>
                <li><strong>Key Factors:</strong> AI-driven identification of conceptual elements contributing to authority, such as backlink profile and content quality.</li>
                <li><strong>Recommendations:</strong> Actionable suggestions for conceptually enhancing domain authority.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">
                This tool provides a conceptual analysis based on AI's general SEO knowledge and does not query live DA/PA scores from third-party providers.
            </p>
        </>
    );

    return (
        <ToolPageLayout
            title="AI Domain Authority Checker"
            description="Get an AI-powered analysis of a domain's authority (conceptual analysis via OpenRouter)."
            longDescription={longDescription}
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <label htmlFor="domain-input" className="block text-sm font-medium text-brand-text-secondary mb-1">
                        Enter Domain (e.g., "dicetools.com")
                    </label>
                    <input
                        type="text"
                        id="domain-input"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="e.g., 'amazon.com'"
                        className="w-full p-3 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>

                <button
                    onClick={runAnalysis}
                    disabled={isLoading || !domain.trim()}
                    className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg disabled:bg-gray-500"
                >
                    {isLoading ? <AiLoadingSpinner message="Analyzing authority..." /> : 'Analyze Domain Authority with AI'}
                </button>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {report && (
                    <div className="space-y-4 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-brand-primary mb-2">Domain Authority Report for {report.domain}</h3>
                        <div className="bg-brand-bg p-4 rounded-md border border-brand-border space-y-3">
                            <div className="text-center mb-4">
                                <p className="text-sm text-brand-text-secondary">Conceptual Rating</p>
                                <p className="text-4xl font-bold text-brand-primary">{report.conceptualRating}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* FIX: Defined InfoCard component for local use */}
                                <InfoCard label="Domain Authority (DA)" value={report.domainAuthority} />
                                <InfoCard label="Page Authority (PA)" value={report.pageAuthority} />
                            </div>
                            {report.keyFactors.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-brand-text-primary mt-2 mb-1">Key Conceptual Factors:</h4>
                                    <ul className="list-disc list-inside text-brand-text-secondary">
                                        {report.keyFactors.map((item, index) => <li key={index}>{item}</li>)}
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

// FIX: Added InfoCard component definition for local use.
const InfoCard: React.FC<{label: string, value: string}> = ({label, value}) => (
    <div className="bg-brand-bg p-4 rounded-lg">
        <p className="text-sm text-brand-text-secondary">{label}</p>
        <p className="font-semibold text-lg">{value}</p>
    </div>
);

export default DomainAuthorityChecker;