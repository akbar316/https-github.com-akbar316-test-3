import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';

const CssMinifier: React.FC = () => {
    const [cssInput, setCssInput] = useState('/* Main button style */\n.button {\n  color: #ffffff;\n  background-color: #007bff;\n  padding: 10px 20px;\n  border-radius: 5px;\n}\n\n.button:hover {\n    background-color: #0056b3;\n}');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const minify = () => {
        setOutput('');
        setError('');
        try {
            const result = cssInput
                .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
                .replace(/\s+/g, ' ') // collapse whitespace
                .replace(/\s*([{}:;,])\s*/g, '$1') // remove space around operators
                .replace(/;}/g, '}') // remove last semicolon in a block
                .trim();
            setOutput(result);
        } catch (e: any) {
            setError('Failed to minify CSS.');
        }
    };
    
    const longDescription = (
      <>
        <p>
          Enhance your website's performance and maintainability with our CSS Minifier. This tool is an essential utility for front-end developers aiming to write clean, efficient, and fast-loading stylesheets. It offers powerful modes to handle your CSS code. The "Minify" function provides a quick and effective way to reduce file size by stripping out all comments, extra whitespace, and unnecessary characters. This results in a smaller CSS file that browsers can download and parse more quickly, directly improving your site's loading speed and user experience.
        </p>
        <p className="text-sm text-brand-text-secondary mt-4">AI-powered optimization is currently unavailable.</p>
      </>
    );

    return (
        <ToolPageLayout
            title="CSS Minifier"
            description="Minify your CSS code to reduce file size."
            longDescription={longDescription}
        >
            <div className="space-y-4">
                 <div className="flex flex-wrap justify-center items-center gap-4">
                    <button onClick={minify} className="bg-brand-primary text-white px-6 py-2 rounded-md hover:bg-brand-primary-hover transition-colors">
                        Minify
                    </button>
                    <CopyButton textToCopy={output} />
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea
                        value={cssInput}
                        onChange={(e) => setCssInput(e.target.value)}
                        placeholder="Paste your CSS code here..."
                        className="w-full h-96 p-4 bg-brand-bg border border-brand-border rounded-md font-mono text-sm"
                    />
                    <textarea
                        readOnly
                        value={output}
                        placeholder="Minified CSS will appear here..."
                        className="w-full h-96 p-4 bg-brand-bg border border-brand-border rounded-md font-mono text-sm"
                    />
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default CssMinifier;