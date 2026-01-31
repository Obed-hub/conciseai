import { Handler } from '@netlify/functions';

const GROQ_API_URL = 'https://api.groq.com/openai/v1';

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { action, messages, model = 'llama-3.3-70b-versatile' } = JSON.parse(event.body || '{}');
    const apiKey = process.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' }),
      };
    }

    if (!action || !messages) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Groq API Error: ${response.statusText}`, details: error }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        content: data.choices[0].message.content,
      }),
    };
  } catch (error) {
    console.error('Error in groq function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
