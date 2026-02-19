import React, { useState } from 'react';
import { SiteConfig } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AdminPagesProps {
    config: SiteConfig;
    updateConfig: (config: SiteConfig) => void;
}

export const AdminPages: React.FC<AdminPagesProps> = ({
    config,
    updateConfig
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
                            <p className="text-2xl font-black text-gold">3</p>
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
                                    value={config.aboutPage?.heroTitle || ''}
                                    onChange={e => updateConfig({ ...config, aboutPage: { ...(config.aboutPage || {}), heroTitle: e.target.value } })}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                                    placeholder="e.g. A Legacy of Elegance"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Hero Sub-Anchor</label>
                                <input
                                    type="text"
                                    value={config.aboutPage?.heroSubtitle || ''}
                                    onChange={e => updateConfig({ ...config, aboutPage: { ...(config.aboutPage || {}), heroSubtitle: e.target.value } })}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                                    placeholder="e.g. Est. 2024"
                                />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gold block">Heritage Narrative - Phase I</label>
                                </div>
                                <textarea
                                    rows={4}
                                    value={config.aboutPage?.heritageDescription1 || ''}
                                    onChange={e => updateConfig({ ...config, aboutPage: { ...(config.aboutPage || {}), heritageDescription1: e.target.value } })}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium leading-relaxed outline-none focus:ring-2 ring-gold/20"
                                    placeholder="The beginning of the story..."
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gold block">Heritage Narrative - Phase II</label>
                                </div>
                                <textarea
                                    rows={4}
                                    value={config.aboutPage?.heritageDescription2 || ''}
                                    onChange={e => updateConfig({ ...config, aboutPage: { ...(config.aboutPage || {}), heritageDescription2: e.target.value } })}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium leading-relaxed outline-none focus:ring-2 ring-gold/20"
                                    placeholder="The growth and evolution..."
                                />
                            </div>
                        </div>

                        {/* Pillars Section */}
                        <div className="mt-12 border-t border-gray-100 pt-10">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h4 className="text-xl font-black font-serif text-charcoal">Structural Pillars</h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gold mt-1">Core Values & Mission</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const newPillars = [...(config.aboutPage?.pillars || []), { title: 'New Pillar', description: '' }];
                                        updateConfig({ ...config, aboutPage: { ...(config.aboutPage || {}), pillars: newPillars } });
                                    }}
                                    className="px-4 py-2 bg-charcoal text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gold transition-all"
                                >
                                    + Add Pillar
                                </button>
                            </div>

                            <div className="space-y-6">
                                {(config.aboutPage?.pillars || []).map((pillar, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative group">
                                        <button
                                            onClick={() => {
                                                const newPillars = (config.aboutPage?.pillars || []).filter((_, i) => i !== idx);
                                                updateConfig({ ...config, aboutPage: { ...(config.aboutPage || {}), pillars: newPillars } });
                                            }}
                                            className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                        <div className="grid grid-cols-1 gap-4">
                                            <input
                                                type="text"
                                                value={pillar.title}
                                                onChange={e => {
                                                    const newPillars = [...(config.aboutPage?.pillars || [])];
                                                    newPillars[idx].title = e.target.value;
                                                    updateConfig({ ...config, aboutPage: { ...(config.aboutPage || {}), pillars: newPillars } });
                                                }}
                                                className="bg-transparent border-none p-0 text-sm font-black text-charcoal focus:ring-0 w-full"
                                                placeholder="Pillar Title"
                                            />
                                            <textarea
                                                rows={2}
                                                value={pillar.description}
                                                onChange={e => {
                                                    const newPillars = [...(config.aboutPage?.pillars || [])];
                                                    newPillars[idx].description = e.target.value;
                                                    updateConfig({ ...config, aboutPage: { ...(config.aboutPage || {}), pillars: newPillars } });
                                                }}
                                                className="bg-transparent border-none p-0 text-xs font-medium text-gray-400 focus:ring-0 w-full resize-none"
                                                placeholder="Pillar Narrative..."
                                            />
                                        </div>
                                    </div>
                                ))}
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
                                <textarea
                                    rows={3}
                                    value={config.contactPage?.heroDescription || ''}
                                    onChange={e => updateConfig({ ...config, contactPage: { ...(config.contactPage || {}), heroDescription: e.target.value } })}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium outline-none focus:ring-2 ring-gold/20"
                                    placeholder="Inviting guests to connect..."
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Geospatial Embed Index (Map URL)</label>
                                <input
                                    type="text"
                                    value={config.contactPage?.mapEmbedUrl || ''}
                                    onChange={e => updateConfig({ ...config, contactPage: { ...(config.contactPage || {}), mapEmbedUrl: e.target.value } })}
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
            {/* Global Registry Summary */}
            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-1.5 h-6 bg-gold rounded-full" />
                    <h2 className="text-2xl font-black font-serif text-charcoal">Global Registry</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Founding Year</label>
                        <input
                            type="text"
                            value={config.foundingYear}
                            onChange={e => updateConfig({ ...config, foundingYear: e.target.value })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                            placeholder="e.g. 1957"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Latitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={config.contactPage?.coordinates?.lat || 0}
                            onChange={e => updateConfig({ ...config, contactPage: { ...(config.contactPage || {}), coordinates: { ...(config.contactPage?.coordinates || { lat: 0, lng: 0 }), lat: parseFloat(e.target.value) } } })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Longitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={config.contactPage?.coordinates?.lng || 0}
                            onChange={e => updateConfig({ ...config, contactPage: { ...(config.contactPage || {}), coordinates: { ...(config.contactPage?.coordinates || { lat: 0, lng: 0 }), lng: parseFloat(e.target.value) } } })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};
