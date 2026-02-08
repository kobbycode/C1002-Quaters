import React, { useState } from 'react';
import { SiteConfig, HeroSlide } from '../../types';
import { formatLuxuryText } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

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

        const newSlides = [...config.heroSlides];
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
                    {config.heroSlides.map((slide, index) => (
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
                                        const newSlides = config.heroSlides.filter(s => s.id !== slide.id);
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
                    {config.heroSlides.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                            <p className="text-gray-400 font-serif italic text-lg">Your brand story awaits its first chapter...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
