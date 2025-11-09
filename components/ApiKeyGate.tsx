import React from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import AiLoadingSpinner from './AiLoadingSpinner';

const ApiKeyGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { apiKeySelected, selectApiKey } = useApiKey();

    if (apiKeySelected === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] bg-brand-surface p-10 rounded-lg shadow-xl text-center">
                <AiLoadingSpinner message="Verifying API Key..." />
            </div>
        );
    }
    
    if (!apiKeySelected) {
        return (
            <div className="text-center bg-brand-bg p-8 rounded-lg animate-fade-in-up">
                <h2 className="text-2xl font-bold text-brand-primary mb-4">API Key Required</h2>
                <p className="text-brand-text-secondary mb-6 max-w-xl mx-auto">
                    This AI-powered tool requires a Google AI API key to function. Please select your key to continue.
                </p>
                <button onClick={selectApiKey} className="bg-brand-primary text-white px-6 py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg">
                    Select API Key
                </button>
                 <p className="text-xs text-brand-text-secondary mt-4">
                     For information on billing, please see the official <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Google AI billing documentation</a>.
                </p>
            </div>
        );
    }
    
    return <>{children}</>;
};

export default ApiKeyGate;
