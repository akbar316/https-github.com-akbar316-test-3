// FIX: Created placeholder component for AI PDF to PowerPoint Converter, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const PdfToPowerPointConverter: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI PDF to PowerPoint Converter" 
            description="Let AI analyze PDF content and structure it for presentations using OpenRouter (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI service (OpenRouter) for PDF to PowerPoint conversion, which is currently not supported with the active API."
        />
    );
};

export default PdfToPowerPointConverter;