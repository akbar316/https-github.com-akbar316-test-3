// FIX: Created placeholder component for AI PDF to HTML Converter, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const PdfToHtmlConverter: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI PDF to HTML Converter" 
            description="Use AI to convert your PDFs into structured HTML files using OpenRouter (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI service (OpenRouter) for PDF to HTML conversion, which is currently not supported with the active API."
        />
    );
};

export default PdfToHtmlConverter;