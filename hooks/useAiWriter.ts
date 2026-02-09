import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AiWriterOptions {
    apiKey: string;
    brandVoice: string;
}

export const useAiWriter = (options: AiWriterOptions) => {
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    const generateContent = async (field: 'description' | 'hero' | 'tagline' | 'about' | 'contact', context: string): Promise<string | null> => {
        setIsAiGenerating(true);
        try {
            const ai = new GoogleGenerativeAI(options.apiKey);
            const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `You are a luxury branding expert for C1002 Quarters, Accra's finest hotel. Current voice: "${options.brandVoice}". Write a professional ${field} for: "${context}".
            
            IMPORTANT FORMATTING RULES:
            1. Use *text* for italics (e.g., *this is italic*).
            2. Use newlines (\\n) for line breaks.
            3. DO NOT use any HTML tags like <span> or <br />.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResult = response.text().replace(/^"(.*)"$/, '$1');
            return textResult;
        } catch (e) {
            console.error('AI Generation Error:', e);
            throw e;
        } finally {
            setIsAiGenerating(false);
        }
    };

    return {
        generateContent,
        isAiGenerating
    };
};
