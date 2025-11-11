import React, { useState } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';

const SerpPreview: React.FC<{ title: string; description: string; url: string }> = ({ title, description, url }) => (
    <div className="p-4 bg-white dark:bg-brand-bg rounded-lg border border-brand-border font-sans">
        <p className="text-sm text-gray-700 dark:text-brand-text-secondary truncate">{url || 'https://www.example.com'}</p>
        <h3 className="text-blue-600 dark:text-blue-500 text-xl truncate hover:underline">{title || 'Meta Title Appears Here'}</h3>
        <p className="text-sm text-gray-600 dark:text-brand-text-secondary">{description || 'This is where your meta description will be shown. Keep it concise and compelling to attract clicks from search results.'}</p>
    </div>
);

const GoogleSerpPreviewTool: React.FC = () => {
    const [title, setTitle] = useState('DiceTools - Free Online Tools');
    const [description, setDescription] = useState('A powerful suite of 80+ free online tools for text manipulation, data conversion, development, and more.');
    const [url, setUrl] = useState('https://dicetools.com');
    
    const longDescription = (
        <>
            <p>
                Our Google SERP Preview tool helps you craft compelling search engine result page (SERP) snippets. This tool allows you to visualize how your website's title, description, and URL will appear in Google search results, providing a real-time preview.
            </p>
            <p>
                Input your current meta title and description to ensure your snippet is enticing and relevant to searchers. This is an indispensable tool for SEO specialists, content marketers, and webmasters aiming to stand out in competitive search results.
            </p>
            <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Features</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Live SERP Preview:</strong> Instantly see how your title, description, and URL will appear on Google.</li>
                <li><strong>Character Counters:</strong> Keep track of your title and description length to stay within recommended limits.</li>
            </ul>
        </>
    );

    return (
        <ToolPageLayout
            title="Google SERP Preview Tool"
            description="Preview how your website will appear in Google search results."
            longDescription={longDescription}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <label className="flex justify-between text-sm font-medium text-brand-text-secondary mb-1">
                            <span>Title</span>
                            <span className={title.length > 60 ? 'text-red-500' : ''}>{title.length} / 60</span>
                        </label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-brand-bg border border-brand-border rounded-md" />
                    </div>
                    <div>
                        <label className="flex justify-between text-sm font-medium text-brand-text-secondary mb-1">
                            <span>Description</span>
                            <span className={description.length > 160 ? 'text-red-500' : ''}>{description.length} / 160</span>
                        </label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full p-2 bg-brand-bg border border-brand-border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">URL</label>
                        <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full p-2 bg-brand-bg border border-brand-border rounded-md" />
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="font-semibold text-brand-text-primary">Live SERP Preview</h3>
                    <SerpPreview title={title} description={description} url={url} />
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default GoogleSerpPreviewTool;