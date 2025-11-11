import React, { useState } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';

type Base = 'bin' | 'oct' | 'dec' | 'hex';

const baseConfig = {
    bin: { name: 'Binary', base: 2, regex: /^[01]*$/ },
    oct: { name: 'Octal', base: 8, regex: /^[0-7]*$/ },
    dec: { name: 'Decimal', base: 10, regex: /^[0-9]*$/ },
    hex: { name: 'Hexadecimal', base: 16, regex: /^[0-9a-f]*$/i },
};


const NumberBaseConverter: React.FC = () => {
    const [values, setValues] = useState<Record<Base, string>>({ bin: '', oct: '', dec: '', hex: '' });
    const [error, setError] = useState('');

    const handleValueChange = (base: Base, value: string) => {
        setError('');
        const config = baseConfig[base];

        if (!config.regex.test(value)) {
            setError(`Invalid ${config.name} value.`);
            setValues(prev => ({...prev, [base]: value}));
            return;
        }

        if (value === '') {
            setValues({ bin: '', oct: '', dec: '', hex: '' });
            return;
        }
        
        try {
            const decimalValue = parseInt(value, config.base);
            if (isNaN(decimalValue)) {
                setValues({ bin: '', oct: '', dec: '', hex: '' });
                return;
            }
            
            setValues({
                bin: decimalValue.toString(2),
                oct: decimalValue.toString(8),
                dec: decimalValue.toString(10),
                hex: decimalValue.toString(16).toUpperCase(),
            });
        } catch(e) {
            setError('Number is too large to convert accurately.');
        }
    };
    
    const longDescription = (
      <>
        <p>
          Seamlessly translate numbers between different numeral systems with our Advanced Number Base Converter. This tool is an essential utility for computer science students, programmers, and network engineers who regularly work with binary, octal, decimal, and hexadecimal values. The intuitive interface provides real-time conversions across all four bases simultaneously. Simply enter a value in any of the fields—whether it's a binary string or a hexadecimal code—and the other fields will update instantly with the corresponding values. This live-update functionality makes it incredibly fast and efficient to see how a number is represented across different systems without any extra clicks.
        </p>
        <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Features</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Real-time Conversion:</strong> Instantly convert numbers between binary, octal, decimal, and hexadecimal.</li>
          <li><strong>Input Validation:</strong> The tool automatically validates input for each number base to ensure accuracy.</li>
          <li><strong>Client-Side Processing:</strong> All conversions are performed locally in your browser, guaranteeing privacy and speed.</li>
        </ul>
      </>
    );

    return (
        <ToolPageLayout
            title="Number Base Converter"
            description="Convert between Binary, Octal, Decimal, and Hexadecimal systems."
            longDescription={longDescription}
        >
            <div className="max-w-xl mx-auto space-y-4">
                {(Object.keys(baseConfig) as Base[]).map(base => (
                    <div key={base}>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">{baseConfig[base].name}</label>
                        <input
                            type="text"
                            value={values[base]}
                            onChange={(e) => handleValueChange(base, e.target.value)}
                            className="w-full p-2 bg-brand-bg border border-brand-border rounded-md font-mono"
                        />
                    </div>
                ))}
                {error && <p className="text-red-500 text-center">{error}</p>}
            </div>
        </ToolPageLayout>
    );
};

export default NumberBaseConverter;