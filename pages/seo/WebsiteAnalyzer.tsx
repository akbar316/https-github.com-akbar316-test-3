import React, { useState } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';
import { useApiKey } from '../../context/ApiKeyContext';

interface PsiReport {
    scores: {
        performance: number;
        accessibility: number;
        bestPractices: number;
        seo: number;
    };
    screenshot: string;
    webVitals: {
        lcp: { value: string; rating: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR' };
        cls: { value: string; rating: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR' };
        tbt: { value: string; rating: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR' };
    };
    opportunities: Array<{
        title: string;
        description: string;
        savings: string;
    }>;
}

const ScoreGauge: React.FC<{ score: number; label: string }> = ({ score, label }) => {
    const size = 100;
    const strokeWidth = 10;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    let color = 'text-red-500';
    if (score >= 90) color = 'text-green-500';
    else if (score >= 50) color = 'text-yellow-500';
    
    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label} score is ${score} out of 100`}>
                    <circle
                        className="text-brand-surface"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        r={radius}
                        cx={center}
                        cy={center}
                    />
                    <circle
                        className={color}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx={center}
                        cy={center}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">{score}</span>
            </div>
            <p className="mt-2 text-sm font-semibold">{label}</p>
        </div>
    );
};

const WebVitalCard: React.FC<{ title: string; value: string; rating: string }> = ({ title, value, rating }) => {
    let color = 'text-gray-400';
    if (rating === 'GOOD') color = 'text-green-500';
    else if (rating === 'NEEDS_IMPROVEMENT') color = 'text-yellow-500';
    else if (rating === 'POOR') color = 'text-red-500';

    return (
        <div className="bg-brand-surface p-4 rounded-lg">
            <p className="text-sm text-brand-text-secondary">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    );
};

const OpportunityItem: React.FC<{ title: string; description: string; savings: string }> = ({ title, description, savings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const cleanDescription = description.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-primary underline">$1</a>');

    return (
        <div className="border-b border-brand-border">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-3 flex justify-between items-center hover:bg-brand-border">
                <span className="flex-1 pr-4">{title}</span>
                <span className="text-sm font-semibold text-green-400">{savings}</span>
                <svg className={`w-5 h-5 ml-2 transform transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && <div className="p-3 bg-brand-bg text-sm text-brand-text-secondary prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: cleanDescription }} />}
        </div>
    );
};

const WebsiteAnalyzer: React.FC = () => {
    const [domain, setDomain] = useState('dicetools.com');
    const [report, setReport] = useState<PsiReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { invalidateApiKey, apiKeySelected, isLoading: isApiKeyLoading } = useApiKey();

    const runAnalysis = async () => {
        if (!domain.trim()) {
            setError('Please enter a domain to analyze.');
            return;
        }

        setIsLoading(true);
        setError('');
        setReport(null);

        try {
            const siteUrl = domain.trim().startsWith('http') ? domain.trim() : `https://${domain.trim()}`;
            const apiKey = process.env.API_KEY;

            const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(siteUrl)}&strategy=mobile&key=${apiKey}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error.message || `API request failed with status ${res.status}`);
            }
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);

            const lighthouseResult = data.lighthouseResult;
            
            const getRating = (score: number): 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR' => {
                if (score >= 0.9) return 'GOOD';
                if (score >= 0.5) return 'NEEDS_IMPROVEMENT';
                return 'POOR';
            };

            const extractedReport: PsiReport = {
                scores: {
                    performance: Math.round(lighthouseResult.categories.performance.score * 100),
                    accessibility: Math.round(lighthouseResult.categories.accessibility.score * 100),
                    bestPractices: Math.round(lighthouseResult.categories['best-practices'].score * 100),
                    seo: Math.round(lighthouseResult.categories.seo.score * 100),
                },
                screenshot: lighthouseResult.audits['final-screenshot'].details.data,
                webVitals: {
                    lcp: {
                        value: lighthouseResult.audits['largest-contentful-paint'].displayValue,
                        rating: getRating(lighthouseResult.audits['largest-contentful-paint'].score),
                    },
                    cls: {
                        value: lighthouseResult.audits['cumulative-layout-shift'].displayValue,
                        rating: getRating(lighthouseResult.audits['cumulative-layout-shift'].score),
                    },
                    tbt: {
                        value: lighthouseResult.audits['total-blocking-time'].displayValue,
                        rating: getRating(lighthouseResult.audits['total-blocking-time'].score),
                    }
                },
                opportunities: Object.values(lighthouseResult.audits)
                    .filter((audit: any) => audit.details?.type === 'opportunity' && audit.details.overallSavingsMs > 0)
                    .map((audit: any) => ({
                        title: audit.title,
                        description: audit.description,
                        savings: `${Math.round(audit.details.overallSavingsMs)} ms`,
                    }))
            };
            setReport(extractedReport);

        } catch (err: any) {
            console.error('Website Analyzer Error:', err);
            const errorMessage = err.message || 'An error occurred during website analysis.';
             if (errorMessage.includes("API key not valid") || errorMessage.includes("API key expired")) {
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
                Our Website SEO Analyzer leverages Google's official PageSpeed Insights API to provide a comprehensive audit of your website's performance, accessibility, best practices, and SEO. This tool gives you the same powerful insights used by developers and SEO professionals to optimize web pages for speed and user experience. After entering your domain, you'll receive a detailed report with actionable data.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Metrics & Insights</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Performance Scores:</strong> Get an at-a-glance view of your site's health with scores for Performance, Accessibility, Best Practices, and SEO.</li>
                <li><strong>Core Web Vitals:</strong> See how your site performs on Google's critical user experience metrics: Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and Total Blocking Time (TBT).</li>
                <li><strong>Actionable Opportunities:</strong> Receive a prioritized list of specific recommendations from Google to improve your page load speed, with estimated time savings for each.</li>
                <li><strong>Visual Preview:</strong> A screenshot of your page as seen by Google's mobile crawler helps you understand the user's first impression.</li>
            </ul>
        </>
    );

    return (
        <ToolPageLayout
            title="Website SEO Analyzer"
            description="Audit your site's SEO and performance using Google's PageSpeed Insights."
            longDescription={longDescription}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <label htmlFor="domain-input" className="block text-sm font-medium text-brand-text-secondary mb-1">
                        Enter Website Domain to Analyze
                    </label>
                    <div className="flex">
                        <input
                            type="text"
                            id="domain-input"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="e.g., 'dicetools.com'"
                            className="w-full p-3 bg-brand-bg border border-brand-border rounded-l-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-lg"
                        />
                        <button
                            onClick={runAnalysis}
                            disabled={isLoading || !domain.trim() || isApiKeyLoading || !apiKeySelected}
                            className="bg-brand-primary text-white px-8 rounded-r-md hover:bg-brand-primary-hover font-semibold disabled:bg-gray-500"
                        >
                            Analyze
                        </button>
                    </div>
                </div>

                {isLoading && (
                    <div className="text-center p-8">
                        <AiLoadingSpinner message="Running PageSpeed audit... this may take a minute." />
                    </div>
                )}
                {error && <p className="text-red-500 text-center bg-red-500/10 p-4 rounded-md">{error}</p>}

                {report && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-brand-bg p-6 rounded-lg">
                            <ScoreGauge score={report.scores.performance} label="Performance" />
                            <ScoreGauge score={report.scores.accessibility} label="Accessibility" />
                            <ScoreGauge score={report.scores.bestPractices} label="Best Practices" />
                            <ScoreGauge score={report.scores.seo} label="SEO" />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 space-y-4">
                                <h3 className="text-xl font-bold text-brand-text-primary">Core Web Vitals</h3>
                                <WebVitalCard title="Largest Contentful Paint" value={report.webVitals.lcp.value} rating={report.webVitals.lcp.rating} />
                                <WebVitalCard title="Cumulative Layout Shift" value={report.webVitals.cls.value} rating={report.webVitals.cls.rating} />
                                <WebVitalCard title="Total Blocking Time" value={report.webVitals.tbt.value} rating={report.webVitals.tbt.rating} />
                            </div>
                             <div className="lg:col-span-2 space-y-4">
                                 <h3 className="text-xl font-bold text-brand-text-primary">Page Screenshot</h3>
                                 <img src={report.screenshot} alt="Website Screenshot" className="border-4 border-brand-border rounded-md"/>
                             </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-brand-text-primary mb-2">Opportunities</h3>
                            <div className="bg-brand-bg rounded-lg border border-brand-border">
                                {report.opportunities.map((item, index) => <OpportunityItem key={index} {...item} />)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
};

export default WebsiteAnalyzer;
