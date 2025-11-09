import React, { useState } from 'react';
import PdfToolLayout from './PdfToolPlaceholder';
import { CopyButton } from '../../components/ToolPageLayout';
import { runGeminiVisionWithDataUrl } from '../../utils/geminiApi';
import AiLoadingSpinner from '../../components/AiLoadingSpinner';
import { useApiKey } from '../../context/ApiKeyContext';

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

const PdfToWordConverter: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [outputText, setOutputText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { invalidateApiKey } = useApiKey();

    const longDescription = (
        <>
            <p>
                Our AI PDF to Word Converter leverages the Google Gemini API to analyze your PDF documents and generate an editable text format, simulating a Word document. Instead of a direct file conversion, this tool provides a detailed textual output that captures the content and layout, making it easy to reconstruct or use in a word processor. It's ideal for extracting complex information, tables, or formatted text that traditional PDF to text converters might struggle with.
            </p>
            <p>
                By using AI, we aim to interpret the visual structure of your PDF, allowing you to get a comprehensive text representation that you can then easily adapt for Microsoft Word or other document editors.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Features</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>AI-Powered Content Extraction:</strong> Uses Gemini to understand and convert PDF content into a structured text format.</li>
                <li><strong>Layout Preservation (Textual):</strong> Attempts to preserve the original layout in the textual output, indicating sections, headings, and lists.</li>
                <li><strong>Multimodal Analysis:</strong> Converts PDF pages into images for AI processing, allowing for better interpretation of visual elements.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">
                This tool provides a textual representation of a PDF's content and layout. It does not generate an actual .docx file.
            </p>
        </>
    );

    const handleProcess = async () => {
        if (files.length === 0) {
            setError('Please upload a PDF file.');
            return;
        }
        setIsProcessing(true);
        setOutputText(null);
        setError(null);

        try {
            const pdfjs = await loadPdfJs();
            const arrayBuffer = await files[0].arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

            // Use the first page for analysis
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext('2d');
            if (!context) throw new Error("Could not get canvas context");
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const imageUrl = canvas.toDataURL('image/jpeg');
            
            const prompt = `You are an AI assistant that accurately converts PDF content and layout into a structured, editable text format suitable for a Word document. Analyze the provided image of a single PDF page and perform the conversion. Preserve headings, paragraphs, lists, and tabular data. Focus on readability and ease of editing. Respond only with the converted text content.`;

            const responseText = await runGeminiVisionWithDataUrl(prompt, imageUrl);
            setOutputText(responseText);

        } catch (e: any) {
            console.error(e);
            const errorMessage = e.message || 'Failed to convert PDF using AI.';
            if (errorMessage.includes("Requested entity was not found.")) {
                setError("API Key not found or invalid. Please select a valid API key.");
                invalidateApiKey();
            } else {
                setError(errorMessage);
            }
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
                    <AiLoadingSpinner message="Converting PDF content..." />
                </div>
            )}

            {!isProcessing && outputText !== null && (
                <>
                    <textarea
                        readOnly
                        value={outputText}
                        className="w-full flex-grow bg-brand-surface border-brand-border rounded-md p-4 font-mono text-sm"
                        placeholder="Converted content will appear here..."
                    />
                    <div className="flex justify-end pt-4 gap-2">
                        <CopyButton textToCopy={outputText} />
                        <button onClick={() => {
                            const fileName = files[0]?.name.replace(/\.pdf$/i, '') || 'converted';
                            const blob = new Blob([outputText], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${fileName}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium">Download .txt</button>
                    </div>
                </>
            )}

            {!isProcessing && outputText === null && (
                <p className="m-auto text-brand-text-secondary text-center">
                    {error ? <span className="text-red-500">{error}</span> : "Upload a PDF to convert its content and layout to an editable text format using AI."}
                </p>
            )}
        </div>
    );

    return (
        <PdfToolLayout
            title="AI PDF to Word Converter"
            description="Let AI extract PDF content and layout into an editable format using the Gemini API."
            onFilesSelected={f => { setFiles(f); setOutputText(null); setError(null); }}
            selectedFiles={files}
            actionButton={ActionButton}
            output={Output}
            longDescription={longDescription}
        />
    );
};

export default PdfToWordConverter;