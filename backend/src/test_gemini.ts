
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

async function testGemini() {
    console.log('Testing Gemini with key:', process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 10) + '...');
    try {
        const { text } = await generateText({
            model: google('gemini-pro-latest'),
            prompt: 'Hello, are you working?',
        });
        console.log('Gemini Response:', text);
    } catch (err: any) {
        console.error('Gemini Error (Full):', JSON.stringify(err, null, 2));
        if (err.responseBody) {
             console.log('Response Body:', err.responseBody);
        }
    }
}

testGemini();
