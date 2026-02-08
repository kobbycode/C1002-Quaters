import React from 'react';
import { HeroSlide } from '../../../types';
import ImageUpload from '../../ImageUpload';
import { useToast } from '../../../context/ToastContext';

interface AdminHeroModalProps {
    editingHero: HeroSlide | null;
    setEditingHero: (hero: HeroSlide | null) => void;
    onSave: () => void;
}

export const AdminHeroModal: React.FC<AdminHeroModalProps> = ({
    editingHero,
    setEditingHero,
    onSave
}) => {
    const { showToast } = useToast();
    if (!editingHero) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                <h2 className="text-3xl font-black font-serif mb-10 text-charcoal">Narrative Chapter</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Subtitle Anchor</label>
                            <input
                                type="text"
                                value={editingHero.subtitle}
                                onChange={e => setEditingHero({ ...editingHero, subtitle: e.target.value })}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none"
                                placeholder="e.g. LUXURY REDEFINED"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Main Headline</label>
                            <input
                                type="text"
                                value={editingHero.title}
                                onChange={e => setEditingHero({ ...editingHero, title: e.target.value })}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none"
                                placeholder="e.g. Experience Ghana"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Narrative Description</label>
                            <textarea
                                rows={3}
                                value={editingHero.description}
                                onChange={e => setEditingHero({ ...editingHero, description: e.target.value })}
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium outline-none"
                                placeholder="Tell the story of this visual chapter..."
                            />
                        </div>
                    </div>

                    <div className="space-y-6 font-serif">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-1 font-sans">Imagery Node</p>
                        <ImageUpload
                            currentImage={editingHero.image}
                            onImageUploaded={(url) => setEditingHero({ ...editingHero, image: url })}
                            onError={(msg) => showToast(msg, 'error')}
                            folder="hero-slides"
                            label=""
                        />
                    </div>
                </div>
                <div className="mt-12 flex gap-4">
                    <button onClick={onSave} className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/20">Commit Chapter</button>
                    <button onClick={() => setEditingHero(null)} className="flex-1 bg-gray-100 text-charcoal font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px]">Discard</button>
                </div>
            </div>
        </div>
    );
};
