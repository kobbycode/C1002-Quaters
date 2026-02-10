import React, { useState, useEffect } from 'react';
import { AmenityDetail } from '../../../types';

interface AdminAmenityModalProps {
    editingAmenity: { name: string, detail: AmenityDetail } | null;
    setEditingAmenity: (amenity: { name: string, detail: AmenityDetail } | null) => void;
    onSave: (originalName?: string) => void;
    onDelete: (name: string) => void;
}

export const AdminAmenityModal: React.FC<AdminAmenityModalProps> = ({
    editingAmenity,
    setEditingAmenity,
    onSave,
    onDelete
}) => {
    const [originalName, setOriginalName] = useState<string>('');

    useEffect(() => {
        if (editingAmenity && !originalName) {
            setOriginalName(editingAmenity.name);
        } else if (!editingAmenity) {
            setOriginalName('');
        }
    }, [editingAmenity]);

    if (!editingAmenity) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                <h2 className="text-3xl font-black font-serif mb-10 text-charcoal">Amenity Registry</h2>
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Amenity Name</label>
                        <input
                            type="text"
                            value={editingAmenity.name}
                            onChange={e => setEditingAmenity({ ...editingAmenity, name: e.target.value })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                            placeholder="e.g. Nespresso Machine"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Classification Category</label>
                        <input
                            type="text"
                            value={editingAmenity.detail.category}
                            onChange={e => setEditingAmenity({ ...editingAmenity, detail: { ...editingAmenity.detail, category: e.target.value } })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                            placeholder="e.g. Comfort & Refreshment"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Service Description</label>
                        <textarea
                            rows={3}
                            value={editingAmenity.detail.description}
                            onChange={e => setEditingAmenity({ ...editingAmenity, detail: { ...editingAmenity.detail, description: e.target.value } })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium outline-none focus:ring-2 ring-gold/20"
                        />
                    </div>
                </div>
                <div className="mt-12 flex flex-col gap-4">
                    <button
                        onClick={() => onSave(originalName)}
                        className="w-full bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/20"
                    >
                        Update Registry Node
                    </button>
                    <div className="flex gap-4">
                        {originalName && (
                            <button
                                onClick={() => onDelete(originalName)}
                                className="flex-1 bg-red-50 text-red-500 font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-red-500 hover:text-white transition-all"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            onClick={() => setEditingAmenity(null)}
                            className="flex-1 bg-gray-100 text-charcoal font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gray-200 transition-all"
                        >
                            Discard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

