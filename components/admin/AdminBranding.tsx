import React from 'react';
import { SiteConfig } from '../../types';
import { formatLuxuryText } from '../../utils/formatters';

interface AdminBrandingProps {
    config: SiteConfig;
    updateConfig: (config: SiteConfig) => void;
    handleAiWriter: (field: 'description' | 'hero' | 'tagline', context: string) => Promise<void>;
    isAiGenerating: boolean;
}

export const AdminBranding: React.FC<AdminBrandingProps> = ({
    config,
    updateConfig,
    handleAiWriter,
    isAiGenerating
}) => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
            {/* Main Branding Controls */}
            <div className="xl:col-span-2 space-y-8">
                {/* Brand Identity Section */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-6 bg-gold rounded-full" />
                        <h3 className="text-2xl font-black font-serif text-charcoal">Brand Identity</h3>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Brand Name</label>
                            <input
                                type="text"
                                value={config.brand?.name || ''}
                                onChange={e => updateConfig({ ...config, brand: { ...(config.brand || {}), name: e.target.value } })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-lg font-black focus:border-gold outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Brand Tagline</label>
                                <input
                                    type="text"
                                    value={config.brand?.tagline || ''}
                                    onChange={e => updateConfig({ ...config, brand: { ...(config.brand || {}), tagline: e.target.value } })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm font-medium focus:border-gold outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    const result = await handleAiWriter('tagline', config.brand?.name || '');
                                    if (result) updateConfig({ ...config, brand: { ...(config.brand || {}), tagline: result } });
                                }}
                                disabled={isAiGenerating}
                                className="h-[58px] px-6 bg-charcoal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gold transition-all disabled:opacity-50 hover-lift flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                {isAiGenerating ? 'Generating...' : 'AI Rewrite'}
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Brand Voice / Persona</label>
                            <select
                                value={config.brand?.voice || 'Regal & Sophisticated'}
                                onChange={e => updateConfig({ ...config, brand: { ...(config.brand || {}), voice: e.target.value } })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm font-bold focus:border-gold outline-none transition-all"
                            >
                                <option>Regal & Sophisticated</option>
                                <option>Warm & Welcoming</option>
                                <option>Modern & Avant-Garde</option>
                                <option>Minimalist & Zen</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Color Palette Section */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h3 className="text-2xl font-black font-serif text-charcoal">Color Palette</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Primary Color */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-4 block">Primary Signature Color</label>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-16 h-16 rounded-2xl shadow-lg cursor-pointer relative overflow-hidden color-swatch"
                                        style={{ backgroundColor: config.brand?.primaryColor || '#8B008B' }}
                                    >
                                        <input
                                            type="color"
                                            value={config.brand?.primaryColor || '#8B008B'}
                                            onChange={e => updateConfig({ ...config, brand: { ...(config.brand || {}), primaryColor: e.target.value } })}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={config.brand?.primaryColor || '#8B008B'}
                                        onChange={e => updateConfig({ ...config, brand: { ...(config.brand || {}), primaryColor: e.target.value } })}
                                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-mono font-bold uppercase focus:border-gold outline-none transition-all"
                                    />
                                </div>
                                {/* Preset Colors */}
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Quick Presets</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {['#8B008B', '#1a1a2e', '#8B008B', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateConfig({ ...config, brand: { ...(config.brand || {}), primaryColor: color } })}
                                                className={`w-8 h-8 rounded-lg color-swatch ${config.brand?.primaryColor === color ? 'selected ring-2 ring-offset-2 ring-gray-300' : ''}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Accent Color */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-4 block">Accent Signature Color</label>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-16 h-16 rounded-2xl shadow-lg cursor-pointer relative overflow-hidden color-swatch"
                                        style={{ backgroundColor: config.brand?.accentColor || '#8B008B' }}
                                    >
                                        <input
                                            type="color"
                                            value={config.brand?.accentColor || '#8B008B'}
                                            onChange={e => updateConfig({ ...config, brand: { ...(config.brand || {}), accentColor: e.target.value } })}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={config.brand?.accentColor || '#8B008B'}
                                        onChange={e => updateConfig({ ...config, brand: { ...(config.brand || {}), accentColor: e.target.value } })}
                                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-mono font-bold uppercase focus:border-gold outline-none transition-all"
                                    />
                                </div>
                                {/* Preset Colors */}
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Quick Presets</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {['#1a1a2e', '#8B008B', '#0d9488', '#7c3aed', '#db2777', '#ea580c', '#059669', '#2563eb'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => updateConfig({ ...config, brand: { ...(config.brand || {}), accentColor: color } })}
                                                className={`w-8 h-8 rounded-lg color-swatch ${config.brand?.accentColor === color ? 'selected ring-2 ring-offset-2 ring-gray-300' : ''}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Links Section */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-6 bg-charcoal rounded-full" />
                        <h3 className="text-2xl font-black font-serif text-charcoal">Social Presence</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                Instagram
                            </label>
                            <input
                                type="text"
                                value={config.brand?.socials?.instagram || ''}
                                onChange={e => updateConfig({ ...config, brand: { ...(config.brand || {}), socials: { ...(config.brand?.socials || {}), instagram: e.target.value } } })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-gold outline-none transition-all"
                                placeholder="@yourbrand"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                LinkedIn
                            </label>
                            <input
                                type="text"
                                value={config.brand?.socials?.linkedin || ''}
                                onChange={e => updateConfig({ ...config, brand: { ...(config.brand || {}), socials: { ...(config.brand?.socials || {}), linkedin: e.target.value } } })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-gold outline-none transition-all"
                                placeholder="linkedin.com/company/yourbrand"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Preview Panel */}
            <div className="xl:col-span-1">
                <div className="bg-charcoal p-8 rounded-[2.5rem] shadow-2xl shadow-charcoal/30 sticky top-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-6 bg-gold rounded-full" />
                        <h3 className="text-xl font-black font-serif text-white">Live Preview</h3>
                    </div>

                    {/* Mini Site Preview */}
                    <div className="bg-white rounded-[2rem] overflow-hidden mb-8 border border-white/10 shadow-2xl">
                        {/* Header Mock */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: config.brand.primaryColor }} />
                                <span className="text-[10px] font-black font-serif tracking-tight" style={{ color: config.brand.primaryColor }}>{config.brand.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-10 h-1 bg-gray-100 rounded-full" />
                                <div className="w-10 h-1 bg-gray-100 rounded-full" />
                            </div>
                        </div>

                        {/* Hero Mock */}
                        <div className="h-40 relative flex items-center justify-center text-center px-4 overflow-hidden">
                            <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000")` }} />
                            <div className="relative z-10">
                                <p className="text-[7px] font-black uppercase tracking-[.4em] text-white/60 mb-1">{config.brand.tagline}</p>
                                <h4 className="text-white text-sm font-serif leading-tight">
                                    {formatLuxuryText(`Experience *${config.brand.name}*`)}
                                </h4>
                                <div className="mt-4 flex justify-center">
                                    <div className="px-4 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-widest text-white shadow-lg" style={{ backgroundColor: config.brand.primaryColor }}>
                                        Explore Suites
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Mock */}
                        <div className="p-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                            <span className="text-[8px] font-bold text-gray-400">© 2024 {config.brand.name}</span>
                            <div className="flex gap-3">
                                {config.brand?.socials?.instagram && <div className="w-3 h-3 rounded-sm opacity-30" style={{ backgroundColor: config.brand.primaryColor }} title="Instagram" />}
                                {config.brand?.socials?.linkedin && <div className="w-3 h-3 rounded-sm opacity-30" style={{ backgroundColor: config.brand.primaryColor }} title="LinkedIn" />}
                            </div>
                        </div>
                    </div>

                    {/* Color Utility Check */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Branding Logic</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="w-full h-8 rounded-lg mb-3" style={{ backgroundColor: config.brand.primaryColor }} />
                                    <p className="text-[9px] font-black text-white/60 uppercase text-center">Primary</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="w-full h-8 rounded-lg mb-3" style={{ backgroundColor: config.brand.primaryColor }} />
                                    <p className="text-[9px] font-black text-white/60 uppercase text-center">Gold (Mapped)</p>
                                </div>
                            </div>
                        </div>

                        {/* Typography & Voice */}
                        <div className="pt-6 border-t border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Typography & Voice</p>
                            <div className="p-6 rounded-[2rem] bg-white text-charcoal shadow-xl">
                                <h3 className="text-2xl font-black font-serif mb-2 leading-tight">
                                    {formatLuxuryText(`The *${config.brand.voice}* Suite`)}
                                </h3>
                                <p className="text-xs text-gray-400 leading-relaxed font-medium italic">
                                    "{config.brand.tagline}"
                                </p>
                            </div>
                        </div>

                        {/* CTA Preview */}
                        <button className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-white shadow-2xl transition-all" style={{ backgroundColor: config.brand.primaryColor }}>
                            Sample Call to Action
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
