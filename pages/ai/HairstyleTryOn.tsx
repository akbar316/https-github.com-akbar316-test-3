// FIX: Replaced placeholder with component for AI Hairstyle Concept Generator, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const HairstyleTryOn: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI Hairstyle Concept Generator" 
            description="Generate textual concepts of people with different hairstyles and colors from an uploaded image using OpenRouter (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI image generation service (OpenRouter) which is currently not supported with the active API."
        />
    );
};

export default HairstyleTryOn;