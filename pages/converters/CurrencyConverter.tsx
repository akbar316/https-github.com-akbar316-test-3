import React, { useState, useEffect } from 'react';
import { ToolPageLayout, CopyButton } from '../../components/ToolPageLayout';

const topCurrencies = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];
type Currency = typeof topCurrencies[number];

// Mock exchange rates (1 USD as base)
const mockRates: Record<Currency, number> = {
    'USD': 1.0,
    'EUR': 0.92,
    'JPY': 157.0,
    'GBP': 0.79,
    'AUD': 1.50,
    'CAD': 1.36,
    'CHF': 0.90,
    'CNY': 7.26,
    'INR': 83.5,
};

const CurrencyConverter: React.FC = () => {
    const [amount, setAmount] = useState<string>('100');
    const [fromCurrency, setFromCurrency] = useState<Currency>('USD');
    const [rates, setRates] = useState<Record<string, number> | null>(null);
    const [loadingRates, setLoadingRates] = useState(false);
    const [error, setError] = useState('');
    
    useEffect(() => {
        setLoadingRates(true);
        setError('');
        // Simulate API call delay
        setTimeout(() => {
            const baseRate = mockRates[fromCurrency];
            const newRates: Record<Currency, number> = {} as Record<Currency, number>;
            for (const currency of topCurrencies) {
                newRates[currency] = mockRates[currency] / baseRate;
            }
            setRates(newRates);
            setLoadingRates(false);
        }, 500);
    }, [fromCurrency]);

    const currencyOptions = topCurrencies.map(c => <option key={c} value={c}>{c}</option>);
    const numAmount = parseFloat(amount);
    
    const longDescription = (
      <>
        <p>
          Navigate the global financial landscape with our Currency Converter. This tool provides exchange rates between popular world currencies, helping you quickly convert amounts for travel, online shopping, or financial planning. Simply set a base amount and currency, and instantly see the converted values across a range of other major currencies, making comparisons simple and fast.
        </p>
        <p>
          Please note that the exchange rates provided are mock rates for demonstration purposes and are not updated in real-time. For actual financial transactions, always consult with a reliable financial institution or a real-time currency exchange service.
        </p>
      </>
    );

    return (
        <ToolPageLayout
            title="Currency Converter"
            description="Convert between currencies with mock rates."
            longDescription={longDescription}
        >
            <div className="space-y-8">
                {/* Real-time Converter */}
                <div className="bg-brand-bg p-6 rounded-lg">
                    <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full sm:w-1/3 p-2 bg-brand-surface border border-brand-border rounded-md text-lg"/>
                        <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value as Currency)} className="w-full sm:w-1/3 p-2 bg-brand-surface border border-brand-border rounded-md text-lg">
                            {currencyOptions}
                        </select>
                        <button onClick={() => setFromCurrency(fromCurrency)} disabled={loadingRates} className="w-full sm:w-1/3 bg-brand-primary py-2 rounded-md font-semibold disabled:bg-gray-500">
                            {loadingRates ? 'Fetching...' : 'Refresh Rates'}
                        </button>
                    </div>
                    
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rates && !isNaN(numAmount) ? topCurrencies.map(c => {
                            const convertedAmount = numAmount * (rates[c] || 0);
                            return (
                                <div key={c} className="bg-brand-surface p-3 rounded-md">
                                    <p className="text-sm text-brand-text-secondary">{c}</p>
                                    <p className="text-2xl font-bold">{convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                            );
                        }) : !error && (
                             <div className="sm:col-span-2 lg:col-span-3 text-center text-brand-text-secondary">
                                {loadingRates ? 'Fetching mock rates...' : 'Enter an amount to see conversions.'}
                             </div>
                        )}
                    </div>
                </div>

                {/* Historical Rate Checker removed */}
                 <p className="text-xs text-center text-brand-text-secondary">Disclaimer: All exchange rates are mock rates for informational purposes only. They should not be used for financial transactions.</p>
            </div>
        </ToolPageLayout>
    );
};

export default CurrencyConverter;