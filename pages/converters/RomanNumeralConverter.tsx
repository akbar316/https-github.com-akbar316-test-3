import React, { useState } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';

const RomanNumeralConverter: React.FC = () => {
    const [number, setNumber] = useState('1999');
    const [roman, setRoman] = useState('MCMXCIX');
    const [error, setError] = useState('');

    const toRoman = (num: number): string => {
        if (num < 1 || num > 3999) return 'Number must be between 1 and 3999';
        const val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        const syb = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
        let result = "";
        for (let i = 0; i < val.length; i++) {
            while (num >= val[i]) {
                result += syb[i];
                num -= val[i];
            }
        }
        return result;
    };
    
    const romanRegex = /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

    const fromRoman = (str: string): number | string => {
        if (!romanRegex.test(str)) return 'Invalid Roman numeral format';
        const map: { [key: string]: number } = {M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1};
        let result = 0;
        for (let i = 0; i < str.length; i++) {
            const current = map[str[i]];
            const next = map[str[i + 1]];
            if (current < next) {
                result += next - current;
                i++;
            } else {
                result += current;
            }
        }
        return isNaN(result) ? 'Invalid Roman numeral' : result;
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setError('');
        setNumber(val);
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
            setRoman(toRoman(num));
        } else {
            setRoman(val === '' ? '' : 'Invalid number');
        }
    };

    const handleRomanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        setError('');
        setRoman(val);
        if (val === '') {
            setNumber('');
        } else {
            const result = fromRoman(val);
            if (typeof result === 'number') {
                setNumber(result.toString());
            } else {
                setNumber('');
                setError(result);
            }
        }
    };
    
    const longDescription = (
      <>
        <p>
          Journey back in time with our Advanced Roman Numeral Converter. This tool is perfect for students, history buffs, and anyone curious about the ancient system of numbering. Our converter offers seamless, two-way conversion: type in a standard number, and it instantly generates the correct Roman numeral, or type a Roman numeral, and it converts it back to a number. The tool includes built-in validation to help you write valid Roman numerals and prevents conversions for numbers outside the standard range (1 to 3999). It's an educational and easy-to-use utility for any task involving Roman numerals.
        </p>
        <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Features</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Bidirectional Conversion:</strong> Easily convert between standard numbers and Roman numerals.</li>
          <li><strong>Real-time Validation:</strong> Get instant feedback on the validity of your Roman numeral input.</li>
          <li><strong>Range Restriction:</strong> Ensures conversions are within the standard Roman numeral range (1 to 3999).</li>
        </ul>
      </>
    );

    return (
        <ToolPageLayout
            title="Roman Numeral Converter"
            description="Convert numbers to and from Roman numerals with validation."
            longDescription={longDescription}
        >
            <div className="max-w-md mx-auto space-y-4">
                <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-1">Number (1-3999)</label>
                    <input
                        type="number"
                        value={number}
                        onChange={handleNumberChange}
                        placeholder="Enter number"
                        className="w-full p-2 bg-brand-bg border border-brand-border rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-1">Roman Numeral</label>
                    <input
                        type="text"
                        value={roman}
                        onChange={handleRomanChange}
                        placeholder="Enter Roman numeral"
                        className="w-full p-2 bg-brand-bg border border-brand-border rounded-md uppercase"
                    />
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}

                 <div className="pt-2 text-center">
                    <p className="text-sm text-brand-text-secondary">AI Fun Fact feature is currently unavailable.</p>
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default RomanNumeralConverter;