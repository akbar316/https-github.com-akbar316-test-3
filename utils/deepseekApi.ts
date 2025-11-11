export const runDeepSeekWithSchema = async (model: string, prompt: string, schema: any): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API key not found. Please select your DeepSeek API key using the 'Select API Key' button.");
    }

    // DeepSeek needs explicit instruction in the prompt for JSON mode.
    const fullPrompt = `${prompt}\n\nRespond with a valid JSON object that adheres to the following structure. Do not include any other text or formatting. The JSON object should look like this:\n${JSON.stringify(schema, null, 2)}`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { content: fullPrompt, role: 'user' }
            ],
            response_format: { "type": "json_object" },
            stream: false,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const jsonString = data.choices[0].message.content;
    
    try {
        // Handle potential markdown ```json ... ``` wrapper
        const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
        JSON.parse(cleanedJsonString); // Validate
        return cleanedJsonString;
    } catch (e) {
        throw new Error("DeepSeek API did not return a valid JSON object.");
    }
};
