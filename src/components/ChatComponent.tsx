import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Mosque, ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, X, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatComponentProps {
  mosques: Mosque[];
  onSearchArea: (area: string) => void;
  onAddMosquePrompt: () => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ mosques, onSearchArea, onAddMosquePrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'আসসালামু আলাইকুম! আমি আপনাকে মসজিদের অবস্থান এবং ২০২৬ সালের ঈদুল ফিতরের নামাজের সময় খুঁজে পেতে সাহায্য করতে পারি। আপনি কি কোনো নির্দিষ্ট এলাকার মসজিদ খুঁজছেন?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get API key from environment
      const apiKey = (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '') || 
                     // @ts-ignore
                     (import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '');

      // Try to use the backend proxy first (more reliable for Vercel/Production)
      try {
        const systemInstruction = `You are the AI engine for the "ঈদের নামাজ" app. 
          Your goal is to help users find mosques worldwide and view Eid-ul-Fitr 2026 prayer times.
          Current mosques in database: ${JSON.stringify(mosques?.map(m => ({ name: m.name, address: m.address, prayerTimes: m.prayerTimes })) || [])}
          
          Guidelines:
          - Use a friendly, helpful tone (Bengali/English mix).
          - If a user asks for a specific area, tell them you'll show it on the map (the app will handle the search).
          - If a mosque is missing, prompt: "Information not available. Would you like to add the mosque or prayer time?"
          - Validate user-contributed data by asking for confirmation.
          - Use Markdown for tables or lists when showing multiple prayer times.
          - Keep responses concise and focused on Eid prayer times.
          `;

        const proxyResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: input,
            history: messages.map(m => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }]
            })),
            systemInstruction,
            apiKey // Pass the API key to the backend proxy
          })
        });

        if (proxyResponse.ok) {
          const data = await proxyResponse.json();
          const text = data.text;
          if (text) {
            setMessages(prev => [...prev, { role: 'model', content: text }]);
            if (input.toLowerCase().includes('search') || input.toLowerCase().includes('খুঁজ') || input.toLowerCase().includes('কোথায়')) {
              onSearchArea(input);
            }
            setIsLoading(false);
            return; // Successfully handled via proxy
          }
        }
      } catch (proxyErr) {
        console.warn("Proxy chat failed, falling back to client-side:", proxyErr);
      }

      // Fallback to client-side SDK
      if (!apiKey || apiKey === "undefined" || apiKey === "null") {
        throw new Error('API Key is missing');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are the AI engine for the "ঈদের নামাজ" app. 
        Your goal is to help users find mosques worldwide and view Eid-ul-Fitr 2026 prayer times.
        Current mosques in database: ${JSON.stringify(mosques?.map(m => ({ name: m.name, address: m.address, prayerTimes: m.prayerTimes })) || [])}
        
        Guidelines:
        - Use a friendly, helpful tone (Bengali/English mix).
        - If a user asks for a specific area, tell them you'll show it on the map (the app will handle the search).
        - If a mosque is missing, prompt: "Information not available. Would you like to add the mosque or prayer time?"
        - Validate user-contributed data by asking for confirmation.
        - Use Markdown for tables or lists when showing multiple prayer times.
        - Keep responses concise and focused on Eid prayer times.
        `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...(messages?.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          })) || []),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction
        }
      });

      const text = result.text;
      if (!text) throw new Error('No response from AI');

      setMessages(prev => [...prev, { role: 'model', content: text }]);

      // Simple keyword detection for search
      if (input.toLowerCase().includes('search') || input.toLowerCase().includes('খুঁজ') || input.toLowerCase().includes('কোথায়')) {
        onSearchArea(input);
      }
      if (text.includes('add the mosque') || text.includes('যোগ করতে চান')) {
        // We could trigger the form here if needed
      }

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', content: 'দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। অনুগ্রহ করে আবার চেষ্টা করুন।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-[1000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-[90vw] sm:w-[350px] md:w-[400px] h-[500px] flex flex-col overflow-hidden border border-emerald-100"
          >
            {/* Header */}
            <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={24} />
                <span className="font-bold">ঈদের নামাজ সহকারী</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-emerald-700 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-emerald-50/30">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-emerald-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-1 opacity-70">
                      {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                        {m.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                    <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert text-white' : 'prose-emerald text-gray-800'}`}>
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-emerald-100 shadow-sm">
                    <Loader2 size={20} className="animate-spin text-emerald-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-emerald-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="আপনার প্রশ্ন লিখুন..."
                  className="flex-1 bg-emerald-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2"
      >
        <MessageSquare size={24} />
        {!isOpen && <span className="font-bold hidden md:inline">সহায়তা নিন</span>}
      </motion.button>
    </div>
  );
};

export default ChatComponent;
