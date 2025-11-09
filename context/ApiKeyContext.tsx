import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

interface ApiKeyContextType {
    apiKeySelected: boolean | null;
    selectApiKey: () => Promise<void>;
    invalidateApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);

    const checkApiKey = useCallback(async () => {
        try {
            // @ts-ignore
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        } catch (e) {
            console.error("Error checking for API key:", e);
            setApiKeySelected(false);
        }
    }, []);

    useEffect(() => {
        if (apiKeySelected === null) {
            checkApiKey();
        }
    }, [apiKeySelected, checkApiKey]);
    
    const invalidateApiKey = useCallback(() => {
        setApiKeySelected(false);
    }, []);

    const selectApiKey = async () => {
        try {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            setApiKeySelected(true); // Assume success to avoid race conditions
        } catch (e) {
            console.error("Error opening API key selection:", e);
            setApiKeySelected(false); // If it fails, remain in the 'unselected' state
        }
    };
    
    return (
        <ApiKeyContext.Provider value={{ apiKeySelected, selectApiKey, invalidateApiKey }}>
            {children}
        </ApiKeyContext.Provider>
    );
};

export const useApiKey = () => {
    const context = useContext(ApiKeyContext);
    if (context === undefined) {
        throw new Error('useApiKey must be used within an ApiKeyProvider');
    }
    return context;
};
