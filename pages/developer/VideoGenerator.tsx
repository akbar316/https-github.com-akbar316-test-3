import React from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';
import GenericAiUnavailableTool from '../GenericAiUnavailableTool';

const VideoGenerator: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI Video Generator" 
            description="Create high-quality videos from text prompts or images (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI video generation service which is currently not supported with the active API."
        />
    );
};

export default VideoGenerator;