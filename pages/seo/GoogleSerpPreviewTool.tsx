// FIX: Created placeholder component for AI Google SERP Preview & Optimizer, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const GoogleSerpPreviewTool: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI Google SERP Preview & Optimizer" 
            description="Preview your SERP snippet and get AI-powered recommendations to improve it via OpenRouter (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI service (OpenRouter) for SERP preview optimization, which is currently not supported with the active API."
        />
    );
};

export default GoogleSerpPreviewTool;