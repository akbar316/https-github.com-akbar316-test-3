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

const PdfToPowerPointConverter: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [outputText, setOutputText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const longDescription = (
        <>
            <p>
                Our AI PDF to PowerPoint Converter leverages OpenRouter's advanced multimodal AI to analyze the content of your PDF and generate a structured textual outline suitable for a presentation. This tool helps you transform dense PDF documents into digestible presentation formats, identifying key topics, summarizing sections, and suggesting slide structures. It's an invaluable aid for students, educators, and business professionals who need to quickly create presentations from reports, research papers, or lengthy documents.
            </p>
            <p>
                The AI focuses on extracting the core message and organizing it logically, providing you with a solid foundation to build your visual slides upon.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Features</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>AI-Powered Content Structuring:</strong> Uses OpenRouter to analyze PDF content and suggest a presentation flow.</li>
                <li><strong>Textual Outline:</strong> Generates a text-based presentation outline, including potential slide titles and bullet points.</li>
                <li><strong>Multimodal Analysis:</strong> Converts PDF pages into images for AI processing, allowing for better interpretation of visual layout and emphasis.</li>
            </ul>
            <p className="text-sm text-brand-text-secondary mt-4">
                This tool provides a textual outline of a presentation based on your PDF content. It does not generate an actual .pptx file.
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
                    content: 'You are an AI assistant specialized in converting PDF content into structured presentation outlines. Analyze the provided PDF (via images) and extract key topics, main points, and supporting details. Organize this into a logical presentation flow, suggesting slide titles and bullet points. Respond only with the presentation outline in a clear, text-based format.',
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this PDF and generate a textual presentation outline (like a PowerPoint outline). Here are up to the first 3 pages as images:' },
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
            setError(`Failed to create presentation outline using AI: ${e.message}`);
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
            {isProcessing ? <AiLoadingSpinner message="Analyzing PDF..." /> : 'Generate Outline with AI'}
        </button>
    );

    const Output = (
        <div className="w-full h-full flex flex-col">
            {isProcessing && (
                <div className="m-auto">
                    <AiLoadingSpinner message="Structuring presentation..." />
                </div>
            )}

            {!isProcessing && outputText !== null && (
                <>
                    <textarea
                        readOnly
                        value={outputText}
                        className="w-full flex-grow bg-brand-surface border-brand-border rounded-md p-4 font-mono text-sm"
                        placeholder="Presentation outline will appear here..."
                    />
                    <div className="flex justify-end pt-4 gap-2">
                        <CopyButton textToCopy={outputText} />
                        <button onClick={() => {
                            const fileName = files[0]?.name.replace(/\.pdf$/i, '') || 'presentation_outline';
                            const blob = new Blob([outputText], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${fileName}.txt`; // Download as TXT for now
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
                    {error ? <span className="text-red-500">{error}</span> : "Upload a PDF to get an AI-generated presentation outline."}
                </p>
            )}
        </div>
    );

    return (
        <PdfToolLayout
            title="AI PDF to PowerPoint Converter"
            description="Let AI analyze PDF content and structure it for presentations using OpenRouter."
            onFilesSelected={f => { setFiles(f); setOutputText(null); setError(null); }}
            selectedFiles={files}
            actionButton={ActionButton}
            output={Output}
            longDescription={longDescription}
        />
    );
};

export default PdfToPowerPointConverter;