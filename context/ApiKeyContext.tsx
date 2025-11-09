import React, { createContext, useState, useCallback, useContext } from 'react';

interface ApiKeyContextType {
    apiKeySelected: boolean;
    selectApiKey: () => Promise<void>;
    invalidateApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Start with an optimistic assumption that the API key is available.
    // The gate will only appear if an API call fails and `invalidateApiKey` is called.
    const [apiKeySelected, setApiKeySelected] = useState<boolean>(true);

    const invalidateApiKey = useCallback(() => {
        // This is called by tools when an API request fails due to an API key issue.
        // Setting this to false will trigger the ApiKeyGate to be displayed.
        setApiKeySelected(false);
    }, []);

    const selectApiKey = async () => {
        try {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            // After the user selects a key, we assume it's valid and hide the gate.
            // If the next API call fails, `invalidateApiKey` will be called again.
            setApiKeySelected(true);
        } catch (e) {
            console.error("Error opening API key selection:", e);
            // If the dialog fails to open, we remain in a state where the key is not selected.
            setApiKeySelected(false);
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