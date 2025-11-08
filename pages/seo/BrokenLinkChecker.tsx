// FIX: Created placeholder component for AI Broken Link Checker, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const BrokenLinkChecker: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI Broken Link Checker" 
            description="Scan a domain for broken or outdated links using AI analysis (conceptual scanning via OpenRouter - Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI service (OpenRouter) for broken link checking, which is currently not supported with the active API."
        />
    );
};

export default BrokenLinkChecker;