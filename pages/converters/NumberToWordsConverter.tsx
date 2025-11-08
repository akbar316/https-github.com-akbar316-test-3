import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';

const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion'];

const convertChunk = (num: number): string => {
    let str = '';
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const u = num % 10;

    if (h > 0) {
        str += units[h] + ' hundred ';
    }
    if (t === 1) {
        str += teens[u];
    } else if (t > 1) {
        str += tens[t] + (u > 0 ? '-' + units[u] : '');
    } else if (u > 0) {
        str += units[u];
    }
    return str.trim();
};

const numberToWordsEnglish = (num: number): string => {
    if (num === 0) return 'zero';
    if (num < 0) return 'minus ' + numberToWordsEnglish(Math.abs(num));

    const numStr = num.toFixed(2); // Handle up to two decimal places
    const [integerPart, decimalPart] = numStr.split('.');

    let words = '';
    let intVal = parseInt(integerPart, 10);

    if (intVal === 0) {
        words = 'zero';
    } else {
        let chunkIndex = 0;
        while (intVal > 0) {
            const chunk = intVal % 1000;
            if (chunk > 0) {
                const chunkWords = convertChunk(chunk);
                words = chunkWords + ' ' + scales[chunkIndex] + ' ' + words;
            }
            intVal = Math.floor(intVal / 1000);
            chunkIndex++;
        }
    }

    words = words.trim();

    if (decimalPart && parseInt(decimalPart, 10) > 0) {
        const decimalVal = parseInt(decimalPart, 10);
        words += ` and ${convertChunk(decimalVal)}`;
    }

    return words;
};


const NumberToWordsConverter: React.FC = () => {
    const [number, setNumber] = useState<string>('1234.56');
    const [words, setWords] = useState<string>('');

    const convertToWords = () => {
        const num = parseFloat(number);
        if (isNaN(num)) {
            setWords('Please enter a valid number.');
            return;
        }
        if (num > 999999999999999) { // Max safe integer for practical display
            setWords('Number is too large.');
            return;
        }
        setWords(numberToWordsEnglish(num));
    };
    
    const longDescription = (
      <>
        <p>
          Transform digits into descriptive text with our Number to Words Converter. This tool is an essential utility for financial professionals writing checks, educators teaching number concepts, and writers who need to spell out numbers in formal documents. Simply input any number, and the tool will provide an accurate and well-formatted text representation in English. This tool handles both integers and decimals with ease, making it a comprehensive solution for any number-to-text conversion need.
        </p>
        <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Features</h3>
        <ul className="list-disc list-inside space-y-2 mt-2">
          <li><strong>Standard Conversions:</strong> Converts numerical digits into their English word equivalents.</li>
          <li><strong>Decimal Support:</strong> Handles numbers with decimal points, converting them accurately.</li>
          <li><strong>Client-Side Processing:</strong> All conversions are performed directly in your browser, ensuring your data remains private and secure.</li>
        </ul>
      </>
    );
    
    return (
        <ToolPageLayout
            title="Number to Words Converter"
            description="Convert numbers to words in English."
            longDescription={longDescription}
        >
            <div className="max-w-xl mx-auto space-y-4">
                <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Enter a number..."
                    className="w-full p-3 bg-brand-bg border border-brand-border rounded-md text-lg"
                />

                <button
                    onClick={convertToWords}
                    className="w-full bg-brand-primary text-white py-2 rounded-md hover:bg-brand-primary-hover transition-colors"
                >
                    Convert to Words
                </button>

                <div className="p-4 bg-brand-bg border border-brand-border rounded-md min-h-[6rem]">
                    <p className="text-lg capitalize">{words}</p>
                </div>
                 <div className="flex justify-end">
                    <CopyButton textToCopy={words} />
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default NumberToWordsConverter;