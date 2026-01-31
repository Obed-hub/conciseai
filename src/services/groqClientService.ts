// Client-side service that calls the backend Groq function
export class GroqClientService {
  private baseUrl = '/.netlify/functions/groq';

  async makeRequest(messages: any[], model: string = 'llama-3.3-70b-versatile'): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'chat',
          messages: messages,
          model: model,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.error}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      return data.content;
    } catch (error) {
      console.error('Error calling Groq API:', error);
      throw error;
    }
  }

  async chat(context: string, prompt: string, systemPrompt: string, model: string = 'llama-3.3-70b-versatile'): Promise<string> {
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (context) {
      messages.push({ role: 'user', content: `Context: ${context}` });
    }

    messages.push({ role: 'user', content: prompt });

    return this.makeRequest(messages, model);
  }

  async solveMCQ(imageDataUrl: string): Promise<string> {
    const systemPrompt = `You are an AI assistant specialized in solving multiple-choice questions from images. 
    When given an image of an MCQ problem:
    1. Identify the question and all options
    2. Analyze the question carefully
    3. Provide the correct answer with brief explanation
    Format your response as: "Answer: [Option Letter/Number] - [Brief explanation]"`;

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Please solve this MCQ from the image:' },
          { type: 'image_url', image_url: { url: imageDataUrl } }
        ]
      }
    ];

    return this.makeRequest(messages);
  }

  async summarize(text: string): Promise<string> {
    const messages = [
      { role: 'system', content: 'You are a concise summarization expert. Provide a brief, clear summary of the given text.' },
      { role: 'user', content: text }
    ];

    return this.makeRequest(messages);
  }

  async transcribeVoice(audioBlob: Blob): Promise<string> {
    // Note: Groq's Whisper API transcription requires binary data
    // For now, we'll return a placeholder - you may need to handle this differently
    // as it requires multipart form data, not JSON
    throw new Error('Voice transcription should be handled separately with multipart form data');
  }
}

export const groqService = new GroqClientService();
