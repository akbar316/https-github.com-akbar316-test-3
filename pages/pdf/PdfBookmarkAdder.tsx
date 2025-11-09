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

const PdfBookmarkAdder: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [outputText, setOutputText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { invalidateApiKey } = useApiKey();

    const longDescription = (
        <>
            <p>
                Our AI PDF Table of Contents Generator uses Google's advanced Gemini AI to analyze your PDF documents and automatically create a structured, text-based table of contents (TOC). This tool intelligently identifies headings, subheadings, and key sections within your document, then compiles them into a clear and organized list with corresponding page numbers. It's an invaluable asset for academic researchers, writers, and business professionals dealing with lengthy reports, e-books, or manuals.
            </p>
            <p>
                Instead of manually sifting through pages to build a TOC, simply upload your PDF, and our AI will do the heavy lifting, providing you with a ready-to-use outline that enhances navigation and readability.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Features</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>AI-Powered Structure Detection:</strong> Uses Gemini to identify hierarchical headings and sections within your PDF.</li>
                <li><strong>Text-Based Output:</strong> Generates a clean, readable text version of the table of contents, suitable for copy-pasting.</li>
                <li><strong>Multimodal Analysis:</strong> Converts PDF pages into images for AI processing, allowing for better interpretation of visual hierarchy and text size/style.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">
                This tool generates a text-based table of contents. It does not directly add interactive bookmarks to the PDF file.
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

            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext('2d');
            if (!context) throw new Error("Could not get canvas context");
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const imageUrl = canvas.toDataURL('image/jpeg');
            
            const prompt = `You are an AI assistant specialized in generating detailed table of contents from PDF documents. Analyze the provided image of a PDF page and identify all major headings and subheadings. Assume this is the first page and estimate page numbers. Structure the output as a clear, hierarchical list. Respond only with the generated table of contents text.`;

            const responseText = await runGeminiVisionWithDataUrl(prompt, imageUrl);
            setOutputText(responseText);

        } catch (e: any) {
            console.error(e);
            const errorMessage = e.message || 'Failed to generate table of contents using AI.';
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
            {isProcessing ? <AiLoadingSpinner message="Analyzing PDF structure..." /> : 'Generate TOC with AI'}
        </button>
    );

    const Output = (
        <div className="w-full h-full flex flex-col">
            {isProcessing && (
                <div className="m-auto">
                    <AiLoadingSpinner message="Creating table of contents..." />
                </div>
            )}

            {!isProcessing && outputText !== null && (
                <>
                    <textarea
                        readOnly
                        value={outputText}
                        className="w-full flex-grow bg-brand-surface border-brand-border rounded-md p-4 font-mono text-sm"
                        placeholder="Generated table of contents will appear here..."
                    />
                    <div className="flex justify-end pt-4 gap-2">
                        <CopyButton textToCopy={outputText} />
                        <button onClick={() => {
                            const fileName = files[0]?.name.replace(/\.pdf$/i, '') || 'table_of_contents';
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
                    {error ? <span className="text-red-500">{error}</span> : "Upload a PDF to get an AI-generated text-based table of contents."}
                </p>
            )}
        </div>
    );

    return (
        <PdfToolLayout
            title="AI PDF Table of Contents Generator"
            description="Automatically generate a text-based table of contents for your PDF using the Gemini API."
            onFilesSelected={f => { setFiles(f); setOutputText(null); setError(null); }}
            selectedFiles={files}
            actionButton={ActionButton}
            output={Output}
            longDescription={longDescription}
        />
    );
};

export default PdfBookmarkAdder;