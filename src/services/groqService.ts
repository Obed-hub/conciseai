
export class GroqService {
    private apiKey: string;
    private baseUrl = 'https://api.groq.com/openai/v1';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private get headers() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }

    // 5. GENERIC: Chat with System Prompt
    async chat(context: string, prompt: string, systemPrompt: string, model: string = 'llama-3.3-70b-versatile'): Promise<string> {
        try {
            const messages: any[] = [
                { role: 'system', content: systemPrompt }
            ];

            if (context) {
                messages.push({ role: 'user', content: `Context: ${context}` });
            }

            messages.push({ role: 'user', content: prompt });

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    model: model, // Using the provided model or default
                    messages: messages,
                }),
            });

            if (!response.ok) {
                throw new Error(`Groq API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error in chat:', error);
            throw error;
        }
    }

    // 1. VISION: Solve Photo MCQs
    async solveMCQ(imageUrl: string): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    model: 'meta-llama/llama-4-scout-17b-16e-instruct', // Updated to a valid vision model available on Groq
                    messages: [{
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Answer this multiple choice question with ONLY the letter A, B, C, or D.' },
                            { type: 'image_url', image_url: { url: imageUrl } }
                        ]
                    }],
                    temperature: 0.0, // Ensures strictly concise answers
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Groq API Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error solving MCQ:', error);
            throw error;
        }
    }

    // 2. TEXT: Single-Sentence PDF/Text Q&A
    async askConciseQuestion(context: string, question: string): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: 'Answer in exactly one sentence or one word. No explanations. always answer concisely.always short answers' },
                        { role: 'user', content: `Context: ${context}\n\nQuestion: ${question}` }
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error(`Groq API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error asking question:', error);
            throw error;
        }
    }

    // 4. TEXT: Summarization
    async summarize(text: string): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant. Summarize the following text efficiently and capture the key points.' },
                        { role: 'user', content: text }
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error(`Groq API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error summarizing text:', error);
            throw error;
        }
    }

    // 3. VOICE: Transcribe Audio
    async transcribeVoice(audioFile: File | Blob): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('model', 'whisper-large-v3-turbo');
            formData.append('file', audioFile, 'voice.mp3');

            const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    // Content-Type is string automatically set by fetch when using FormData
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Groq API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error('Error transcribing voice:', error);
            throw error;
        }
    }
}

// Export a singleton instance with a placeholder key. 
// Ideally, this should come from process.env.VITE_GROQ_API_KEY
export const groqService = new GroqService(import.meta.env.VITE_GROQ_API_KEY || 'YOUR_GROQ_API_KEY');
