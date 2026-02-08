import React from 'react';
import { SiteConfig } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AdminConciergeProps {
    config: SiteConfig;
    updateConfig: (config: SiteConfig) => void;
}

export const AdminConcierge: React.FC<AdminConciergeProps> = ({ config, updateConfig }) => {
    const { showToast } = useToast();
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h3 className="text-2xl font-black font-serif text-charcoal">Concierge Intelligence</h3>
                    </div>

                    <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-2xl">
                        Define the personality and knowledge base of your digital concierge.
                        This prompt guides how the AI interacts with guests, handles requests, and represents the Quarters brand.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Master Directive / System Prompt</label>
                            <textarea
                                value={config.conciergePrompt || ''}
                                onChange={e => updateConfig({ ...config, conciergePrompt: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-8 text-sm font-medium focus:border-gold outline-none transition-all leading-relaxed"
                                rows={15}
                                placeholder="You are the ultimate luxury concierge for C1002 Quarters..."
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => showToast('Concierge directive updated successfully', 'success')}
                                className="bg-charcoal text-white font-black px-10 py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/20"
                            >
                                Synchronize AI Persona
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Tips Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Tone of Voice', desc: 'Use words like "Indeed", "Exquisite", and "Pleasure" to maintain a regal Ghanaian atmosphere.' },
                    { title: 'Knowledge Base', desc: 'Mention specific amenities like the Nespresso machines or the Spintex Garden Villa.' },
                    { title: 'Goal Setting', desc: 'Instruct the AI to prioritize guest comfort and provide proactive local recommendations.' }
                ].map((tip, i) => (
                    <div key={i} className="bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gold mb-3">{tip.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{tip.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
