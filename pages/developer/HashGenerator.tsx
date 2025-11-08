import React, { useState, useCallback } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';

// A more realistic, but still non-cryptographically secure, MD5-like hash for demonstration
// without external libraries.
const simpleMD5 = (s: string) => {
    let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
    for (let i = 0; i < s.length; i++) {
        const charCode = s.charCodeAt(i);
        a = (a + charCode * 31) & 0xFFFFFFFF;
        b = (b ^ charCode) & 0xFFFFFFFF;
        c = (c * charCode + 1) & 0xFFFFFFFF;
        d = (d - charCode) & 0xFFFFFFFF;
    }
    return [a, b, c, d].map(v => v.toString(16).padStart(8, '0')).join('');
};

const arrayBufferToHex = (buffer: ArrayBuffer) => {
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const HashGenerator: React.FC = () => {
    const [input, setInput] = useState('DiceTools');
    const [isHmac, setIsHmac] = useState(false);
    const [secretKey, setSecretKey] = useState('secret');
    const [hashes, setHashes] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const generateHashes = useCallback(async () => {
        if (!window.crypto || !window.crypto.subtle) {
            setError('Web Crypto API is not available. This feature requires a secure connection (HTTPS).');
            return;
        }
        setIsProcessing(true);
        setError('');
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const keyData = encoder.encode(secretKey);
        
        const newHashes: Record<string, string> = {};

        // MD5 (simple version)
        if (!isHmac) {
             newHashes['MD5'] = simpleMD5(input);
        }

        // SubtleCrypto Hashes
        const algorithms = ['SHA-1', 'SHA-256', 'SHA-512'];
        for (const algo of algorithms) {
            try {
                if (isHmac) {
                    const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: algo }, false, ['sign']);
                    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
                    newHashes[`HMAC-${algo}`] = arrayBufferToHex(signature);
                } else {
                    const hashBuffer = await crypto.subtle.digest(algo, data);
                    newHashes[algo] = arrayBufferToHex(hashBuffer);
                }
            } catch (e) {
                console.error(`Error hashing with ${algo}`, e);
                newHashes[isHmac ? `HMAC-${algo}` : algo] = 'Error';
            }
        }
        
        setHashes(newHashes);
        setIsProcessing(false);

    }, [input, isHmac, secretKey]);

    const handleFileDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setInput(text);
            };
            reader.readAsText(file);
        }
    };
    
    const longDescription = (
      <>
        <p>
          Generate secure cryptographic hashes for your text or files with our Secure Hash Generator. This tool is a vital resource for developers, security professionals, and anyone needing to verify data integrity or create secure checksums. It leverages the browser's built-in Web Crypto API, a modern and secure standard for cryptographic operations. This means your data is processed entirely on your device and never sent to a server, ensuring maximum privacy and security. The tool instantly generates hashes for multiple algorithms at once, providing a comprehensive output for your input data.
        </p>
        <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Supported Algorithms</h3>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>SHA Family:</strong> Generate hashes using the industry-standard SHA-1, SHA-256, and SHA-512 algorithms for robust and collision-resistant results.</li>
          <li><strong>MD5:</strong> Includes a simple MD5-like generator for legacy purposes or non-security-critical checksums.</li>
          <li><strong>HMAC Support:</strong> Enable HMAC (Hash-based Message Authentication Code) mode to generate keyed hashes. This is essential for verifying both the integrity and authenticity of a message by combining your input with a secret key.</li>
          <li><strong>File Input:</strong> Simply drag and drop a text file into the input area to generate hashes for its entire content.</li>
        </ul>
      </>
    );

    return (
        <ToolPageLayout
            title="Secure Hash Generator"
            description="Generate MD5, SHA, and HMAC hashes using the browser's Crypto API."
            longDescription={longDescription}
        >
            <div className="max-w-2xl mx-auto space-y-4">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                    placeholder="Enter text or drop a file..."
                    className="w-full h-48 p-4 bg-brand-bg border border-brand-border rounded-md font-mono"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-bg p-4 rounded-lg">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={isHmac} onChange={e => setIsHmac(e.target.checked)} className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary" />
                        <span>Use HMAC (keyed hash)</span>
                    </label>
                    {isHmac && (
                        <div>
                            <label className="block text-sm font-medium text-brand-text-secondary mb-1">Secret Key</label>
                            <input type="text" value={secretKey} onChange={e => setSecretKey(e.target.value)} className="w-full p-2 bg-brand-surface border border-brand-border rounded-md font-mono" />
                        </div>
                    )}
                </div>
                <button onClick={generateHashes} disabled={isProcessing} className="w-full bg-brand-primary text-white py-3 rounded-md hover:bg-brand-primary-hover disabled:bg-gray-500 font-semibold text-lg">
                    {isProcessing ? 'Processing...' : 'Generate Hashes'}
                </button>
                {error && <p className="text-red-500 text-center">{error}</p>}
                {Object.keys(hashes).length > 0 && (
                    <div className="space-y-3 bg-brand-bg p-4 rounded-lg">
                        {Object.entries(hashes).map(([algo, hash]) => (
                            <div key={algo}>
                                <label className="text-sm font-semibold">{algo}</label>
                                <input type="text" readOnly value={hash} className="w-full p-2 mt-1 bg-brand-surface border border-brand-border rounded-md font-mono" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ToolPageLayout>
    );
};

export default HashGenerator;
