// FIX: Created placeholder component for AI Backlink Checker, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const BacklinkChecker: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI Backlink Checker" 
            description="Get an AI-powered analysis of a domain's backlink profile (conceptual research via OpenRouter - Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI service (OpenRouter) for backlink analysis, which is currently not supported with the active API."
        />
    );
};

export default BacklinkChecker;