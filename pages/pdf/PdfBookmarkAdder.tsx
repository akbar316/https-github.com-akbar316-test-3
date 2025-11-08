import React, { useState } from 'react';
import PdfToolLayout from './PdfToolPlaceholder';
import { CopyButton } from '../../components/ToolPageLayout';
import { callOpenRouterApi, fileToImageUrlContent } from '../../utils/openRouterApi';

const createAndDownloadBlob = (content: string, fileName: string, mimeType: string) => {
    if (!content) return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const PdfBookmarkAdder: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [toc, setToc] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleProcess = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        setToc(null);
        setError('');
        
        try {
            const imageContentPart = await fileToImageUrlContent(files[0]);

            const prompt = `Act as an expert document analyst. Analyze the provided PDF image and generate a detailed table of contents. Identify all major sections, chapters, and sub-headings, and list them with their corresponding page numbers. Format the output as a clean, indented, plain text list. For example:
Introduction...........1
Chapter 1: The Beginning...........5
  1.1 First Steps...........7
  1.2 New Discoveries...........12
Chapter 2: The Middle...........20`;
            
            const response = await callOpenRouterApi({
                model: 'google/gemini-pro-1.5', // OpenRouter model for complex tasks
                messages: [{ 
                    role: 'user', 
                    content: [
                        imageContentPart,
                        { type: 'text', text: prompt }
                    ]
                }],
                temperature: 0.7,
            });

            // Ensure responseText is a string by extracting text content from message.content
            const responseText = Array.isArray(response.choices?.[0]?.message?.content)
                ? response.choices[0].message.content.filter(part => part.type === 'text').map(part => (part as {type: 'text', text: string}).text).join('')
                : response.choices?.[0]?.message?.content || '';

            if (responseText) {
                setToc(responseText);
            } else {
                setError('No table of contents could be generated from the document.');
            }

        } catch (e: any) {
             setError(`An AI error occurred: ${e.message || 'Could not process document. The file might be too large or complex for the AI to handle.'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const ActionButton = (
        <button
            onClick={handleProcess}
            disabled={files.length === 0 || isProcessing}
            className="w-full bg-brand-primary text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-brand-primary-hover transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            {isProcessing ? 'Analyzing Document...' : 'Generate Table of Contents with AI'}
        </button>
    );

    const Output = (
        <div className="w-full h-full flex flex-col items-center justify-center">
            {isProcessing && (
                <div className="text-center text-brand-text-secondary">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                    <p>AI is reading your document...</p>
                </div>
            )}
            
            {!isProcessing && toc && (
                <div className="w-full h-full flex flex-col">
                    <h3 className="font-semibold text-lg text-brand-text-primary text-center mb-2">Generated Table of Contents</h3>
                    <textarea readOnly value={toc} className="w-full flex-grow bg-brand-surface p-4 rounded-md font-mono text-sm" />
                    <div className="flex justify-end pt-4 gap-2">
                        <button onClick={() => createAndDownloadBlob(toc, `toc_${files[0].name}.txt`, 'text/plain')} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium">Download .txt</button>
                        <CopyButton textToCopy={toc} />
                    </div>
                </div>
            )}
            
            {!isProcessing && !toc && (
                 <p className="text-brand-text-secondary text-center">
                    {error ? <span className="text-red-500">{error}</span> : "Upload a PDF and let AI generate a table of contents for you. Note: This adds a text ToC, not embedded PDF bookmarks."}
                </p>
            )}
        </div>
    );

    return (
        <PdfToolLayout
            title="AI-Powered Table of Contents Generator"
            description="Automatically generate a table of contents for your PDF."
            onFilesSelected={f => { setFiles(f); setToc(null); setError(''); }}
            selectedFiles={files}
            actionButton={ActionButton}
            output={Output}
        />
    );
};

export default PdfBookmarkAdder;