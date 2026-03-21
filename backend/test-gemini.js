const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: 'AIzaSyAY2FIWQhPvJOilsyjxuJKv4s3b1JBI7wM' });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: 'Hello there! Explain what a struct is in C.',
    });
    console.log('SUCCESS:', response.text);
  } catch (err) {
    console.error('ERROR TRACE:', err);
  }
}

test();
