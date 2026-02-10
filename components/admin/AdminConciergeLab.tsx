import React, { useState } from 'react';
import { SiteConfig } from '../../types';

interface AdminConciergeLabProps {
    config: SiteConfig;
    updateConfig: (config: SiteConfig) => void;
}

export const AdminConciergeLab: React.FC<AdminConciergeLabProps> = ({ config, updateConfig }) => {
    const [newFact, setNewFact] = useState({ question: '', answer: '', category: 'General' });
    const knowledgeBase = config.aiKnowledgeBase || [];

    const handleAddFact = () => {
        if (!newFact.question || !newFact.answer) return;
        updateConfig({
            ...config,
            aiKnowledgeBase: [...knowledgeBase, newFact]
        });
        setNewFact({ question: '', answer: '', category: 'General' });
    };

    const handleRemoveFact = (index: number) => {
        const next = [...knowledgeBase];
        next.splice(index, 1);
        updateConfig({
            ...config,
            aiKnowledgeBase: next
        });
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in pb-20">
            {/* Directives Section */}
            <div className="xl:col-span-1 space-y-8">
                <div className="bg-charcoal p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem] pointer-events-none" />
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-6 bg-gold rounded-full" />
                        <h3 className="text-xl font-black font-serif">Core AI Directive</h3>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6 leading-relaxed">
                        Refine the soul of your digital concierge. These instructions override default behaviors.
                    </p>
                    <textarea
                        value={config.conciergePrompt || ''}
                        onChange={e => updateConfig({ ...config, conciergePrompt: e.target.value })}
                        className="w-full h-80 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm leading-relaxed text-gray-300 focus:border-gold outline-none transition-all font-medium"
                        placeholder="e.g. Always speak with an air of Victorian elegance..."
                    />
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h3 className="text-xl font-black font-serif text-charcoal">AI Lab Status</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-4 border-b border-gray-50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Memory Blocks</span>
                            <span className="text-sm font-black text-charcoal">{knowledgeBase.length}</span>
                        </div>
                        <div className="flex justify-between items-center py-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Response Pattern</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">{config.brand.voice}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Knowledge Base Section */}
            <div className="xl:col-span-2 space-y-8">
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-6 bg-gold rounded-full" />
                            <h3 className="text-2xl font-black font-serif text-charcoal">Knowledge Infusion</h3>
                        </div>
                    </div>

                    <div className="space-y-6 bg-gray-50 rounded-[2rem] p-8 border border-gray-100 mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Topic / Question</label>
                                <input
                                    type="text"
                                    value={newFact.question}
                                    onChange={e => setNewFact({ ...newFact, question: e.target.value })}
                                    className="w-full bg-white border border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-gold outline-none transition-all"
                                    placeholder="e.g. What is the rooftop pool hours?"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Category</label>
                                <select
                                    value={newFact.category}
                                    onChange={e => setNewFact({ ...newFact, category: e.target.value })}
                                    className="w-full bg-white border border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-gold outline-none transition-all"
                                >
                                    <option>General</option>
                                    <option>Check-In/Out</option>
                                    <option>Amenities</option>
                                    <option>Local Area</option>
                                    <option>Emergency</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">The Accurate Answer</label>
                            <textarea
                                value={newFact.answer}
                                onChange={e => setNewFact({ ...newFact, answer: e.target.value })}
                                className="w-full h-32 bg-white border border-gray-100 rounded-xl p-4 text-sm font-medium focus:border-gold outline-none transition-all leading-relaxed"
                                placeholder="Provide the ground truth for the AI..."
                            />
                        </div>
                        <button
                            onClick={handleAddFact}
                            className="bg-charcoal text-white font-black px-8 py-4 rounded-xl hover:bg-gold transition-all shadow-xl shadow-charcoal/10 uppercase tracking-widest text-xs"
                        >
                            Infuse Knowledge
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {knowledgeBase.length === 0 ? (
                            <div className="text-center py-20 grayscale opacity-30">
                                <span className="text-4xl">🧠</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4">Brain is currently empty. Start infusing facts.</p>
                            </div>
                        ) : (
                            knowledgeBase.map((fact, i) => (
                                <div key={i} className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-gold/30 hover:shadow-lg transition-all relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-gold/5 text-gold rounded">{fact.category}</span>
                                        <h4 className="text-sm font-black text-charcoal">{fact.question}</h4>
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed pr-10">{fact.answer}</p>
                                    <button
                                        onClick={() => handleRemoveFact(i)}
                                        className="absolute top-6 right-6 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
