import React, { useState } from 'react';
import PdfToolLayout from './PdfToolPlaceholder';
import { callOpenRouterApi, fileToImageUrlContent } from '../../utils/openRouterApi';

const createAndDownloadBlob = (content: string, fileName: string, mimeType: string) => {
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

const jsonToCsv = (tables: {tableName: string, tableData: string[][]}[]): string => {
    if (!tables || tables.length === 0) return '';
    
    let csvContent = '';
    
    tables.forEach((table, index) => {
        if (index > 0) {
            csvContent += '\n\n'; // Add spacing between tables
        }
        csvContent += `Table: ${table.tableName}\n`;
        
        table.tableData.forEach(rowArray => {
            const row = rowArray.map(cell => {
                const stringCell = String(cell);
                // Escape quotes by doubling them
                let escaped = stringCell.replace(/"/g, '""');
                // If the cell contains a comma, newline, or quote, enclose it in quotes
                if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
                    escaped = `"${escaped}"`;
                }
                return escaped;
            }).join(',');
            csvContent += row + '\r\n';
        });
    });

    return csvContent;
}

const PdfToExcelConverter: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [outputCsv, setOutputCsv] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const longDescription = (
      <>
        <p>
          Transform your data-rich PDFs into fully functional Excel spreadsheets with our intelligent AI-powered PDF to Excel Converter. Say goodbye to manual data entry and tedious copy-pasting. This powerful tool is specifically designed to recognize and accurately extract tabular data from your PDF files, no matter how complex the structure. Our advanced AI algorithms meticulously identify rows, columns, and individual cells, preserving the integrity of your data throughout the conversion process. It's the perfect solution for financial reports, inventory lists, academic research data, and any document where information is organized in tables.
        </p>
        <p>
          The resulting CSV file is universally compatible with Microsoft Excel, Google Sheets, and other spreadsheet software, allowing you to immediately sort, filter, and analyze your data. Unlock valuable insights locked away in your PDFs and streamline your data workflow with this fast, secure, and incredibly precise conversion tool. Your data privacy is paramount, with all processing handled securely.
        </p>
      </>
    );

    const handleProcess = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        setOutputCsv(null);
        setError(null);
        
        try {
            const imageContentPart = await fileToImageUrlContent(files[0]);

            const prompt = "Analyze the provided PDF image. Identify all tables across all pages. Extract the data from each table. For each table, provide a descriptive name and the data as a two-dimensional array of strings, where each inner array represents a row.";

            const response = await callOpenRouterApi({
                model: 'google/gemini-pro-1.5', // OpenRouter model for complex tasks
                messages: [{ 
                    role: 'user', 
                    content: [
                        imageContentPart,
                        { type: 'text', text: prompt }
                    ]
                }],
                temperature: 0.2, // Lower temperature for more consistent data extraction
                response_format: { type: 'json_object' }
            });
            
            // Ensure responseText is a string by extracting text content from message.content
            const responseText = Array.isArray(response.choices?.[0]?.message?.content)
                ? response.choices[0].message.content.filter(part => part.type === 'text').map(part => (part as {type: 'text', text: string}).text).join('')
                : response.choices?.[0]?.message?.content || '';

            if (responseText) {
                 const result = JSON.parse(responseText);
                if (result.tables && result.tables.length > 0) {
                    const csv = jsonToCsv(result.tables);
                    setOutputCsv(csv);
                } else {
                    setError("No tables were found in the document by the AI.");
                }
            } else {
                setError("No data could be extracted from the document.");
            }

        } catch (e: any) {
             console.error(e);
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
            {isProcessing ? 'Extracting Tables...' : 'Convert to Excel (CSV)'}
        </button>
    );

    const Output = (
        <div className="w-full h-full flex flex-col items-center justify-center">
            {isProcessing && (
                <div className="text-center text-brand-text-secondary">
                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
                     <p>AI is finding tables in your PDF...</p>
                </div>
            )}
            
            {!isProcessing && outputCsv && (
                <div className="w-full text-center space-y-4">
                  <h3 className="font-semibold text-lg text-brand-text-primary">Extraction Complete!</h3>
                  <textarea readOnly value={outputCsv} className="w-full h-48 bg-brand-surface p-2 rounded-md font-mono text-xs"></textarea>
                  <button onClick={() => createAndDownloadBlob(outputCsv, files[0].name.replace(/\.pdf$/i, '.csv'), 'text/csv')} className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 font-semibold">
                      Download CSV File
                  </button>
                </div>
            )}
            
            {!isProcessing && !outputCsv && (
                <p className="text-brand-text-secondary text-center">
                    {error ? <span className="text-red-500">{error}</span> : "Upload a PDF containing tables to extract data into a CSV file, compatible with Excel."}
                </p>
            )}
        </div>
    );
  
    return (
        <PdfToolLayout
            title="PDF to Excel Converter"
            description="Let AI extract tables from your PDF into a downloadable CSV file."
            onFilesSelected={f => { setFiles(f); setOutputCsv(null); setError(null); }}
            selectedFiles={files}
            actionButton={ActionButton}
            output={Output}
            longDescription={longDescription}
        />
    );
};

export default PdfToExcelConverter;