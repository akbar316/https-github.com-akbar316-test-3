import React, { useState } from 'react';
import PdfToolLayout from './PdfToolPlaceholder';
import { CopyButton } from '../../components/ToolPageLayout';
import { callOpenRouterApi, fileToImageUrlContent, OpenRouterMessage } from '../../utils/openRouterApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';

// --- DYNAMIC LIBRARY LOADING ---
declare global {
    interface Window {
        pdfjsLib: any;
    }
}
const loadPdfJs = async () => {
    if (window.pdfjsLib) return window.pdfjsLib;
    const pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
    window.pdfjsLib = pdfjs;
    return window.pdfjsLib;
};
// --- END DYNAMIC LIBRARY LOADING ---

const PdfToHtmlConverter: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [outputHtml, setOutputHtml] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const longDescription = (
        <>
            <p>
                Our AI PDF to HTML Converter utilizes OpenRouter's multimodal AI to intelligently transform your PDF documents into structured HTML. This tool analyzes the visual and textual content of your PDF pages and generates an HTML string that attempts to preserve the layout, headings, paragraphs, and other elements, making it suitable for web display or further editing in a web development environment. It's an invaluable resource for web developers, content creators, and anyone needing to convert PDF content into a web-friendly format.
            </p>
            <p>
                By using AI to interpret the document, it aims to create more semantically correct and editable HTML than traditional converters.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Features</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>AI-Powered Conversion:</strong> Uses OpenRouter to interpret PDF content and generate corresponding HTML.</li>
                <li><strong>Structured HTML Output:</strong> Aims to create clean HTML with appropriate tags for headings, paragraphs, and lists.</li>
                <li><strong>Multimodal Analysis:</strong> Converts PDF pages into images for AI processing, allowing for better interpretation of layout and visual elements.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">
                This tool provides a textual HTML representation of your PDF content. It does not generate an actual .html file.
            </p>
        </>
    );

    const handleProcess = async () => {
        if (files.length === 0) {
            setError('Please upload a PDF file.');
            return;
        }
        setIsProcessing(true);
        setOutputHtml(null);
        setError(null);

        try {
            const pdfjs = await loadPdfJs();
            const arrayBuffer = await files[0].arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

            const images: { type: 'image_url', image_url: { url: string, detail?: 'low' | 'high' } }[] = [];
            for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) { // Process first 3 pages as images for AI
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.0 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const context = canvas.getContext('2d');
                if (!context) throw new Error("Could not get canvas context");

                await page.render({ canvasContext: context, viewport: viewport }).promise;
                const imageUrl = canvas.toDataURL('image/jpeg');
                images.push({ type: 'image_url', image_url: { url: imageUrl, detail: 'low' } });
            }

            const messages: OpenRouterMessage[] = [
                {
                    role: 'system',
                    content: 'You are an AI assistant that converts PDF content and layout into structured HTML. Analyze the provided PDF (via images) and generate clean HTML with appropriate tags for headings, paragraphs, lists, and potentially simple tables. Focus on preserving the visual hierarchy and content flow. Respond only with the HTML string, including basic HTML, head, and body tags.',
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Convert this PDF into a structured HTML string. Here are up to the first 3 pages as images:' },
                        ...images
                    ],
                },
            ];

            const response = await callOpenRouterApi({
                model: 'google/gemini-pro',
                messages: messages,
                temperature: 0.6,
                max_tokens: 3000,
            });

            const responseText = response.choices?.[0]?.message?.content || '';
            setOutputHtml(responseText);

        } catch (e: any) {
            console.error(e);
            setError(`Failed to convert PDF to HTML using AI: ${e.message}`);
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
            {isProcessing ? <AiLoadingSpinner message="Analyzing PDF..." /> : 'Convert with AI'}
        </button>
    );

    const Output = (
        <div className="w-full h-full flex flex-col">
            {isProcessing && (
                <div className="m-auto">
                    <AiLoadingSpinner message="Generating HTML..." />
                </div>
            )}

            {!isProcessing && outputHtml !== null && (
                <>
                    <textarea
                        readOnly
                        value={outputHtml}
                        className="w-full flex-grow bg-brand-surface border-brand-border rounded-md p-4 font-mono text-sm"
                        placeholder="Generated HTML will appear here..."
                    />
                    <div className="flex justify-end pt-4 gap-2">
                        <CopyButton textToCopy={outputHtml} />
                        <button onClick={() => {
                            const fileName = files[0]?.name.replace(/\.pdf$/i, '') || 'converted';
                            const blob = new Blob([outputHtml], { type: 'text/html' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${fileName}.html`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium">Download .html</button>
                    </div>
                </>
            )}

            {!isProcessing && outputHtml === null && (
                <p className="m-auto text-brand-text-secondary text-center">
                    {error ? <span className="text-red-500">{error}</span> : "Upload a PDF to convert its content and layout into structured HTML using AI."}
                </p>
            )}
        </div>
    );

    return (
        <PdfToolLayout
            title="AI PDF to HTML Converter"
            description="Use AI to convert your PDFs into structured HTML files using OpenRouter."
            onFilesSelected={f => { setFiles(f); setOutputHtml(null); setError(null); }}
            selectedFiles={files}
            actionButton={ActionButton}
            output={Output}
            longDescription={longDescription}
        />
    );
};

export default PdfToHtmlConverter;