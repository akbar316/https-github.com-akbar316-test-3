// FIX: Created placeholder component for AI Image Concept Generator, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const ImageGenerator: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI Image Concept Generator" 
            description="Generate detailed textual concepts for images based on prompts using OpenRouter (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI image generation service (OpenRouter) which is currently not supported with the active API."
        />
    );
};

export default ImageGenerator;