import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';

const TreeView: React.FC<{ data: any }> = ({ data }) => {
    const renderNode = (key: string, value: any, path: string) => {
        const [isExpanded, setIsExpanded] = useState(true);
        const isObject = typeof value === 'object' && value !== null;

        return (
            <div key={path} className="ml-4">
                <div className="flex items-center">
                    {isObject && (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="mr-1 text-sm w-4">
                            {isExpanded ? '▼' : '►'}
                        </button>
                    )}
                    <span className="text-purple-400">{key}:</span>
                    {!isObject && <span className="ml-2 text-green-400">{JSON.stringify(value)}</span>}
                </div>
                {isObject && isExpanded && (
                    <div className="border-l border-gray-600 pl-2">
                        {Object.entries(value).map(([childKey, childValue]) =>
                            renderNode(childKey, childValue, `${path}.${childKey}`)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="font-mono text-sm bg-brand-bg p-4 rounded-md h-96 overflow-auto">
            {Object.entries(data).map(([key, value]) => renderNode(key, value, key))}
        </div>
    );
};

const JsonFormatter: React.FC = () => {
    const [jsonInput, setJsonInput] = useState('{"name":"DiceTools","version":1,"features":["formatter","validator"]}');
    const [activeTab, setActiveTab] = useState<'format' | 'tree'>('format');
    const [error, setError] = useState('');
    
    // Format tab
    const [formattedJson, setFormattedJson] = useState('');
    
    const handleAction = (action: 'format' | 'minify') => {
        if (!jsonInput.trim()) {
            setError('JSON input cannot be empty.');
            setFormattedJson('');
            return;
        }
        try {
            const parsed = JSON.parse(jsonInput);
            setFormattedJson(JSON.stringify(parsed, null, action === 'format' ? 2 : undefined));
            setError('');
        } catch (e) {
            setError('Invalid JSON format. Please check your input.');
            setFormattedJson('');
        }
    };
    
    let parsedJson: any = null;
    try {
        parsedJson = JSON.parse(jsonInput);
    } catch(e) {
        // ignore for tree view
    }
    
    const longDescription = (
      <>
        <p>
          The JSON Toolkit is an all-in-one solution for developers working with JSON data. This multi-functional tool provides a comprehensive suite of utilities to validate, visualize, and format your JSON. Whether you're debugging an API response, preparing data for a database, or simply trying to understand a complex data structure, this toolkit has you covered. The tab-based interface allows you to seamlessly switch between different functionalities. It’s an indispensable utility for streamlining your development workflow and managing JSON data with efficiency and power.
        </p>
        <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">A Full-Featured JSON Environment</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Format & Minify:</strong> Instantly beautify your JSON for readability or minify it to reduce file size. The tool also validates your JSON structure, highlighting any errors.</li>
          <li><strong>Tree View:</strong> Visualize your JSON in a collapsible tree structure, making it easy to navigate and understand complex, nested objects and arrays.</li>
        </ul>
      </>
    );

    return (
        <ToolPageLayout
            title="JSON Toolkit"
            description="Format, validate, and view your JSON data."
            longDescription={longDescription}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="Paste your JSON here..."
                        className={`w-full h-[30rem] p-4 bg-brand-bg border rounded-md focus:outline-none focus:ring-2 font-mono text-sm ${error ? 'border-red-500 focus:ring-red-500' : 'border-brand-border focus:ring-brand-primary'}`}
                    />
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </div>
                <div className="space-y-2">
                    <div className="flex border-b border-brand-border">
                        {(['format', 'tree'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-semibold text-sm capitalize ${activeTab === tab ? 'border-b-2 border-brand-primary text-brand-text-primary' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}>{tab}</button>
                        ))}
                    </div>
                    <div className="h-[30rem] overflow-auto">
                        {activeTab === 'format' && (
                            <div className="space-y-2">
                                <textarea readOnly value={formattedJson} placeholder="Formatted JSON will appear here..." className="w-full h-96 p-4 bg-brand-bg border border-brand-border rounded-md font-mono text-sm"/>
                                <div className="flex flex-wrap justify-center items-center gap-4">
                                    <button onClick={() => handleAction('format')} className="bg-brand-primary text-white px-4 py-2 rounded-md">Format</button>
                                    <button onClick={() => handleAction('minify')} className="bg-sky-600 text-white px-4 py-2 rounded-md">Minify</button>
                                    <CopyButton textToCopy={formattedJson} />
                                </div>
                            </div>
                        )}
                        {activeTab === 'tree' && (parsedJson ? <TreeView data={parsedJson} /> : <p className="p-4 text-center text-brand-text-secondary">Invalid JSON for Tree View.</p>)}
                    </div>
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default JsonFormatter;