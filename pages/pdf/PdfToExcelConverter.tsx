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

const PdfToExcelConverter: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [outputText, setOutputText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const longDescription = (
        <>
            <p>
                Our AI PDF to Excel Converter utilizes OpenRouter's advanced multimodal AI capabilities to intelligently identify and extract tabular data from your PDF documents. Instead of a direct file conversion, this tool provides a structured CSV (Comma Separated Values) output, which can be easily imported into Microsoft Excel, Google Sheets, or any other spreadsheet software. It's designed to handle complex tables, even those with irregular formatting, and convert them into a clean, editable spreadsheet format.
            </p>
            <p>
                This tool is invaluable for data analysts, researchers, and business professionals who frequently need to extract numerical data from reports, invoices, or financial statements locked within PDF files.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Features</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>AI-Powered Table Extraction:</strong> Uses OpenRouter to accurately detect and extract tables from PDF pages.</li>
                <li><strong>CSV Output:</strong> Provides the extracted data in a universally compatible CSV format, ready for spreadsheet applications.</li>
                <li><strong>Multimodal Analysis:</strong> Converts PDF pages into images for AI processing, allowing for better interpretation of visual table structures.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">
                This tool provides a textual CSV representation of a PDF's tabular data. It does not generate an actual .xlsx file.
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
                    content: 'You are an AI assistant that extracts tabular data from PDFs and converts it into a CSV string. Identify all tables and represent their content accurately in a comma-separated format. For multiple tables, provide each as a separate CSV block. Respond only with the CSV content. If no tables are found, respond with "No tables found."',
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Extract all tables from this PDF and provide the data in CSV format. Here are up to the first 3 pages as images:' },
                        ...images
                    ],
                },
            ];

            const response = await callOpenRouterApi({
                model: 'google/gemini-pro',
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000,
            });

            const responseText = response.choices?.[0]?.message?.content || '';
            setOutputText(responseText);

        } catch (e: any) {
            console.error(e);
            setError(`Failed to extract tables using AI: ${e.message}`);
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
            {isProcessing ? <AiLoadingSpinner message="Extracting tables..." /> : 'Convert with AI'}
        </button>
    );

    const Output = (
        <div className="w-full h-full flex flex-col">
            {isProcessing && (
                <div className="m-auto">
                    <AiLoadingSpinner message="Converting to CSV..." />
                </div>
            )}

            {!isProcessing && outputText !== null && (
                <>
                    <textarea
                        readOnly
                        value={outputText}
                        className="w-full flex-grow bg-brand-surface border-brand-border rounded-md p-4 font-mono text-sm"
                        placeholder="Converted CSV will appear here..."
                    />
                    <div className="flex justify-end pt-4 gap-2">
                        <CopyButton textToCopy={outputText} />
                        <button onClick={() => {
                            const fileName = files[0]?.name.replace(/\.pdf$/i, '') || 'converted_tables';
                            const blob = new Blob([outputText], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${fileName}.csv`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium">Download .csv</button>
                    </div>
                </>
            )}

            {!isProcessing && outputText === null && (
                <p className="m-auto text-brand-text-secondary text-center">
                    {error ? <span className="text-red-500">{error}</span> : "Upload a PDF to extract its tabular data into CSV format using AI."}
                </p>
            )}
        </div>
    );

    return (
        <PdfToolLayout
            title="AI PDF to Excel Converter"
            description="Let AI extract tables from your PDF into a downloadable CSV file using OpenRouter."
            onFilesSelected={f => { setFiles(f); setOutputText(null); setError(null); }}
            selectedFiles={files}
            actionButton={ActionButton}
            output={Output}
            longDescription={longDescription}
        />
    );
};

export default PdfToExcelConverter;