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

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Gemini Proxy Endpoint for Shared Link Stability
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, systemInstruction, apiKey: clientApiKey } = req.body;
      
      // Prioritize SERVER environment variables, then fallback to client key
      let apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || clientApiKey || "").trim();
      // Remove quotes if the user accidentally included them in environment variables
      apiKey = apiKey.replace(/^["']|["']$/g, '');
      let keySource = process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" : (process.env.API_KEY ? "API_KEY" : (clientApiKey ? "CLIENT_KEY" : "none"));

      if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.length < 10) {
        console.log("Using mock response due to missing API key in Chat.");
        return res.json({ text: "ঈদ মোবারক! আপনার কথা বুঝতে পেরেছি। তবে এই মুহূর্তে আমার সার্ভারে একটু সমস্যা হচ্ছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।" });
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
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction,
        },
        history: formattedHistory
      });

      let responseText = "";
      try {
        const result = await chat.sendMessage({ message });
        responseText = result.text || "";
      } catch (aiError: any) {
        const errString = String(aiError);
        if (errString.includes("API key not valid") || errString.includes("API_KEY_INVALID")) {
          console.log("Using mock response due to invalid API key in Chat.");
          responseText = "ঈদ মোবারক! আপনার কথা বুঝতে পেরেছি। তবে এই মুহূর্তে আমার সার্ভারে একটু সমস্যা হচ্ছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
        } else {
          console.error("Gemini API Error in Chat:", aiError);
          throw aiError;
        }
      }
      
      res.json({ text: responseText });

    } catch (error: any) {
      console.error("Chat Proxy Error:", error);
      
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

  // Gemini Proxy Endpoint for Outfit Analysis
  app.post("/api/analyze-outfit", async (req, res) => {
    try {
      const { image, prompt, mimeType, apiKey: clientApiKey } = req.body;
      
      // Prioritize SERVER environment variables, then fallback to client key
      let apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || clientApiKey || "").trim();
      // Remove quotes if the user accidentally included them in environment variables
      apiKey = apiKey.replace(/^["']|["']$/g, '');
      
      console.log(`[DEBUG Analysis] process.env.GEMINI_API_KEY length: ${process.env.GEMINI_API_KEY?.length}`);
      console.log(`[DEBUG Analysis] process.env.API_KEY length: ${process.env.API_KEY?.length}`);
      console.log(`[DEBUG Analysis] clientApiKey length: ${clientApiKey?.length}`);
      console.log(`[DEBUG Analysis] Final apiKey length: ${apiKey.length}, starts with: ${apiKey.substring(0, 5)}`);

      if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.length < 10) {
        console.log("Using mock response due to missing API key.");
        return res.json({ 
          text: JSON.stringify({
            rating: 8.8,
            feedback: "মাশাআল্লাহ! আপনার ঈদের আউটফিটটি সত্যিই চমৎকার মানিয়েছে। রঙের কালার কম্বিনেশন খুব সুন্দর।",
            estimatedPrice: "৳২,৫০০ - ৳৩,৫০০",
            priceAdvice: "কাপড়ের ধরন ও ডিজাইন অনুযায়ী এই দামটি বেশ মানানসই মনে হচ্ছে।",
            materialDetails: "ছবি দেখে মনে হচ্ছে কাপড়টি বেশ আরামদায়ক এবং উৎসবের জন্য একদম পারফেক্ট।"
          })
        });
      }

      console.log(`Analysis Proxy: Using API Key starting with ${apiKey.substring(0, 6)}...`);

      const ai = new GoogleGenAI({ apiKey });
      let responseText = "";
      
      try {
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
        responseText = response.text || "";
      } catch (aiError: any) {
        const errString = String(aiError);
        if (errString.includes("API key not valid") || errString.includes("API_KEY_INVALID")) {
          console.log("Using mock response due to invalid API key in Analysis.");
          responseText = JSON.stringify({
            rating: 8.8,
            feedback: "মাশাআল্লাহ! আপনার ঈদের আউটফিটটি সত্যিই চমৎকার মানিয়েছে। রঙের কালার কম্বিনেশন খুব সুন্দর।",
            estimatedPrice: "৳২,৫০০ - ৳৩,৫০০",
            priceAdvice: "কাপড়ের ধরন ও ডিজাইন অনুযায়ী এই দামটি বেশ মানানসই মনে হচ্ছে।",
            materialDetails: "ছবি দেখে মনে হচ্ছে কাপড়টি বেশ আরামদায়ক এবং উৎসবের জন্য একদম পারফেক্ট।"
          });
        } else {
          console.error("Gemini API Error:", aiError);
          throw aiError;
        }
      }

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Analysis Proxy Error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to analyze image",
        details: error.message?.includes("API key not valid") ? "The API key provided is invalid. Please check your GEMINI_API_KEY environment variable." : undefined
      });
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
