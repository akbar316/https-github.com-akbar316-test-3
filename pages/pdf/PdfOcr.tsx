// FIX: Created placeholder component for AI PDF OCR, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const PdfOcr: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI PDF OCR (Text Recognition)" 
            description="Extract text from scanned PDFs using AI, with layout preservation via OpenRouter (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI OCR service (OpenRouter) which is currently not supported with the active API."
        />
    );
};

export default PdfOcr;