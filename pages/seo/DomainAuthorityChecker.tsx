// FIX: Created placeholder component for AI Domain Authority Checker, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const DomainAuthorityChecker: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI Domain Authority Checker" 
            description="Get an AI-powered analysis of a domain's authority (conceptual analysis via OpenRouter - Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI service (OpenRouter) for domain authority checking, which is currently not supported with the active API."
        />
    );
};

export default DomainAuthorityChecker;