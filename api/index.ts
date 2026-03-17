import express from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const app = express();
app.use(express.json({ limit: '10mb' }));

// Gemini Proxy Endpoint for Chat
app.post(["/api/chat", "/chat"], async (req, res) => {
  try {
    const { message, history, systemInstruction, apiKey: clientApiKey } = req.body;
    
    // Prioritize SERVER environment variables, then fallback to client key
    let apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || clientApiKey || "").trim();
    // Remove quotes if the user accidentally included them in environment variables
    apiKey = apiKey.replace(/^["']|["']$/g, '');

    if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.length < 10) {
      return res.status(500).json({ 
        error: "Gemini API Key is missing. Please set GEMINI_API_KEY in your environment variables.",
        suggestion: "If you are on Vercel, go to Settings -> Environment Variables and add GEMINI_API_KEY."
      });
    }

    console.log(`Chat Proxy: Using API Key starting with ${apiKey.substring(0, 6)}...`);

    const ai = new GoogleGenAI({ apiKey });
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.parts[0].text }]
    }));

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: { systemInstruction },
      history: formattedHistory
    });

    const result = await chat.sendMessage({ message });
    res.json({ text: result.text });
  } catch (error: any) {
    console.error("Chat Proxy Error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to get AI response",
      details: error.message?.includes("API key not valid") ? "The API key provided is invalid. Please check your GEMINI_API_KEY environment variable." : undefined
    });
  }
});

// Gemini Proxy Endpoint for Outfit Analysis
app.post(["/api/analyze-outfit", "/analyze-outfit"], async (req, res) => {
  try {
    const { image, prompt, mimeType, apiKey: clientApiKey } = req.body;
    
    // Prioritize SERVER environment variables, then fallback to client key
    let apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || clientApiKey || "").trim();
    // Remove quotes if the user accidentally included them in environment variables
    apiKey = apiKey.replace(/^["']|["']$/g, '');

    if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.length < 10) {
      return res.status(500).json({ 
        error: "Gemini API Key is missing. Please set GEMINI_API_KEY in your environment variables.",
        suggestion: "If you are on Vercel, go to Settings -> Environment Variables and add GEMINI_API_KEY."
      });
    }

    console.log(`Analysis Proxy: Using API Key starting with ${apiKey.substring(0, 6)}...`);

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: image, mimeType: mimeType || "image/jpeg" } },
          { text: prompt }
        ]
      },
      config: { 
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Analysis Proxy Error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to analyze image",
      details: error.message?.includes("API key not valid") ? "The API key provided is invalid. Please check your GEMINI_API_KEY environment variable." : undefined
    });
  }
});

export default app;
