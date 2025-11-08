import React from 'react';
import { ToolPageLayout } from '../components/ToolPageLayout';

interface GenericAiUnavailableToolProps {
  title?: string;
  description?: string;
  unavailableMessage?: string;
}

const GenericAiUnavailableTool: React.FC<GenericAiUnavailableToolProps> = ({
  title = "Tool Unavailable",
  description = "This tool relies on an advanced AI model and is currently unavailable.",
  unavailableMessage = "This tool is currently unavailable as its core functionality relied on an AI feature that is no longer supported with the current API integration. We are working to restore or replace its functionality."
}) => {
  return (
    <ToolPageLayout
      title={title}
      description={description}
    >
      <div className="text-center bg-brand-bg p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-brand-primary mb-4">{title}</h2>
        <p className="text-brand-text-secondary">
          {unavailableMessage}
        </p>
      </div>
    </ToolPageLayout>
  );
};

export default GenericAiUnavailableTool;