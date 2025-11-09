import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';
import { runReplicate } from '../../utils/openRouterApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';

const LLAMA_MODEL = 'meta/llama-2-7b-chat:13c3c6e434317316106c5957d19a27985472483582a472c57706d7d56e72ca41';

interface BacklinkAnalysis {
    domain: string;
    overview: string;
    qualityMetrics: {
        totalBacklinks: string; // e.g., "Estimated 10K-50K"
        referringDomains: string; // e.g., "Estimated 1K-5K"
        domainAuthority: string; // e.g., "High (70+)"
        spamScore: string; // e.g., "Low (0-10%)"
    };
    opportunities: string[];
    potentialRisks: string[];
}

const BacklinkChecker: React.FC = () => {
    const [domain, setDomain] = useState('dicetools.com');
    const [analysis, setAnalysis] = useState<BacklinkAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const runAnalysis = async () => {
        if (!domain.trim()) {
            setError('Please enter a domain to analyze.');
            return;
        }

        setIsLoading(true);
        setError('');
        setAnalysis(null);

        try {
            const systemPrompt = `You are an expert SEO backlink analysis assistant. Your task is to provide a conceptual analysis of a given domain's backlink profile. Include an overview, conceptual quality metrics (total backlinks, referring domains, domain authority, spam score - use estimated ranges or qualitative descriptions), potential opportunities for improvement, and any conceptual risks. Respond as only a valid JSON object. The structure should be:
{
  "domain": "example.com",
  "overview": "A brief summary of the conceptual backlink profile.",
  "qualityMetrics": {
    "totalBacklinks": "e.g., Estimated 10K-50K",
    "referringDomains": "e.g., Estimated 1K-5K",
    "domainAuthority": "e.g., High (70+)",
    "spamScore": "e.g., Low (0-10%)"
  },
  "opportunities": ["opportunity 1", "opportunity 2"],
  "potentialRisks": ["risk 1", "risk 2"]
}
Remember this is a conceptual analysis based on general SEO knowledge, not real-time data. Do not include any text before or after the JSON object.`;

            const prompt = `[INST] <<SYS>>\n${systemPrompt}\n<</SYS>>\n\nPerform a conceptual backlink analysis for the domain: "${domain}" [/INST]`;

            const output = await runReplicate(LLAMA_MODEL, { prompt });

            const jsonString = Array.isArray(output) ? output.join('') : String(output);
            const cleanedJsonString = jsonString.substring(jsonString.indexOf('{'), jsonString.lastIndexOf('}') + 1);
            const parsedAnalysis: BacklinkAnalysis = JSON.parse(cleanedJsonString);
            setAnalysis(parsedAnalysis);

        } catch (err: any) {
            console.error('AI Backlink Analysis Error:', err);
            setError(err.message || 'An AI error occurred during backlink analysis. The model may have returned an invalid format.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const longDescription = (
        <>
            <p>
                Our AI Backlink Checker, powered by Replicate, provides a conceptual analysis of any domain's backlink profile. This tool uses advanced AI to synthesize general SEO knowledge and provide insights into potential backlink quality, quantity, and associated risks and opportunities. It's an excellent resource for getting an AI-driven overview of a website's authority and link-building landscape without requiring real-time data.
            </p>
            <p>
                Input a domain, and the AI will generate a structured report with qualitative metrics and actionable suggestions for improving or maintaining a healthy backlink profile. This helps SEO professionals and digital marketers to formulate strategies more effectively.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Conceptual Insights</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Overview:</strong> A summary of the conceptual strength and health of the backlink profile.</li>
                <li><strong>Quality Metrics:</strong> Estimated total backlinks, referring domains, domain authority, and spam score.</li>
                <li><strong>Opportunities:</strong> AI-driven suggestions for acquiring new, high-quality backlinks.</li>
                <li><strong>Potential Risks:</strong> Identification of conceptual risks like low-quality links or spam signals.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">
                This tool provides a conceptual analysis based on AI's general SEO knowledge and does not query live backlink data.
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
            title="AI Backlink Checker"
            description="Get a conceptual backlink analysis for any domain using AI."
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
                        placeholder="e.g., 'moz.com'"
                        className="w-full p-3 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>

                <button
                    onClick={runAnalysis}
                    disabled={isLoading || !domain.trim()}
                    className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg disabled:bg-gray-500"
                >
                    {isLoading ? <AiLoadingSpinner message="Analyzing backlinks..." /> : 'Analyze Backlinks with AI'}
                </button>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {analysis && (
                    <div className="space-y-4 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-brand-primary mb-2">Backlink Analysis for {analysis.domain}</h3>
                        <div className="bg-brand-bg p-4 rounded-md border border-brand-border space-y-3">
                            <p className="text-brand-text-primary">{analysis.overview}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* FIX: Defined InfoCard component for local use */}
                                <InfoCard label="Total Backlinks" value={analysis.qualityMetrics.totalBacklinks} />
                                <InfoCard label="Referring Domains" value={analysis.qualityMetrics.referringDomains} />
                                <InfoCard label="Domain Authority" value={analysis.qualityMetrics.domainAuthority} />
                                <InfoCard label="Spam Score" value={analysis.qualityMetrics.spamScore} />
                            </div>
                            {analysis.opportunities.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-brand-text-primary mt-2 mb-1">Opportunities:</h4>
                                    <ul className="list-disc list-inside text-brand-text-secondary">
                                        {analysis.opportunities.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                            )}
                            {analysis.potentialRisks.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-brand-text-primary mt-2 mb-1">Potential Risks:</h4>
                                    <ul className="list-disc list-inside text-red-400">
                                        {analysis.potentialRisks.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <CopyButton textToCopy={JSON.stringify(analysis, null, 2)} />
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
};

// FIX: Added InfoCard component definition for local use.
const InfoCard: React.FC<{label: string, value: string}> = ({label, value}) => (
    <div className="bg-brand-surface p-4 rounded-lg">
        <p className="text-sm text-brand-text-secondary">{label}</p>
        <p className="font-semibold text-lg">{value}</p>
    </div>
);

export default BacklinkChecker;
