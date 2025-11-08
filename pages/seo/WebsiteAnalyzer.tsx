// FIX: Created placeholder component for AI Website SEO Analyzer, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const WebsiteAnalyzer: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI Website SEO Analyzer" 
            description="Get an AI-powered SEO score and optimization report for your website (conceptual analysis via OpenRouter - Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI service (OpenRouter) for website analysis, which is currently not supported with the active API."
        />
    );
};

export default WebsiteAnalyzer;