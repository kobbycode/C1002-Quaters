import React, { useState } from 'react';
import { useSite } from '../context/SiteContext';

interface RoomAssistantProps {
    roomId: string;
    roomName: string;
}

const RoomAssistant: React.FC<RoomAssistantProps> = ({ roomId, roomName }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mt-12 group">
            <div className={`bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[600px]' : 'max-h-24'}`}>
                <div
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center relative">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <span className="absolute top-0 right-0 w-3 h-3 bg-gold rounded-full border-2 border-white animate-pulse"></span>
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-charcoal uppercase tracking-widest">Ask about {roomName}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">AI Concierge Assistant • Instant Answers</p>
                        </div>
                    </div>
                    <button className={`w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>

                {isExpanded && (
                    <div className="px-6 pb-6 animate-fade-in">
                        <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl italic">
                            "Akwaaba! I'm specifically trained to help with the {roomName}. Ask me about its amenities, layout, or check if it's available for your preferred dates."
                        </p>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[
                                "Is it available next weekend?",
                                "What's included in the price?",
                                "Tell me about the view",
                                "Are there early check-in options?"
                            ].map(q => (
                                <button
                                    key={q}
                                    onClick={() => {
                                        // This would ideally trigger the global concierge with this input
                                        window.dispatchEvent(new CustomEvent('open-concierge', { detail: { text: q, roomId } }));
                                    }}
                                    className="px-4 py-2 rounded-full border border-gray-100 text-[10px] font-bold text-gray-400 hover:border-primary hover:text-primary transition-all bg-white shadow-sm"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-concierge', { detail: { roomId } }))}
                            className="w-full bg-charcoal text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-primary transition-all shadow-lg"
                        >
                            Open Live Chat
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomAssistant;
