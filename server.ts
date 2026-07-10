import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper function to generate content with retry logic and fallback models to handle 503/overload errors
async function generateAiContentWithFallback(ai: GoogleGenAI, contents: any[], systemInstruction: string): Promise<string> {
  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    // Retry up to 2 times for each model in case of transient errors (like 503 high demand or rate limits)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[AreaDada AI] Attempting generateContent using model: ${model} (attempt ${attempt}/2)`);
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        
        if (response && response.text) {
          console.log(`[AreaDada AI] Successfully generated content with model: ${model}`);
          return response.text;
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`[AreaDada AI] Attempt ${attempt} with model ${model} failed:`, error.message || error);
        
        // Wait briefly before retrying the same model (500ms for attempt 1)
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }
  }

  throw lastError || new Error('All generation attempts failed');
}

// Secure server-side endpoint for ApnaArea AI Resident Assistant
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const ai = getAiClient();
    
    // System instructions explaining ApnaArea's rules and structure
    const systemInstruction = `
You are "AreaDada" (or ApnaArea Assistant), an intelligent and friendly AI resident helper representing ApnaArea, India's premier hyperlocal neighborhood platform.
Your purpose is to welcome new users, answer questions about ApnaArea's features, and help them understand community guidelines.

Core Facts about ApnaArea:
1. It is built on verified real identities. Every resident must register with their real full name and a mobile number (1 account per phone, enforced at DB level). This ensures civil, trustworthy community interactions without heavy overhead.
2. It features a local Community Feed & Posts, where residents share recommendations, lost/found notices, and security alerts.
3. It has a local Marketplace where residents can buy/sell items (e.g., collectibles, furniture, clothes) in their immediate neighborhood.
4. It organizes Local Events with active RSVP counts.
5. It utilizes a trust-based Report System: if a post or comment receives 5 or more reports (for Spam, Abusing, Misinformation, etc.), it is automatically HIDDEN immediately for safety, and held for a Platform Admin review. Platform Admins can permanently delete it (and issue a warning to the author) or restore it.
6. Creators of neighborhoods automatically become the first neighborhood Moderators. They can promote other residents to Moderator too. If the last Moderator leaves, the member with the oldest membership is promoted automatically to prevent orphan neighborhoods.

When chatting:
- Speak in a friendly, polite, and helpful tone with a touch of Indian hospitality (words like "Namaste", "yaar", or local phrasing are fine but keep it professional, clear, and elegant).
- Support the user in setting up their neighborhood, navigating the marketplace, or understanding the report rules.
- Do not mention implementation details like "local storage", "JSON files", or "Express servers". Keep the conversation human-centered and neighborhood-focused.
`;

    // Format chat contents for the generateContent call
    // Note: contents can take an array of previous parts/roles
    const contents: any[] = [];
    
    // Process history if provided
    if (history && Array.isArray(history)) {
      history.forEach((h: { role: 'user' | 'model'; text: string }) => {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }]
        });
      });
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const textResponse = await generateAiContentWithFallback(ai, contents, systemInstruction);
    return res.json({ response: textResponse });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    
    // Robust, friendly simulated fallback if API is completely unavailable or key is missing
    let fallbackText = "Namaste! I'm AreaDada, your ApnaArea Assistant. ";
    
    if (error.message && error.message.includes('GEMINI_API_KEY')) {
      fallbackText += "(Note: The Gemini API Key is currently not set up in your secrets. No worries!) ApnaArea is India's first verified real-identity neighborhood app where you can post community updates, sell items in local marketplaces, and RSVP to events. Let me know if you want to explore! 🙏";
    } else {
      fallbackText += "ApnaArea is experiencing some high digital traffic right now, so I am answering you in offline mode! 🚀 As your local helper, let me tell you: ApnaArea is all about keeping our neighborhood safe, verified, and active. You can post community updates, buy/sell in our local Marketplace, or RSVP to events. What can I help you discover about our locality today? 🙏";
    }
    
    return res.json({ response: fallbackText });
  }
});

// Configure Vite or Static Files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: mount Vite dev server as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode');
  } else {
    // Production mode: serve compiled static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Static files served from dist in production mode');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ApnaArea server running on http://localhost:${PORT}`);
  });
}

startServer();
