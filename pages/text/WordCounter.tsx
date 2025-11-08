import React, { useState, useMemo } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';

// Simple syllable counter heuristic
const countSyllables = (word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 0;
};

const WordCounter: React.FC = () => {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return { words: 0, characters: 0, sentences: 0, paragraphs: 0, readingTime: 0, speakingTime: 0, readability: 0 };
    }
    const words = trimmedText.match(/\b\w+\b/g) || [];
    const wordCount = words.length;
    const characters = text.length;
    const sentences = trimmedText.match(/[^.!?]+[.!?]+/g)?.length || 1;
    const paragraphs = trimmedText.split(/\n+/).filter(p => p.trim().length > 0).length;
    
    // Advanced stats
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed 200 wpm
    const speakingTime = Math.ceil(wordCount / 150); // Average speaking speed 150 wpm

    // Flesch-Kincaid Readability
    const totalSyllables = words.reduce((acc: number, word: string) => acc + countSyllables(word), 0);
    const readability = 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (totalSyllables / wordCount);

    return { words: wordCount, characters, sentences, paragraphs, readingTime, speakingTime, readability: Math.max(0, Math.round(readability)) };
  }, [text]);
  
  const longDescription = (
    <>
      <p>
        Dive deeper into your writing with our Advanced Word Counter, a comprehensive tool designed for writers, students, editors, and marketers. Beyond simple word and character counts, this utility provides actionable insights to improve your text's quality and readability. Simply paste your content into the text area, and watch as the tool instantly analyzes it, breaking down everything from sentence structure to reading time. It's the perfect companion for ensuring your essays meet length requirements, your social media posts are concise, and your articles are engaging for your audience.
      </p>
      <h3 className="text-xl font-bold text-brand-text-primary mt-4 mb-2">Key Analytical Features</h3>
      <ul className="list-disc list-inside space-y-2">
        <li><strong>Detailed Statistics:</strong> Instantly see counts for words, characters, sentences, and paragraphs.</li>
        <li><strong>Readability Metrics:</strong> Calculate estimated reading and speaking times, along with a Flesch-Kincaid readability score to gauge your content's accessibility.</li>
      </ul>
    </>
  );

  return (
    <ToolPageLayout
      title="Advanced Word Counter"
      description="Analyze your text for readability and word count."
      longDescription={longDescription}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here..."
              className="w-full h-80 p-4 bg-brand-bg border border-brand-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
        </div>

        <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4 text-center">
                <StatCard value={stats.words} label="Words" />
                <StatCard value={stats.characters} label="Characters" />
                <StatCard value={stats.sentences} label="Sentences" />
                <StatCard value={stats.paragraphs} label="Paragraphs" />
            </div>
             <div className="grid grid-cols-2 gap-4 text-center">
                <StatCard value={`${stats.readingTime} min`} label="Reading Time" />
                <StatCard value={`${stats.speakingTime} min`} label="Speaking Time" />
            </div>
            <div className="bg-brand-bg p-4 rounded-md text-center">
                 <div className="text-2xl font-bold text-brand-primary">{stats.readability}</div>
                 <div className="text-sm text-brand-text-secondary">Readability Score</div>
                 <p className="text-xs text-brand-text-secondary mt-1">(Flesch-Kincaid)</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-brand-border">
                <p className="text-center text-sm text-brand-text-secondary">AI features like summarization and proofreading are currently unavailable.</p>
            </div>
        </div>
      </div>
    </ToolPageLayout>
  );
};

const StatCard: React.FC<{value: string | number, label: string}> = ({ value, label }) => (
    <div className="bg-brand-bg p-4 rounded-md">
        <div className="text-2xl font-bold text-brand-primary">{value}</div>
        <div className="text-sm text-brand-text-secondary">{label}</div>
    </div>
);

export default WordCounter;