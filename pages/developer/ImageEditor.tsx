import React from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';
import GenericAiUnavailableTool from '../GenericAiUnavailableTool';

const ImageEditor: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI Image Stylizer" 
            description="Apply artistic styles and effects to your image concepts using text prompts (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI image generation service which is currently not supported with the active API."
        />
    );
};

export default ImageEditor;