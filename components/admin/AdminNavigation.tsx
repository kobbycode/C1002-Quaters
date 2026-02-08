import React, { useState } from 'react';
import { SiteConfig, NavLink } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AdminNavigationProps {
    config: SiteConfig;
    updateConfig: (config: SiteConfig) => void;
    setEditingNav: (link: NavLink) => void;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({
    config,
    updateConfig,
    setEditingNav
}) => {
    const { showToast } = useToast();
    // Local drag and drop state for navigation links
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

        const newLinks = [...config.navLinks];
        const [removed] = newLinks.splice(draggedIndex, 1);
        newLinks.splice(targetIndex, 0, removed);

        updateConfig({ ...config, navLinks: newLinks });
        showToast('Navigation links reordered');

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
        <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-gold rounded-full" />
                    <h3 className="text-2xl font-black font-serif text-charcoal">System Nav Array</h3>
                </div>
                <button
                    onClick={() => setEditingNav({ id: Date.now().toString(), label: '', path: '/' })}
                    className="bg-primary text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#6B006B] transition-all"
                >
                    + Add Link
                </button>
            </div>

            <div className="space-y-4">
                {config.navLinks.map((link, index) => (
                    <div
                        key={link.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group transition-all ${dragOverIndex === index ? 'border-gold border-2 -translate-y-1' : ''}`}
                    >
                        <div className="flex items-center gap-8">
                            <div className="cursor-move opacity-30 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                            </div>
                            <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                            <div>
                                <p className="text-sm font-black text-charcoal">{link.label}</p>
                                <p className="text-[10px] font-mono text-gray-400">{link.path}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setEditingNav(link)}
                                className="text-[10px] font-black uppercase text-primary hover:underline"
                            >
                                Modify
                            </button>
                            <button
                                onClick={() => {
                                    const newLinks = config.navLinks.filter(l => l.id !== link.id);
                                    updateConfig({ ...config, navLinks: newLinks });
                                    showToast('Navigation link removed');
                                }}
                                className="text-[10px] font-black uppercase text-red-400 hover:text-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
