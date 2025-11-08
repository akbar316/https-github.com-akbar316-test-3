// FIX: Created placeholder component for AI Text to Image Concept, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const TextToImageGenerator: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI Text to Image Concept" 
            description="Create stunning textual descriptions for images from text prompts using OpenRouter (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI image generation service (OpenRouter) which is currently not supported with the active API."
        />
    );
};

export default TextToImageGenerator;