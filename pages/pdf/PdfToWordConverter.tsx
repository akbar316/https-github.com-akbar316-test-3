// FIX: Created placeholder component for AI PDF to Word Converter, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const PdfToWordConverter: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI PDF to Word Converter" 
            description="Let AI extract PDF content and layout into an editable format using OpenRouter (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI service (OpenRouter) for PDF to Word conversion, which is currently not supported with the active API."
        />
    );
};

export default PdfToWordConverter;