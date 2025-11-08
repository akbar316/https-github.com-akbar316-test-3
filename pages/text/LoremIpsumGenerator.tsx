import React, { useState } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';

const genericLoremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

const LoremIpsumGenerator: React.FC = () => {
    const [paragraphCount, setParagraphCount] = useState(1);
    const [output, setOutput] = useState('');

    const generate = () => {
        let generatedText = '';
        for (let i = 0; i < paragraphCount; i++) {
            generatedText += genericLoremIpsum + (i < paragraphCount - 1 ? '\n\n' : '');
        }
        setOutput(generatedText);
    };
    
    const longDescription = (
      <>
        <p>
          Generate realistic placeholder text for your design mockups and prototypes with our Lorem Ipsum Generator. This classic tool provides filler text that helps you visualize your layouts without being distracted by meaningful content. It's an essential utility for designers, developers, and content creators who need to quickly populate text areas in websites, apps, or print materials. Simply specify the number of paragraphs you need, and the tool will instantly generate standard "Lorem Ipsum" text.
        </p>
        <p>
          Our generator is fast, reliable, and operates entirely within your browser for maximum privacy. Whether you're creating a wireframe, testing font styles, or showcasing a new user interface, Lorem Ipsum is the perfect solution for creating a professional presentation of your design.
        </p>
      </>
    );
  
    return (
        <ToolPageLayout
            title="Placeholder Text Generator"
            description="Generate generic placeholder text for your design mockups."
            longDescription={longDescription}
        >
            <div className="space-y-4">
                <p className="text-brand-text-secondary">Generate standard "Lorem Ipsum" text.</p>
                <div className="flex items-center gap-2">
                    <label htmlFor="paragraph-count" className="text-sm font-medium text-brand-text-secondary">Number of paragraphs:</label>
                    <input
                        id="paragraph-count"
                        type="number"
                        min="1"
                        max="10"
                        value={paragraphCount}
                        onChange={(e) => setParagraphCount(parseInt(e.target.value, 10) || 1)}
                        className="w-20 p-2 bg-brand-bg border border-brand-border rounded-md"
                    />
                </div>
                <button 
                    onClick={generate} 
                    className="w-full bg-brand-primary text-white px-6 py-2 rounded-md hover:bg-brand-primary-hover transition-colors"
                >
                    Generate Lorem Ipsum
                </button>
                
                <textarea
                    readOnly
                    value={output}
                    className="w-full h-72 p-4 bg-brand-bg border border-brand-border rounded-md"
                    placeholder="Generated text will appear here..."
                />
                <div className="flex justify-end">
                    <CopyButton textToCopy={output} />
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default LoremIpsumGenerator;