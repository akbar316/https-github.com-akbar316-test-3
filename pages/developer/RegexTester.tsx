import React, { useState, useMemo } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';

const CheatSheet: React.FC = () => (
    <div className="bg-brand-bg p-4 rounded-lg text-sm">
        <h3 className="font-semibold text-brand-primary mb-2">Regex Quick Reference</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
            <span>. (any character)</span><span>\d (digit)</span>
            <span>\w (word char)</span><span>\s (whitespace)</span>
            <span>* (0 or more)</span><span>+ (1 or more)</span>
            <span>? (0 or 1)</span><span>^ (start of string)</span>
            <span>$ (end of string)</span><span>[abc] (any of a,b,c)</span>
            <span>(a|b) (a or b)</span><span>&#123;n&#125; (exactly n times)</span>
        </div>
    </div>
);

const RegexTester: React.FC = () => {
    const [pattern, setPattern] = useState('(\\w+)@(\\w+\\.\\w+)');
    const [flags, setFlags] = useState('g');
    const [testString, setTestString] = useState('Contact us at support@example.com or sales@example.org for more info.');
    const [error, setError] = useState('');
    
    const { highlightedString, matches } = useMemo(() => {
        if (!pattern) return { highlightedString: testString, matches: [] };
        try {
            const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
            setError('');
            const foundMatches: (string[])[] = [];
            for (const match of testString.matchAll(regex)) {
                foundMatches.push(Array.from(match));
            }
            return {
                highlightedString: testString.replace(regex, (match) => `<mark>${match}</mark>`),
                matches: foundMatches,
            };
        } catch (e: any) {
            setError(e.message);
            return { highlightedString: testString, matches: [] };
        }
    }, [pattern, flags, testString]);
    
    const longDescription = (
      <>
        <p>
          Master the art of regular expressions with our Advanced Regex Tester. This comprehensive tool is designed for developers of all skill levels, from beginners learning the basics to experts crafting complex patterns. The real-time interface allows you to instantly test your regex against a sample string, providing immediate visual feedback with highlighted matches. You can easily modify your pattern and flags (like global, multiline, and case-insensitive) to see how they affect the results. The detailed "Matches & Groups" panel breaks down each match and its corresponding capture groups, making debugging and validation a breeze.
        </p>
        <p className="text-sm text-brand-text-secondary mt-4">AI-powered generation and explanation features are currently unavailable.</p>
      </>
    );

    return (
        <ToolPageLayout title="Advanced Regex Tester" description="Test your regular expressions in real-time." longDescription={longDescription}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="font-mono flex items-center bg-brand-bg border border-brand-border rounded-md">
                        <span className="px-3 text-brand-text-secondary">/</span>
                        <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Pattern" className="flex-grow p-2 bg-transparent focus:outline-none"/>
                        <span className="px-3 text-brand-text-secondary">/</span>
                        <input type="text" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="flags" className="w-16 p-2 bg-transparent focus:outline-none"/>
                    </div>
                    {error && <p className="text-red-500 text-sm px-2 font-sans">{error}</p>}
                    <textarea value={testString} onChange={(e) => setTestString(e.target.value)} placeholder="Test String" className="w-full h-48 p-2 bg-brand-bg border border-brand-border rounded-md font-mono"/>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold mb-2">Highlighted Result</h3>
                            <div className="p-2 bg-brand-bg border border-brand-border rounded-md min-h-[8rem] whitespace-pre-wrap font-mono"
                                dangerouslySetInnerHTML={{ __html: highlightedString.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/<mark>/g, '<mark class="bg-brand-primary/50 rounded-sm">') }} />
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2">Matches & Groups ({matches.length})</h3>
                            <div className="bg-brand-bg border border-brand-border rounded-md min-h-[8rem] max-h-48 overflow-y-auto p-2 font-mono text-xs">
                                {matches.map((match, i) => (
                                    <div key={i} className="mb-2 p-1 border-b border-brand-border/50">
                                        <p><span className="text-brand-text-secondary">Full Match {i}:</span> {match[0]}</p>
                                        {match.length > 1 && match.slice(1).map((group, j) => (
                                            <p key={j} className="ml-2"><span className="text-brand-text-secondary">Group {j+1}:</span> {group}</p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-brand-bg p-4 rounded-lg space-y-3">
                        <h3 className="font-semibold text-brand-primary">AI Tools</h3>
                        <p className="text-sm text-brand-text-secondary">AI-powered regex generation and explanation are currently unavailable.</p>
                    </div>
                    <CheatSheet />
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default RegexTester;