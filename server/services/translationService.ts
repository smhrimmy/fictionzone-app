import OpenAI from 'openai';
import path from 'path';
import os from 'os';

// Initialize OpenAI client
// Note: In Vercel, OPENAI_API_KEY must be set in the project settings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
  dangerouslyAllowBrowser: false // This runs on server side
});

export class TranslationService {
  
  /**
   * Translates novel/fanfiction text using LLM
   */
  static async translateText(text: string, sourceLang: string = 'auto', targetLang: string = 'en', type: 'novel' | 'fanfiction' = 'novel') {
    if (!process.env.OPENAI_API_KEY) {
        console.warn('OPENAI_API_KEY not found. Returning mock translation.');
        return `[Mock Translation (${targetLang})] ${text.substring(0, 100)}... (Configure API Key for full translation)`;
    }

    let systemPrompt = '';
    
    if (type === 'novel') {
        systemPrompt = `You are a professional literary translator.
Translate the following text from ${sourceLang} to ${targetLang}.

Rules:
- Preserve tone, character voice, and paragraph structure
- Do NOT censor language
- Do NOT summarize or add content
- Use natural English suitable for web novels
- Keep honorifics only if contextually important`;
    } else {
        systemPrompt = `Translate the following fan-fiction text into ${targetLang}.

Rules:
- Preserve fandom terminology
- Keep character names unchanged
- Maintain informal or dramatic tone
- Do not rewrite or normalize style`;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Or gpt-4o-mini for cost efficiency
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.3,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI Translation Error:', error);
      throw new Error('Translation failed');
    }
  }

  /**
   * Performs OCR on an image buffer and translates the text
   */
  static async translateImage(imageBuffer: Buffer, sourceLang: string = 'jpn', targetLang: string = 'eng') {
    // 1. OCR Step
    let ocrText = '';
    try {
        // Dynamic import to prevent build issues in serverless if not needed immediately
        const { createWorker } = await import('tesseract.js');

        // Use /tmp for cache in serverless environment
        const cachePath = path.join(os.tmpdir(), 'tesseract-cache');
        
        const worker = await createWorker(sourceLang, 1, {
            cachePath,
            logger: m => console.log(m),
        });
        
        const ret = await worker.recognize(imageBuffer);
        ocrText = ret.data.text;
        await worker.terminate();
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('OCR failed');
    }

    if (!ocrText.trim()) {
        return { ocrText: '', translatedText: '' };
    }

    // 2. Translation Step
    if (!process.env.OPENAI_API_KEY) {
        return { 
            ocrText, 
            translatedText: `[Mock Translation] ${ocrText.substring(0, 50)}...` 
        };
    }

    const systemPrompt = `You are translating dialogue extracted from a manga page.

Instructions:
- Translate naturally into ${targetLang}
- Keep dialogue short and conversational
- Preserve emotional tone
- Do not add or remove meaning
- Output line-by-line in reading order`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: ocrText }
            ],
            temperature: 0.3,
        });

        return {
            ocrText,
            translatedText: response.choices[0].message.content || ''
        };
    } catch (error) {
        console.error('Translation Error:', error);
        throw new Error('Translation failed after OCR');
    }
  }
}
