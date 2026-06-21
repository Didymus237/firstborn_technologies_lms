
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function listModels() {
    console.log('Listing models for key:', API_KEY?.substring(0, 10) + '...');
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        if (data.models) {
            console.log('Available Models:');
            data.models.forEach((m: any) => console.log(` - ${m.name}`));
        } else {
            console.log('No models found or error:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

listModels();
