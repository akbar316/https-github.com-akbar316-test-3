// FIX: Created placeholder component for AI PDF Table of Contents Generator, pointing to GenericAiUnavailableTool.
import React from 'react';
import GenericAiUnavailableTool from '../../pages/GenericAiUnavailableTool';

const PdfBookmarkAdder: React.FC = () => {
    return (
        <GenericAiUnavailableTool 
            title="AI PDF Table of Contents Generator" 
            description="Automatically generate a text-based table of contents for your PDF using OpenRouter (Currently Unavailable)."
            unavailableMessage="This tool relies on an external AI service (OpenRouter) for generating a table of contents, which is currently not supported with the active API."
        />
    );
};

export default PdfBookmarkAdder;