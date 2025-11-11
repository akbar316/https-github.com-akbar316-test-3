import React from 'react';

const DeepSeekApiKeyGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        return (
            <div className="text-center bg-brand-bg p-8 rounded-lg animate-fade-in-up">
                <h2 className="text-2xl font-bold text-brand-primary mb-4">DeepSeek API Key Required</h2>
                <p className="text-brand-text-secondary mb-6 max-w-xl mx-auto">
                    This AI-powered tool requires a DeepSeek API key to function. Please set the <code>DEEPSEEK_API_KEY</code> environment variable in your project's deployment settings to continue.
                </p>
            </div>
        );
    }
    
    return <>{children}</>;
};

export default DeepSeekApiKeyGate;
