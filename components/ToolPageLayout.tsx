import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ToolCard from './ToolCard';
import type { Tool } from '../types';

interface ToolPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  longDescription?: React.ReactNode;
}

export const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({ title, description, children, longDescription }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [relatedTools, setRelatedTools] = useState<Tool[]>([]);

  useEffect(() => {
    let isMounted = true;
    // Dynamically import tools to break circular dependency
    import('../utils/tools').then(({ tools }) => {
        if (!isMounted) return;

        const currentTool = tools.find(tool => tool.path === currentPath);
        if (!currentTool) {
            setRelatedTools([]);
            return;
        }
        
        const sameCategoryTools = tools.filter(
          tool => tool.category === currentTool.category && tool.path !== currentPath
        );
        
        const shuffled = sameCategoryTools.sort(() => 0.5 - Math.random());
        setRelatedTools(shuffled.slice(0, 4));
    });

    return () => { isMounted = false; };
  }, [currentPath]);


  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-primary mb-2">{title}</h1>
        <p className="text-lg text-brand-text-secondary">{description}</p>
      </header>
      <div className="bg-brand-surface p-6 sm:p-8 rounded-lg shadow-xl">
        {children}
      </div>

      {longDescription && (
        <section className="bg-brand-surface p-6 sm:p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold text-brand-primary mb-4">About the {title}</h2>
          <div className="prose prose-invert max-w-none text-brand-text-secondary">
            {longDescription}
          </div>
        </section>
      )}

      {relatedTools.length > 0 && (
        <section className="pt-8 mt-8 border-t border-brand-border">
          <h2 className="text-2xl font-bold text-center text-brand-text-primary mb-6">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedTools.map(tool => (
              <ToolCard key={tool.path} tool={tool} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// A reusable copy button component for tool pages
interface CopyButtonProps {
    textToCopy: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-hover transition-colors text-sm font-medium disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={!textToCopy}
        >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
    );
};
