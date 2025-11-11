import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';

const JsMinifier: React.FC = () => {
    const [jsInput, setJsInput] = useState('// This is a sample function\nfunction sayHello(name) {\n    const greeting = "Hello, " + name + "!";\n    console.log(greeting); // Log to console\n    return greeting;\n}');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const cleanCode = () => {
        setOutput('');
        setError('');
        try {
            const result = jsInput
                .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // remove comments
                .replace(/console\.\w+\(.*\);?/g, '') // remove console logs
                .replace(/\s+/g, ' ') // collapse whitespace
                .replace(/\s*([;:{},()=\[\]])\s*/g, '$1') // remove space around operators
                .trim();
            setOutput(result);
        } catch (e: any) {
            setError('Failed to clean JS.');
        }
    };
    
    const longDescription = (
      <>
        <p>
          Optimize your JavaScript with our JS Cleaner. This powerful tool is designed for web developers who want to prepare their code for production environments. It offers distinct functionalities to enhance your scripts. The "Clean Code" feature acts as a simple minifier, stripping out all comments and console log statements, and collapsing unnecessary whitespace. This process reduces the file size of your scripts, leading to faster page load times and improved performance for your users. It's an essential step in any deployment pipeline for creating lean, efficient code.
        </p>
      </>
    );

    return (
        <ToolPageLayout
            title="JS Cleaner"
            description="Clean your JavaScript by removing comments and logs."
            longDescription={longDescription}
        >
             <div className="space-y-4">
                <div className="flex flex-wrap justify-center items-center gap-4">
                    <button onClick={cleanCode} className="bg-brand-primary text-white px-6 py-2 rounded-md hover:bg-brand-primary-hover transition-colors">
                        Clean Code
                    </button>
                    <CopyButton textToCopy={output} />
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea
                        value={jsInput}
                        onChange={(e) => setJsInput(e.target.value)}
                        placeholder="Paste your JavaScript code here..."
                        className="w-full h-96 p-4 bg-brand-bg border border-brand-border rounded-md font-mono text-sm"
                    />
                    <textarea
                        readOnly
                        value={output}
                        placeholder="Output code will appear here..."
                        className="w-full h-96 p-4 bg-brand-bg border border-brand-border rounded-md font-mono text-sm"
                    />
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default JsMinifier;