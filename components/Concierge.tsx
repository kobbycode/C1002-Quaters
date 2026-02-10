import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSite } from '../context/SiteContext';
import { formatPrice } from '../utils/formatters';
import type { AmenityDetail } from '../types';

const Concierge: React.FC<{ isOpen: boolean; onClose: () => void; roomId?: string }> = ({ isOpen, onClose, roomId }) => {
  const { config, rooms, isRoomAvailable } = useSite();
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; links?: { title: string; uri: string }[] }[]>([
    {
      role: 'model',
      text: roomId
        ? `Akwaaba! I'm your assistant for the ${rooms.find(r => r.id === roomId)?.name || 'suite'}. How can I help you regarding this room's details or availability?`
        : "Akwaaba! I am your AI Concierge. How can I help with your stay in Accra today? I can recommend local restaurants, sights, or help with room details."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const tools = [
    {
      function_declarations: [
        {
          name: "check_room_availability",
          description: "Check if a specific room is available for a range of dates.",
          parameters: {
            type: "object",
            properties: {
              roomId: { type: "string", description: "The ID of the room (e.g., standard-suite)." },
              checkIn: { type: "string", description: "ISO date string for check-in (YYYY-MM-DD)." },
              checkOut: { type: "string", description: "ISO date string for check-out (YYYY-MM-DD)." }
            },
            required: ["roomId", "checkIn", "checkOut"]
          }
        }
      ]
    }
  ];

  const enhancedPrompt = useMemo(() => {
    const roomsInfo = rooms.map(r => `ID: ${r.id} | ${r.name}: ${r.description} (Price: ${formatPrice(r.price, config.currency)}, Amenities: ${r.amenities.join(', ')})`).join('\n');
    const amenitiesInfo = (Object.entries(config.amenityDetails || {}) as [string, AmenityDetail][]).map(([name, detail]) => `${name}: ${detail.description}`).join('\n');
    const knowledgeBaseInfo = (config.aiKnowledgeBase || [])
      .map(k => `Q: ${k.question}\nA: ${k.answer}`)
      .join('\n\n');

    let context = `${config.conciergePrompt}

Additional Specialized Knowledge:
${knowledgeBaseInfo}

Standard Property Context:
Our Rooms:
${roomsInfo}

Detailed Amenities & Facilities:
${amenitiesInfo}

House Rules & Local Info:
- Check-in: 2:00 PM, Check-out: 12:00 PM.
- Location: Spintex, Accra, near the Coastal area.
- Always be ultra-polite, luxury-focused, and use "Akwaaba" (Welcome) where appropriate.`;

    if (roomId) {
      const selectedRoom = rooms.find(r => r.id === roomId);
      if (selectedRoom) {
        context += `\n\nCURRENTLY VIEWING: You are assisting a guest who is currently viewing the ${selectedRoom.name}. Focus your answers on this room unless they ask about others.`;
      }
    }

    return context;
  }, [config, rooms, roomId]);

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
      const ai = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '');
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: enhancedPrompt,
        tools: tools as any
      });

      const chat = model.startChat({
        history: messages.map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }))
      });

      let result = await chat.sendMessage(userMessage);
      let response = await result.response;

      const calls = response.functionCalls();
      if (calls && calls.length > 0) {
        const call = calls[0];
        if (call.name === "check_room_availability") {
          const { roomId: rId, checkIn, checkOut } = call.args as any;
          const available = isRoomAvailable(rId, checkIn, checkOut);

          // Send tool output back to model
          result = await chat.sendMessage([{
            functionResponse: {
              name: "check_room_availability",
              response: { available }
            }
          }]);
          response = await result.response;
        }
      }

      const text = response.text();
      setMessages(prev => [...prev, { role: 'model', text }]);
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
            <h3 className="text-white font-bold text-sm tracking-widest uppercase">AI Concierge</h3>
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
            placeholder="Ask anything about your stay..."
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
