import React, { useState, useEffect } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';

const firstNamesMale = ['John', 'William', 'James', 'Charles', 'George', 'Frank', 'Joseph', 'Thomas', 'Henry', 'Robert'];
const firstNamesFemale = ['Mary', 'Anna', 'Emma', 'Elizabeth', 'Minnie', 'Margaret', 'Ida', 'Alice', 'Bertha', 'Sarah'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White'];

const RandomNameGenerator: React.FC = () => {
    const [name, setName] = useState('');
    const [gender, setGender] = useState('Any');

    const genders = ['Any', 'Male', 'Female'];
    // Countries and religions options are removed as they were AI-dependent.

    const generateName = () => {
        const selectedFirstNames = (gender === 'Male') ? firstNamesMale : 
                                   (gender === 'Female') ? firstNamesFemale : 
                                   [...firstNamesMale, ...firstNamesFemale];

        const randomFirstName = selectedFirstNames[Math.floor(Math.random() * selectedFirstNames.length)];
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        setName(`${randomFirstName} ${randomLastName}`);
    };
    
    useEffect(() => {
        generateName();
    }, []); // Generate one name on initial load with default settings

    return (
        <ToolPageLayout
            title="Random Name Generator"
            description="Generate random names based on gender."
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 p-4 bg-brand-bg rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Gender</label>
                        <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-2 bg-brand-surface border border-brand-border rounded-md">
                            {genders.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>

                <div className="text-4xl font-bold bg-brand-surface p-6 rounded-md w-full text-center min-h-[5rem] flex items-center justify-center">
                    {name || '...'}
                </div>

                 <div className="flex justify-center gap-4">
                    <button 
                        onClick={generateName} 
                        className="bg-brand-primary text-white px-8 py-3 rounded-md hover:bg-brand-primary-hover font-semibold text-lg w-64"
                    >
                        Generate New Name
                    </button>
                    <CopyButton textToCopy={name} />
                </div>
            </div>
        </ToolPageLayout>
    );
};

export default RandomNameGenerator;