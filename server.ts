import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Proxy Endpoint for Shared Link Stability
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, systemInstruction } = req.body;
      
      // CRITICAL: Use GEMINI_API_KEY as the primary source. 
      // Do NOT fallback to firebase-applet-config.json as those are Firebase keys, not Gemini keys.
      let apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      let keySource = process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" : (process.env.API_KEY ? "API_KEY" : "none");

      if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.length < 10) {
        console.error("No valid Gemini API Key found in environment.");
        return res.status(500).json({ 
          error: "Gemini API Key is missing. Please ensure GEMINI_API_KEY is set in the project settings.",
          suggestion: "Go to Settings -> Secrets and add GEMINI_API_KEY with a valid key from https://aistudio.google.com/app/apikey"
        });
      }

      // Log key source and a masked version for debugging (first 6 chars)
      console.log(`AI Request: Using ${keySource} (${apiKey.substring(0, 6)}...)`);

      const ai = new GoogleGenAI({ apiKey });
      
      // Format history for the SDK
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.parts[0].text }]
      }));

      const chat = ai.chats.create({
        model: "gemini-2.0-flash", // Reverting to 2.0 Flash as it's the current standard
        config: {
          systemInstruction,
        },
        history: formattedHistory
      });

      const result = await chat.sendMessage({ message });
      res.json({ text: result.text });

    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      
      // Handle specific "API key not valid" error from Google SDK
      if (error.message?.includes("API key not valid") || error.status === "INVALID_ARGUMENT" || (error.code === 400 && error.message?.includes("API key"))) {
        return res.status(400).json({ 
          error: "The Gemini API key being used is invalid.",
          details: "The key was rejected by Google's servers. Please check your GEMINI_API_KEY in the Settings menu.",
          source: "Google Generative AI API"
        });
      }

      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get AI response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
