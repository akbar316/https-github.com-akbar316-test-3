// FIX: Created placeholder component for AI Keyword Research Tool, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const KeywordResearchTool: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI Keyword Research Tool" 
            description="Get AI-driven insights including search intent, difficulty, volume, and CPC via OpenRouter (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI service (OpenRouter) for keyword research, which is currently not supported with the active API."
        />
    );
};

export default KeywordResearchTool;