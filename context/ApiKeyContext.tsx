import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';

interface ApiKeyContextType {
    apiKeySelected: boolean;
    isLoading: boolean;
    selectApiKey: () => Promise<void>;
    invalidateApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkApiKey = async () => {
            try {
                const hasEnvKey = !!process.env.API_KEY;
                // @ts-ignore
                const hasStudioKey = window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function' 
                    // @ts-ignore
                    ? await window.aistudio.hasSelectedApiKey() 
                    : false;

                if (hasEnvKey || hasStudioKey) {
                    setApiKeySelected(true);
                }
            } catch (e) {
                console.error("Error checking for API key:", e);
            } finally {
                setIsLoading(false);
            }
        };
        checkApiKey();
    }, []);

    const invalidateApiKey = useCallback(() => {
        setApiKeySelected(false);
    }, []);

    const selectApiKey = async () => {
        try {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
        } catch (e) {
            console.error("Error opening API key selection:", e);
            setApiKeySelected(false);
        }
    };
    
    return (
        <ApiKeyContext.Provider value={{ apiKeySelected, isLoading, selectApiKey, invalidateApiKey }}>
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