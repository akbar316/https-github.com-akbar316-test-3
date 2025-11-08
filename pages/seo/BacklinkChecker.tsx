import React, { useState } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';
import { callOpenRouterApi } from '../../utils/openRouterApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner'; // Import shared spinner

interface AnalysisResult {
    totalBacklinks: string;
    referringDomains: string;
    topBacklinks: {
        sourceUrl: string;
        sourceDomainAuthority: 'High' | 'Medium' | 'Low';
        anchorText: string;
        linkType: 'Dofollow' | 'Nofollow';
    }[];
    topAnchors: string[];
}

const AuthorityBadge: React.FC<{ level: string }> = ({ level }) => {
    const colorClasses = {
        'High': 'bg-green-500/20 text-green-300',
        'Medium': 'bg-yellow-500/20 text-yellow-300',
        'Low': 'bg-orange-500/20 text-orange-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses[level as keyof typeof colorClasses] || 'bg-gray-500/20 text-gray-300'}`}>
            {level}
        </span>
    );
};

const BacklinkChecker: React.FC = () => {
    const [domain, setDomain] = useState('dicetools.com');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCheck = async () => {
        if (!domain.trim()) {
            setError('Please enter a domain to check.');
            return;
        }
        setLoading(true);
        setError('');
        setAnalysis(null);

        try {
            const prompt = `Act as an expert SEO backlink analysis tool. Using general web knowledge (you cannot perform live web searches), thoroughly research the backlink profile for the conceptual domain "${domain}". Provide a detailed analysis.

Your response MUST be a single JSON object and nothing else.

The JSON object should have the following structure:
- "totalBacklinks": A string estimating the total number of backlinks (e.g., "Thousands", "Hundreds", "Millions").
- "referringDomains": A string estimating the total number of unique referring domains.
- "topBacklinks": An array of up to 10 of the most significant backlinks found. Each object in the array should contain:
  - "sourceUrl": The full URL of the page containing the backlink.
  - "sourceDomainAuthority": A string estimation of the linking domain's authority ('High', 'Medium', 'Low').
  - "anchorText": The anchor text of the link. If it's an image link, use "[Image Link]".
  - "linkType": A string, either 'Dofollow' or 'Nofollow' (your best guess based on context).
- "topAnchors": An array of up to 5 of the most common anchor texts found, as strings.`;
            
            const response = await callOpenRouterApi({
                model: 'google/gemini-pro-1.5', // OpenRouter model for complex tasks
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                response_format: { type: 'json_object' },
            });
            
            // Ensure jsonString is a string by extracting text content from message.content
            let jsonString = Array.isArray(response.choices?.[0]?.message?.content)
                ? response.choices[0].message.content.filter(part => part.type === 'text').map(part => (part as {type: 'text', text: string}).text).join('')
                : response.choices?.[0]?.message?.content || '';

            try {
                const result = JSON.parse(jsonString);
                setAnalysis(result);
            } catch (parseError) {
                console.error("Failed to parse AI response as JSON:", jsonString, parseError);
                setError("The AI returned a response in an unexpected format. Please try again.");
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
            title="AI Backlink Checker"
            description="Get an AI-powered analysis of a domain's backlink profile (conceptual research)."
        >
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="Enter domain name..."
                        className="flex-grow p-3 bg-brand-bg border border-brand-border rounded-md text-lg"
                        disabled={loading}
                    />
                    <button
                        onClick={handleCheck}
                        disabled={loading}
                        className="bg-brand-primary text-white px-8 py-3 rounded-md hover:bg-brand-primary-hover transition-colors disabled:bg-gray-500 font-semibold"
                    >
                        {loading ? <AiLoadingSpinner /> : 'Check Backlinks'}
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
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-brand-bg p-4 rounded-lg text-center">
                                <p className="text-sm text-brand-text-secondary">Estimated Backlinks</p>
                                <p className="text-2xl font-bold text-brand-primary">{analysis.totalBacklinks}</p>
                            </div>
                            <div className="bg-brand-bg p-4 rounded-lg text-center">
                                <p className="text-sm text-brand-text-secondary">Referring Domains</p>
                                <p className="text-2xl font-bold text-brand-primary">{analysis.referringDomains}</p>
                            </div>
                            <div className="bg-brand-bg p-4 rounded-lg">
                                <p className="text-sm text-brand-text-secondary text-center mb-2">Top Anchor Texts</p>
                                <ul className="text-xs space-y-1 text-center">
                                    {analysis.topAnchors.map((anchor, i) => <li key={i} className="truncate font-mono bg-brand-surface px-2 py-1 rounded">{anchor}</li>)}
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-3">Top Backlinks Found</h3>
                             <div className="overflow-x-auto bg-brand-bg rounded-lg">
                                <table className="w-full text-left">
                                    <thead className="bg-brand-surface text-sm text-brand-text-secondary">
                                        <tr>
                                            <th className="p-3">Source URL</th>
                                            <th className="p-3">DA</th>
                                            <th className="p-3">Anchor Text</th>
                                            <th className="p-3">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analysis.topBacklinks.map((link, index) => (
                                            <tr key={index} className="border-t border-brand-border">
                                                <td className="p-3 truncate max-w-xs">
                                                    <a href={link.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{link.sourceUrl}</a>
                                                </td>
                                                <td className="p-3"><AuthorityBadge level={link.sourceDomainAuthority} /></td>
                                                <td className="p-3 text-brand-text-primary font-mono truncate max-w-xs">{link.anchorText}</td>
                                                <td className="p-3 text-sm">{link.linkType}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
};

export default BacklinkChecker;