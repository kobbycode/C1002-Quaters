
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useSite } from '../context/SiteContext';

const Concierge: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { config } = useSite();
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; links?: { title: string; uri: string }[] }[]>([
    { role: 'model', text: "Akwaaba! I am your AI Concierge. How can I help with your stay in Accra today? I can recommend local restaurants, sights, or help with room details." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: config.conciergePrompt,
          tools: [{ googleMaps: {} }],
        },
      });

      const text = response.text || "I apologize, I am having trouble connecting with the concierge desk. How else can I help?";
      const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter(chunk => chunk.maps)
        ?.map(chunk => ({ title: chunk.maps.title, uri: chunk.maps.uri })) || [];

      setMessages(prev => [...prev, { role: 'model', text, links }]);
    } catch (error) {
      console.error("Concierge Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm currently attending to another guest. Please try again in a moment or contact our front desk directly." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-8 z-[70] w-full md:w-[400px] h-full md:h-[600px] bg-white md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-fade-in">
      <div className="bg-charcoal p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-white shadow-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-widest uppercase">Concierge</h3>
            <p className="text-gold text-[10px] font-black uppercase tracking-widest animate-pulse">Online</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user'
                ? 'bg-primary text-white rounded-tr-none'
                : 'bg-white text-charcoal border border-gray-100 rounded-tl-none'
              }`}>
              {m.text}
              {m.links && m.links.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
                  {m.links.map((link, li) => (
                    <a key={li} href={link.uri} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gold hover:underline flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      {link.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
              <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about local spots..."
            className="w-full pl-4 pr-12 py-3 rounded-xl border-gray-100 bg-gray-50 focus:ring-gold focus:border-gold text-sm outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 text-gold disabled:opacity-30"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Concierge;
