import React from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import { ApiProvider } from '../types';

interface ApiKeyGateProps {
    children: React.ReactNode;
    provider: ApiProvider;
}

const ApiKeyGate: React.FC<ApiKeyGateProps> = ({ children, provider }) => {
    const { apiKeySelected, isLoading, selectApiKey } = useApiKey();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    const providerDetails = {
        'gemini': {
            name: 'Google AI',
            helpText: 'For information on billing, please see the official Google AI billing documentation.',
            helpLink: 'https://ai.google.dev/gemini-api/docs/billing',
        },
        'deepseek': {
            name: 'DeepSeek',
            helpText: 'The DeepSeek API is currently free for certain usage tiers. Please check their official website for details.',
            helpLink: 'https://www.deepseek.com/en/pricing',
        },
        'google-psi': {
            name: 'Google PageSpeed Insights',
            helpText: 'The PageSpeed Insights API has a free usage tier. See the official documentation for limits.',
            helpLink: 'https://developers.google.com/speed/docs/insights/v5/get-started#key',
        }
    };
    
    const details = providerDetails[provider];

    if (!apiKeySelected) {
        return (
            <div className="text-center bg-brand-bg p-8 rounded-lg animate-fade-in-up">
                <h2 className="text-2xl font-bold text-brand-primary mb-4">{details.name} API Key Required</h2>
                <p className="text-brand-text-secondary mb-6 max-w-xl mx-auto">
                    This tool requires a {details.name} API key to function. Please select the correct key to continue.
                </p>
                <button onClick={selectApiKey} className="bg-brand-primary text-white px-6 py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg">
                    Select API Key
                </button>
                 <p className="text-xs text-brand-text-secondary mt-4">
                     {details.helpText} <a href={details.helpLink} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Learn more</a>.
                </p>
            </div>
        );
    }
    
    return <>{children}</>;
};

export default ApiKeyGate;
