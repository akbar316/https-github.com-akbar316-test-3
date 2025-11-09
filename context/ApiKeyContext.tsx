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
            // The primary mechanism for API key availability is the process.env.API_KEY.
            // If it's present and non-empty, we can proceed.
            if (process.env.API_KEY) {
                setApiKeySelected(true);
                return;
            }
            
            // For specific tools like Veo, a user selection flow is provided via aistudio.
            // Fallback to checking this helper if the env var isn't available on initial load.
            // @ts-ignore
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                // @ts-ignore
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            } else {
                // If neither mechanism provides a key, we must assume no key is selected.
                setApiKeySelected(false);
            }
        } catch (e) {
            console.error("Error checking for API key:", e);
            setApiKeySelected(false);
        }
    }, []);

    useEffect(() => {
        // Check for the key only on initial mount.
        checkApiKey();
    }, [checkApiKey]);
    
    const invalidateApiKey = useCallback(() => {
        // If an API call fails with an auth error, we invalidate the key.
        // This will cause the ApiKeyGate to reappear, prompting the user to select a valid key.
        setApiKeySelected(false);
    }, []);

    const selectApiKey = async () => {
        try {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            // Assume success immediately to hide the gate and avoid UI flicker due to race conditions.
            // The next API call will either succeed or fail (triggering invalidateApiKey if necessary).
            setApiKeySelected(true);
        } catch (e) {
            console.error("Error opening API key selection:", e);
            setApiKeySelected(false); // If opening the dialog fails, stay in the 'unselected' state.
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