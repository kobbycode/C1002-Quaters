import React, { useState } from 'react';
import { SiteConfig } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AdminPagesProps {
    config: SiteConfig;
    updateConfig: (config: SiteConfig) => void;
    handleAiWriter: (field: 'description' | 'hero' | 'tagline' | 'about' | 'contact', context: string) => Promise<string | null | void>;
    isAiGenerating: boolean;
}

export const AdminPages: React.FC<AdminPagesProps> = ({
    config,
    updateConfig,
    handleAiWriter,
    isAiGenerating
}) => {
    const { showToast } = useToast();
    const [editingAboutPage, setEditingAboutPage] = useState(false);
    const [editingContactPage, setEditingContactPage] = useState(false);

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-gold rounded-full" />
                        <h2 className="text-2xl font-black font-serif text-charcoal">Page Registry</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* About Page Entry */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:border-gold/30">
                        <div className="flex items-center gap-8 flex-1 min-w-0">
                            <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                            <div className="truncate">
                                <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-1">Heritage Narrative</p>
                                <p className="text-sm font-black text-charcoal truncate">About Page</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 ml-6">
                            <button
                                onClick={() => setEditingAboutPage(true)}
                                className="text-[10px] font-black uppercase text-primary hover:underline"
                            >
                                Modify
                            </button>
                        </div>
                    </div>

                    {/* Contact Page Entry */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:border-gold/30">
                        <div className="flex items-center gap-8 flex-1 min-w-0">
                            <div className="w-1.5 h-1.5 bg-charcoal rounded-full" />
                            <div className="truncate">
                                <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-1">Spatial Coordinates</p>
                                <p className="text-sm font-black text-charcoal truncate">Contact Page</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 ml-6">
                            <button
                                onClick={() => setEditingContactPage(true)}
                                className="text-[10px] font-black uppercase text-primary hover:underline"
                            >
                                Modify
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Narrative Intelligence Summary */}
            <div className="bg-charcoal p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gold/5 mix-blend-overlay" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h4 className="text-2xl font-black font-serif text-white mb-2">Narrative Intelligence</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Every word on your pages contributes to the digital aura of C1002 Quarters. Manage your heritage and location narratives here.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                            <p className="text-2xl font-black text-gold">2</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Live Pages</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Page Editor Modal */}
            {editingAboutPage && (
                <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] p-12 shadow-2xl relative overflow-hidden overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h2 className="text-3xl font-black font-serif text-charcoal">About Manuscript</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gold mt-2">Historical & Brand Narrative</p>
                            </div>
                            <button onClick={() => setEditingAboutPage(false)} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Hero Headline</label>
                                <input
                                    type="text"
                                    value={config.aboutPage.heroTitle}
                                    onChange={e => updateConfig({ ...config, aboutPage: { ...config.aboutPage, heroTitle: e.target.value } })}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                                    placeholder="e.g. A Legacy of Elegance"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Hero Sub-Anchor</label>
                                <input
                                    type="text"
                                    value={config.aboutPage.heroSubtitle}
                                    onChange={e => updateConfig({ ...config, aboutPage: { ...config.aboutPage, heroSubtitle: e.target.value } })}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                                    placeholder="e.g. Est. 2024"
                                />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gold block">Heritage Narrative - Phase I</label>
                                    <button
                                        onClick={async () => {
                                            const result = await handleAiWriter('about', 'heritage background phase 1');
                                            if (result) updateConfig({ ...config, aboutPage: { ...config.aboutPage, heritageDescription1: result } });
                                        }}
                                        disabled={isAiGenerating}
                                        className="text-[9px] font-black uppercase text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                                    >
                                        <span>{isAiGenerating ? 'Generating...' : '✨ AI Draft'}</span>
                                    </button>
                                </div>
                                <textarea
                                    rows={4}
                                    value={config.aboutPage.heritageDescription1}
                                    onChange={e => updateConfig({ ...config, aboutPage: { ...config.aboutPage, heritageDescription1: e.target.value } })}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium leading-relaxed outline-none focus:ring-2 ring-gold/20"
                                    placeholder="The beginning of the story..."
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gold block">Heritage Narrative - Phase II</label>
                                    <button
                                        onClick={async () => {
                                            const result = await handleAiWriter('about', 'heritage background phase 2');
                                            if (result) updateConfig({ ...config, aboutPage: { ...config.aboutPage, heritageDescription2: result } });
                                        }}
                                        disabled={isAiGenerating}
                                        className="text-[9px] font-black uppercase text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                                    >
                                        <span>{isAiGenerating ? 'Generating...' : '✨ AI Draft'}</span>
                                    </button>
                                </div>
                                <textarea
                                    rows={4}
                                    value={config.aboutPage.heritageDescription2}
                                    onChange={e => updateConfig({ ...config, aboutPage: { ...config.aboutPage, heritageDescription2: e.target.value } })}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium leading-relaxed outline-none focus:ring-2 ring-gold/20"
                                    placeholder="The growth and evolution..."
                                />
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4">
                            <button
                                onClick={() => {
                                    setEditingAboutPage(false);
                                    showToast('Manuscript Synchronized');
                                }}
                                className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/20"
                            >
                                Synchronize Narrative
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Page Editor Modal */}
            {editingContactPage && (
                <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-3xl rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h2 className="text-3xl font-black font-serif text-charcoal">Spatial Coordinates</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gold mt-2">Gateway & Physical Presence</p>
                            </div>
                            <button onClick={() => setEditingContactPage(false)} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Hero Narrative Lead</label>
                                <div className="relative">
                                    <textarea
                                        rows={3}
                                        value={config.contactPage.heroDescription}
                                        onChange={e => updateConfig({ ...config, contactPage: { ...config.contactPage, heroDescription: e.target.value } })}
                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium outline-none focus:ring-2 ring-gold/20 pr-24"
                                        placeholder="Inviting guests to connect..."
                                    />
                                    <button
                                        onClick={async () => {
                                            const result = await handleAiWriter('contact', 'contact page greeting');
                                            if (result) updateConfig({ ...config, contactPage: { ...config.contactPage, heroDescription: result } });
                                        }}
                                        disabled={isAiGenerating}
                                        className="absolute bottom-6 right-6 text-[9px] font-black uppercase text-primary bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 disabled:opacity-50"
                                    >
                                        <span>{isAiGenerating ? 'Generating...' : '✨ AI Write'}</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Geospatial Embed Index (Map URL)</label>
                                <input
                                    type="text"
                                    value={config.contactPage.mapEmbedUrl}
                                    onChange={e => updateConfig({ ...config, contactPage: { ...config.contactPage, mapEmbedUrl: e.target.value } })}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-[10px] font-mono font-bold outline-none focus:ring-2 ring-gold/20"
                                    placeholder="https://www.google.com/maps/embed?..."
                                />
                                <p className="text-[9px] text-gray-400 mt-3 italic">"Ensure the URL begins with HTTPS for secure spatial rendering."</p>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4">
                            <button
                                onClick={() => {
                                    setEditingContactPage(false);
                                    showToast('Coordinates Calibrated');
                                }}
                                className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/20"
                            >
                                Update Vector Node
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
