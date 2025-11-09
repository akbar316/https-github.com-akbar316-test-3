import React, { useState } from 'react';
import PdfToolLayout from './PdfToolPlaceholder';
import { CopyButton } from '../../components/ToolPageLayout';
import { runReplicate } from '../../utils/openRouterApi';
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

const LLAVA_MODEL = 'yorickvp/llava-13b:b5f6212d032508382d61ff00469ddda3e32fd8a0e75dc39d8a419804d7271391';

const PdfOcr: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [outputText, setOutputText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const longDescription = (
        <>
            <p>
                Our Advanced AI PDF OCR (Optical Character Recognition) tool leverages Replicate's powerful multimodal AI to accurately extract text from scanned PDF documents and images. Unlike basic OCR, this tool focuses on preserving the original layout, structure, and context of the text, making the extracted content much more usable and editable. It's ideal for converting image-based PDFs, scanned documents, or photographs of text into searchable and selectable text.
            </p>
            <p>
                Whether you're digitizing old documents, extracting information from inaccessible files, or making scanned content editable, our AI-powered OCR provides a sophisticated solution.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Features</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>AI-Powered Accuracy:</strong> Uses Replicate to recognize text with high precision, even on challenging scans.</li>
                <li><strong>Layout Preservation:</strong> Attempts to maintain headings, paragraphs, and columns in the extracted text for better readability.</li>
                <li><strong>Multimodal Input:</strong> Processes PDF pages as images, allowing the AI to understand visual cues for layout and content.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">
                This tool extracts text from PDFs. For native PDF text extraction without AI, please use our "PDF to Text Converter" tool.
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
            
            const prompt = `You are an AI assistant specialized in Optical Character Recognition (OCR). Your task is to accurately extract all readable text from the provided PDF page image. Preserve the original document's layout, including headings, paragraphs, lists, and columns, as much as possible in the textual output. If there are tables, extract their content in a readable, structured text format. Respond only with the extracted text content.`;
            
            const output = await runReplicate(LLAVA_MODEL, {
                image: imageUrl,
                prompt: prompt,
            });
            
            const responseText = Array.isArray(output) ? output.join('') : String(output);
            setOutputText(responseText);

        } catch (e: any) {
            console.error(e);
            setError(`Failed to perform OCR using AI: ${e.message}`);
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
            {isProcessing ? <AiLoadingSpinner message="Performing OCR..." /> : 'Extract Text with AI'}
        </button>
    );

    const Output = (
        <div className="w-full h-full flex flex-col">
            {isProcessing && (
                <div className="m-auto">
                    <AiLoadingSpinner message="Recognizing text..." />
                </div>
            )}

            {!isProcessing && outputText !== null && (
                <>
                    <textarea
                        readOnly
                        value={outputText}
                        className="w-full flex-grow bg-brand-surface border-brand-border rounded-md p-4 font-mono text-sm"
                        placeholder="Extracted text will appear here..."
                    />
                    <div className="flex justify-end pt-4 gap-2">
                        <CopyButton textToCopy={outputText} />
                        <button onClick={() => {
                            const fileName = files[0]?.name.replace(/\.pdf$/i, '') || 'ocr_result';
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
                    {error ? <span className="text-red-500">{error}</span> : "Upload a scanned or image-based PDF to extract its text using AI-powered OCR."}
                </p>
            )}
        </div>
    );

    return (
        <PdfToolLayout
            title="AI PDF OCR (Text Recognition)"
            description="Extract text from scanned PDFs using AI, with layout preservation via Replicate."
            onFilesSelected={f => { setFiles(f); setOutputText(null); setError(null); }}
            selectedFiles={files}
            actionButton={ActionButton}
            output={Output}
            longDescription={longDescription}
        />
    );
};

export default PdfOcr;
