import React, { useState } from 'react';
import { SiteConfig } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AdminGymProps {
    config: SiteConfig;
    updateConfig: (config: SiteConfig) => void;
    handleAiWriter?: (field: 'description' | 'hero' | 'tagline' | 'about' | 'contact', context: string) => Promise<string | null | void>;
    isAiGenerating?: boolean;
}

export const AdminGym: React.FC<AdminGymProps> = ({
    config,
    updateConfig,
    handleAiWriter,
    isAiGenerating
}) => {
    const { showToast } = useToast();

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-gold rounded-full" />
                        <h2 className="text-2xl font-black font-serif text-charcoal">Wellness Quarter</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Hero Headline</label>
                        <input
                            type="text"
                            value={config.gymPage?.heroTitle || ''}
                            onChange={e => updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), heroTitle: e.target.value } })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                            placeholder="e.g. Elevate Your *Vitality*"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Hero Sub-Anchor</label>
                        <input
                            type="text"
                            value={config.gymPage?.heroSubtitle || ''}
                            onChange={e => updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), heroSubtitle: e.target.value } })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                            placeholder="e.g. The Wellness Quarter"
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Hero Carousel Slides</label>
                        <div className="grid grid-cols-1 gap-4">
                            {(config.gymPage?.heroSlides || []).map((slide, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={slide}
                                        onChange={e => {
                                            const newSlides = [...(config.gymPage?.heroSlides || [])];
                                            newSlides[idx] = e.target.value;
                                            updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), heroSlides: newSlides } });
                                        }}
                                        className="flex-1 bg-gray-50 border-gray-100 rounded-2xl p-4 text-xs font-mono outline-none focus:ring-2 ring-gold/20"
                                        placeholder="Image URL"
                                    />
                                    <button
                                        onClick={() => {
                                            const newSlides = (config.gymPage?.heroSlides || []).filter((_, i) => i !== idx);
                                            updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), heroSlides: newSlides } });
                                        }}
                                        className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-100"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    const newSlides = [...(config.gymPage?.heroSlides || []), ''];
                                    updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), heroSlides: newSlides } });
                                }}
                                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-gold hover:text-gold transition-all"
                            >
                                + Add Slide Image
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Facility Headline</label>
                            <input
                                type="text"
                                value={config.gymPage?.facilityTitle || ''}
                                onChange={e => updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), facilityTitle: e.target.value } })}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                                placeholder="e.g. Designed for *Peak Performance*"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Facility Label</label>
                            <input
                                type="text"
                                value={config.gymPage?.facilitySubtitle || ''}
                                onChange={e => updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), facilitySubtitle: e.target.value } })}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                                placeholder="e.g. The Facility"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Facility Philosophy Quote</label>
                        <textarea
                            rows={2}
                            value={config.gymPage?.facilityQuote || ''}
                            onChange={e => updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), facilityQuote: e.target.value } })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium italic outline-none focus:ring-2 ring-gold/20"
                            placeholder="At C1002 Quarters, we believe..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Narrative Phase I</label>
                            <textarea
                                rows={4}
                                value={config.gymPage?.facilityDescription1 || ''}
                                onChange={e => updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), facilityDescription1: e.target.value } })}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-xs font-medium leading-relaxed outline-none focus:ring-2 ring-gold/20"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Narrative Phase II</label>
                            <textarea
                                rows={4}
                                value={config.gymPage?.facilityDescription2 || ''}
                                onChange={e => updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), facilityDescription2: e.target.value } })}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-xs font-medium leading-relaxed outline-none focus:ring-2 ring-gold/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Facility Feature Image</label>
                        <input
                            type="text"
                            value={config.gymPage?.facilityImage || ''}
                            onChange={e => updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), facilityImage: e.target.value } })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-xs font-mono outline-none focus:ring-2 ring-gold/20"
                        />
                    </div>

                    {/* Gym Amenities Section */}
                    <div className="mt-12 border-t border-gray-100 pt-10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h4 className="text-xl font-black font-serif text-charcoal">Curated Amenities</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gold mt-1">Equipment & Services</p>
                            </div>
                            <button
                                onClick={() => {
                                    const newAmenities = [...(config.gymPage?.amenities || []), { title: 'New Amenity', desc: '', icon: '⚡' }];
                                    updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), amenities: newAmenities } });
                                }}
                                className="px-4 py-2 bg-charcoal text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gold transition-all"
                            >
                                + Add Amenity
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(config.gymPage?.amenities || []).map((amenity, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative group">
                                    <button
                                        onClick={() => {
                                            const newAmenities = (config.gymPage?.amenities || []).filter((_, i) => i !== idx);
                                            updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), amenities: newAmenities } });
                                        }}
                                        className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                    <div className="flex gap-4 items-center mb-4">
                                        <input
                                            type="text"
                                            value={amenity.icon}
                                            onChange={e => {
                                                const newAmenities = [...(config.gymPage?.amenities || [])];
                                                newAmenities[idx].icon = e.target.value;
                                                updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), amenities: newAmenities } });
                                            }}
                                            className="w-12 h-12 bg-white rounded-xl text-xl flex items-center justify-center border border-gray-100 text-center"
                                        />
                                        <input
                                            type="text"
                                            value={amenity.title}
                                            onChange={e => {
                                                const newAmenities = [...(config.gymPage?.amenities || [])];
                                                newAmenities[idx].title = e.target.value;
                                                updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), amenities: newAmenities } });
                                            }}
                                            className="bg-transparent border-none p-0 text-sm font-black text-charcoal focus:ring-0 flex-1"
                                        />
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={amenity.desc}
                                        onChange={e => {
                                            const newAmenities = [...(config.gymPage?.amenities || [])];
                                            newAmenities[idx].desc = e.target.value;
                                            updateConfig({ ...config, gymPage: { ...(config.gymPage || {}), amenities: newAmenities } });
                                        }}
                                        className="bg-transparent border-none p-0 text-xs font-medium text-gray-400 focus:ring-0 w-full resize-none leading-relaxed"
                                        placeholder="Description..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4">
                    <button
                        onClick={() => {
                            showToast('Vitality Index Synchronized');
                        }}
                        className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/20"
                    >
                        Synchronize Vitality
                    </button>
                </div>
            </div>
        </div>
    );
};
