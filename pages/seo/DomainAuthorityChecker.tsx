import React, { useState } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';
import { callOpenRouterApi } from '../../utils/openRouterApi';

interface AnalysisReport {
    authorityLevel: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
    justification: string;
    reputationSummary: string;
    topicalRelevance: string[];
    notableMentions: {
        sourceDomain: string;
        description: string;
    }[];
    technicalAnalysis: {
        mobileFriendly: 'Good' | 'Average' | 'Poor';
        coreWebVitals: 'Fast' | 'Average' | 'Slow';
        security: 'Uses HTTPS' | 'No HTTPS detected';
    };
    contentAnalysis: {
        primaryContentType: string;
        contentQuality: 'High' | 'Medium' | 'Low';
    };
    keyStrengths: string[];
    improvementAreas: string[];
}

const AiLoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
        <span>Researching...</span>
    </div>
);

const AuthorityBadge: React.FC<{ level: string }> = ({ level }) => {
    const colorClasses = {
        'Very High': 'bg-purple-500/20 text-purple-300',
        'High': 'bg-green-500/20 text-green-300',
        'Medium': 'bg-yellow-500/20 text-yellow-300',
        'Low': 'bg-orange-500/20 text-orange-300',
        'Very Low': 'bg-red-500/20 text-red-300',
    };
    return (
        <span className={`px-4 py-2 text-2xl font-bold rounded-lg ${colorClasses[level as keyof typeof colorClasses] || 'bg-gray-500/20 text-gray-300'}`}>
            {level}
        </span>
    );
};

const TechStat: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => {
    const valueColor = {
        'Good': 'text-green-400', 'Fast': 'text-green-400', 'Uses HTTPS': 'text-green-400',
        'Average': 'text-yellow-400',
        'Poor': 'text-red-400', 'Slow': 'text-red-400', 'No HTTPS detected': 'text-red-400'
    }[value] || 'text-brand-text-primary';

    return (
        <div className="text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center bg-brand-surface rounded-full mb-2">
                {icon}
            </div>
            <p className="text-sm text-brand-text-secondary">{label}</p>
            <p className={`font-bold ${valueColor}`}>{value}</p>
        </div>
    );
}

const DomainAuthorityChecker: React.FC = () => {
    const [domain, setDomain] = useState('dicetools.com');
    const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCheck = async () => {
        if (!domain.trim()) {
            setError('Please enter a domain name.');
            return;
        }
        setLoading(true);
        setError('');
        setAnalysis(null);
        try {
            const prompt = `Act as an expert SEO analyst. Research the conceptual domain "${domain}". Provide a comprehensive analysis of its authority and online presence based on general web knowledge and common SEO factors.
Your response MUST be a single JSON object and nothing else.
The JSON object should have the following keys:
- "authorityLevel": A string estimation ('Very High', 'High', 'Medium', 'Low', 'Very Low').
- "justification": A string briefly explaining the authority level rating.
- "reputationSummary": A string summarizing the website's overall reputation based on search results.
- "topicalRelevance": An array of strings listing the main topics it is considered an authority on.
- "notableMentions": An array of objects, where each object has "sourceDomain" (string) and "description" (string) for other authoritative websites that conceptually might mention or link to this domain.
- "technicalAnalysis": An object with three keys: "mobileFriendly" ('Good', 'Average', 'Poor'), "coreWebVitals" ('Fast', 'Average', 'Slow'), and "security" ('Uses HTTPS', 'No HTTPS detected').
- "contentAnalysis": An object with two keys: "primaryContentType" (a string like 'Blog', 'E-commerce', 'SaaS') and "contentQuality" ('High', 'Medium', 'Low').
- "keyStrengths": An array of strings summarizing the domain's strongest points discovered from the analysis.
- "improvementAreas": An array of strings suggesting areas for SEO improvement.

Do not include any text before or after the JSON object.`;

            const response = await callOpenRouterApi({
                model: 'google/gemini-pro-1.5', // OpenRouter model for complex tasks
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            });
            
            // Ensure jsonString is a string by extracting text content from message.content
            const jsonString = Array.isArray(response.choices?.[0]?.message?.content)
                ? response.choices[0].message.content.filter(part => part.type === 'text').map(part => (part as {type: 'text', text: string}).text).join('')
                : response.choices?.[0]?.message?.content || '';

            if (jsonString) {
                try {
                    const result = JSON.parse(jsonString);
                    setAnalysis(result);
                } catch (parseError) {
                    console.error("Failed to parse AI response as JSON:", jsonString, parseError);
                    setError("The AI returned a response in an unexpected format. Please try again.");
                }
            } else {
                setError("No analysis results were returned by the AI.");
            }

        } catch (e: any) {
            console.error(e);
            setError(`An AI error occurred: ${e.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ToolPageLayout
            title="AI Domain Authority Checker"
            description="Get an AI-powered analysis of a domain's authority."
        >
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="Enter domain name..."
                        className="flex-grow p-3 bg-brand-bg border border-brand-border rounded-md text-lg"
                    />
                    <button
                        onClick={handleCheck}
                        disabled={loading}
                        className="bg-brand-primary text-white px-8 py-3 rounded-md hover:bg-brand-primary-hover transition-colors disabled:bg-gray-500 font-semibold"
                    >
                        {loading ? <AiLoadingSpinner /> : 'Analyze Domain'}
                    </button>
                </div>
                 {error && <p className="text-red-500 text-center">{error}</p>}

                 {loading && (
                    <div className="flex flex-col justify-center items-center h-64 text-brand-text-secondary">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mb-4"></div>
                         <p>Researching with AI analysis...</p>
                    </div>
                )}

                {analysis && (
                     <div className="animate-fade-in-up mt-8 space-y-8">
                        <div className="bg-brand-bg p-6 rounded-lg text-center">
                            <h3 className="text-xl font-bold mb-4">Analysis for <span className="text-brand-primary">{domain}</span></h3>
                            <div className="flex flex-col items-center gap-4">
                                <AuthorityBadge level={analysis.authorityLevel} />
                                <p className="text-brand-text-secondary max-w-2xl">{analysis.justification}</p>
                            </div>
                        </div>
                        
                        {/* Actionable Insights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-brand-bg p-6 rounded-lg">
                                <h4 className="font-semibold text-lg text-green-400 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    Key Strengths
                                </h4>
                                <ul className="list-disc list-inside space-y-2 text-brand-text-secondary">
                                    {analysis.keyStrengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                             <div className="bg-brand-bg p-6 rounded-lg">
                                <h4 className="font-semibold text-lg text-yellow-400 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                    Areas for Improvement
                                </h4>
                                <ul className="list-disc list-inside space-y-2 text-brand-text-secondary">
                                    {analysis.improvementAreas.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* Technical & Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-brand-bg p-6 rounded-lg">
                                <h4 className="font-semibold text-lg text-brand-primary mb-4">Technical SEO Snapshot</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <TechStat icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>} label="Mobile Friendly" value={analysis.technicalAnalysis.mobileFriendly} />
                                    <TechStat icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 17-5-5L9 20l-4-4-1.5 1.5"></path><path d="M22 12v5h-5"></path></svg>} label="Core Web Vitals" value={analysis.technicalAnalysis.coreWebVitals} />
                                    <TechStat icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>} label="Security" value={analysis.technicalAnalysis.security} />
                                </div>
                            </div>
                            <div className="bg-brand-bg p-6 rounded-lg">
                                <h4 className="font-semibold text-lg text-brand-primary mb-4">Content Analysis</h4>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div><p className="text-sm text-brand-text-secondary">Primary Content Type</p><p className="font-bold text-xl">{analysis.contentAnalysis.primaryContentType}</p></div>
                                    <div><p className="text-sm text-brand-text-secondary">Estimated Quality</p><p className="font-bold text-xl">{analysis.contentAnalysis.contentQuality}</p></div>
                                </div>
                            </div>
                        </div>

                        {/* Reputation & Mentions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-brand-bg p-6 rounded-lg space-y-6">
                                <div>
                                    <h4 className="font-semibold text-lg text-brand-primary mb-2">Reputation Summary</h4>
                                    <p className="text-brand-text-secondary">{analysis.reputationSummary}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg text-brand-primary mb-2">Topical Relevance</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.topicalRelevance.map((kw, i) => (
                                            <span key={i} className="bg-brand-surface px-3 py-1 rounded-full text-sm">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-brand-bg p-6 rounded-lg">
                                <h4 className="font-semibold text-lg text-brand-primary mb-3">Notable Mentions Found</h4>
                                {analysis.notableMentions.length > 0 ? (
                                    <ul className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                        {analysis.notableMentions.map((mention, i) => (
                                            <li key={i} className="text-sm border-l-2 border-brand-border pl-3">
                                                <strong className="text-brand-text-primary block">{mention.sourceDomain}</strong>
                                                <p className="text-brand-text-secondary">{mention.description}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-brand-text-secondary text-sm">No specific high-authority mentions were identified by the AI.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
};

export default DomainAuthorityChecker;