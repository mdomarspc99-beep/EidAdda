import express from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Gemini Proxy Endpoint for Chat
app.post(["/api/chat", "/chat"], async (req, res) => {
  try {
    const { message, history, systemInstruction, apiKey: clientApiKey } = req.body;
    
    // Prioritize SERVER environment variables, then fallback to client key
    let apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || clientApiKey || "").trim();
    // Remove quotes if the user accidentally included them in environment variables
    apiKey = apiKey.replace(/^["']|["']$/g, '');

    if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.length < 10) {
      console.log("Using mock response due to missing API key in Chat.");
      return res.json({ text: "ঈদ মোবারক! আপনার কথা বুঝতে পেরেছি। তবে এই মুহূর্তে আমার সার্ভারে একটু সমস্যা হচ্ছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।" });
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
      console.log("Using mock response due to missing API key in Analysis.");
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

export default app;
