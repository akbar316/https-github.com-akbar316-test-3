// FIX: Created placeholder component for AI PDF to Excel Converter, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const PdfToExcelConverter: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI PDF to Excel Converter" 
            description="Let AI extract tables from your PDF into a downloadable CSV file using OpenRouter (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI service (OpenRouter) for PDF to Excel conversion, which is currently not supported with the active API."
        />
    );
};

export default PdfToExcelConverter;