import React, { useState } from 'react';
import { SiteConfig, HeroSlide } from '../../types';
import { formatLuxuryText } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import ImageUpload from '../ImageUpload';

interface AdminHomeProps {
    config: SiteConfig;
    updateConfig: (config: SiteConfig) => void;
    setEditingHero: (slide: HeroSlide) => void;
}

export const AdminHome: React.FC<AdminHomeProps> = ({
    config,
    updateConfig,
    setEditingHero
}) => {
    const { showToast } = useToast();
    // Local drag and drop state for hero slides
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '0.5';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (targetIndex: number) => {
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        const newSlides = [...(config.heroSlides || [])];
        const [removed] = newSlides.splice(draggedIndex, 1);
        newSlides.splice(targetIndex, 0, removed);

        updateConfig({ ...config, heroSlides: newSlides });
        showToast('Hero slides reordered');

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '1';
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-gold rounded-full" />
                        <h2 className="text-2xl font-black font-serif text-charcoal">Narrative Sequence</h2>
                    </div>
                    <button
                        onClick={() => {
                            setEditingHero({ id: Date.now().toString(), image: '', subtitle: '', title: '', description: '' });
                        }}
                        className="bg-charcoal text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold transition-all shadow-xl shadow-charcoal/20"
                    >
                        + Compose Slide
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {(config.heroSlides || []).map((slide, index) => (
                        <div
                            key={slide.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={() => handleDrop(index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:border-gold/30 ${dragOverIndex === index ? 'border-dashed border-2 border-gold scale-[1.01]' : ''}`}
                        >
                            <div className="flex items-center gap-8 flex-1 min-w-0">
                                <div className="cursor-move opacity-30 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                    </svg>
                                </div>
                                <div className="w-20 h-14 bg-white rounded-lg overflow-hidden border border-gray-100 shrink-0">
                                    {slide.image ? (
                                        <img src={slide.image} className="w-full h-full object-cover" alt={slide.title} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">No Image</div>
                                    )}
                                </div>
                                <div className="truncate">
                                    <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-1">{slide.subtitle || 'NO SUBTITLE'}</p>
                                    <p className="text-sm font-black text-charcoal truncate">
                                        {formatLuxuryText(slide.title || 'Untitled Narrative')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 ml-6">
                                <button
                                    onClick={() => setEditingHero(slide)}
                                    className="text-[10px] font-black uppercase text-primary hover:underline"
                                >
                                    Modify
                                </button>
                                <button
                                    onClick={() => {
                                        const newSlides = (config.heroSlides || []).filter(s => s.id !== slide.id);
                                        updateConfig({ ...config, heroSlides: newSlides });
                                        showToast('Slide removed');
                                    }}
                                    className="text-[10px] font-black uppercase text-red-400 hover:text-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {(!config.heroSlides || config.heroSlides.length === 0) && (
                        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                            <p className="text-gray-400 font-serif italic text-lg">Your brand story awaits its first chapter...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-gold rounded-full" />
                        <h2 className="text-2xl font-black font-serif text-charcoal">Experience Master</h2>
                    </div>
                </div>
                <div className="space-y-6">
                    {config.homeExperience?.map((exp, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-2 block">Icon</label>
                                <input
                                    type="text"
                                    value={exp.icon}
                                    onChange={e => {
                                        const newExperience = [...(config.homeExperience || [])];
                                        newExperience[i] = { ...exp, icon: e.target.value };
                                        updateConfig({ ...config, homeExperience: newExperience });
                                    }}
                                    className="w-full bg-white border-gray-100 rounded-xl p-4 text-sm font-bold outline-none"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-2 block">Title</label>
                                <input
                                    type="text"
                                    value={exp.title}
                                    onChange={e => {
                                        const newExperience = [...(config.homeExperience || [])];
                                        newExperience[i] = { ...exp, title: e.target.value };
                                        updateConfig({ ...config, homeExperience: newExperience });
                                    }}
                                    className="w-full bg-white border-gray-100 rounded-xl p-4 text-sm font-bold outline-none"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-2 block">Description</label>
                                <textarea
                                    rows={2}
                                    value={exp.description}
                                    onChange={e => {
                                        const newExperience = [...(config.homeExperience || [])];
                                        newExperience[i] = { ...exp, description: e.target.value };
                                        updateConfig({ ...config, homeExperience: newExperience });
                                    }}
                                    className="w-full bg-white border-gray-100 rounded-xl p-4 text-xs font-medium outline-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-charcoal p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gold/5 mix-blend-overlay" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-1.5 h-6 bg-gold rounded-full" />
                        <h2 className="text-2xl font-black font-serif text-white">Sense of Place (Pulse)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Section Title</label>
                                <input
                                    type="text"
                                    value={config.homePulse?.title || ''}
                                    onChange={e => updateConfig({ ...config, homePulse: { ...(config.homePulse || {}), title: e.target.value } })}
                                    className="w-full bg-white/5 border-white/10 text-white rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Subtitle</label>
                                <input
                                    type="text"
                                    value={config.homePulse?.subtitle || ''}
                                    onChange={e => updateConfig({ ...config, homePulse: { ...(config.homePulse || {}), subtitle: e.target.value } })}
                                    className="w-full bg-white/5 border-white/10 text-white rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Narrative Description</label>
                                <textarea
                                    rows={4}
                                    value={config.homePulse?.description || ''}
                                    onChange={e => updateConfig({ ...config, homePulse: { ...(config.homePulse || {}), description: e.target.value } })}
                                    className="w-full bg-white/5 border-white/10 text-white rounded-2xl p-6 text-sm font-medium outline-none focus:ring-2 ring-gold/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Pulse Visual (Main Image)</label>
                            <div className="aspect-[4/5] bg-white/5 rounded-3xl overflow-hidden border border-white/10 mb-4">
                                {config.homePulse?.image ? (
                                    <img src={config.homePulse.image} alt="Pulse" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] font-black uppercase">No Visual Assigned</div>
                                )}
                            </div>
                            <ImageUpload
                                onImageUploaded={(url) => updateConfig({ ...config, homePulse: { ...(config.homePulse || {}), image: url } })}
                                folder="site/home"
                            />
                        </div>
                    </div>

                    {/* Pulse Pillars Management */}
                    <div className="border-t border-white/10 pt-10 mt-10">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black font-serif text-white">Location Pillars</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gold mt-1">Section Highlights</p>
                            </div>
                            <button
                                onClick={() => {
                                    const newPillars = [...((config.homePulse?.pillars) || []), { title: 'New Highlight', description: '' }];
                                    updateConfig({ ...config, homePulse: { ...(config.homePulse || {}), pillars: newPillars } });
                                }}
                                className="px-6 py-3 bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gold transition-all"
                            >
                                + Add Pillar
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(config.homePulse?.pillars || []).map((pillar, idx) => (
                                <div key={idx} className="bg-white/5 rounded-2xl p-6 border border-white/5 relative group">
                                    <button
                                        onClick={() => {
                                            const newPillars = (config.homePulse?.pillars || []).filter((_, i) => i !== idx);
                                            updateConfig({ ...config, homePulse: { ...(config.homePulse || {}), pillars: newPillars } });
                                        }}
                                        className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={pillar.title}
                                            onChange={e => {
                                                const newPillars = [...(config.homePulse?.pillars || [])];
                                                newPillars[idx] = { ...pillar, title: e.target.value };
                                                updateConfig({ ...config, homePulse: { ...(config.homePulse || {}), pillars: newPillars } });
                                            }}
                                            className="bg-transparent border-none p-0 text-sm font-black text-gold focus:ring-0 w-full"
                                            placeholder="Pillar Title"
                                        />
                                        <textarea
                                            rows={2}
                                            value={pillar.description}
                                            onChange={e => {
                                                const newPillars = [...(config.homePulse?.pillars || [])];
                                                newPillars[idx] = { ...pillar, description: e.target.value };
                                                updateConfig({ ...config, homePulse: { ...(config.homePulse || {}), pillars: newPillars } });
                                            }}
                                            className="bg-transparent border-none p-0 text-xs font-medium text-white/50 focus:ring-0 w-full resize-none"
                                            placeholder="Pillar Narrative..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

