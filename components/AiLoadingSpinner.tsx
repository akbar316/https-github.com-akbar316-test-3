import React from 'react';

interface AiLoadingSpinnerProps {
    message?: string;
}

const AiLoadingSpinner: React.FC<AiLoadingSpinnerProps> = ({ message = 'Processing with AI...' }) => (
    <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
        <span>{message}</span>
    </div>
);

export default React.memo(AiLoadingSpinner);