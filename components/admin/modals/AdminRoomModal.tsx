import React, { useState } from 'react';
import { Room } from '../../../types';
import ImageUpload from '../../ImageUpload';
import { useToast } from '../../../context/ToastContext';
import { useSite } from '../../../context/SiteContext';

interface AdminRoomModalProps {
    editingRoom: Partial<Room> | null;
    setEditingRoom: (room: Partial<Room> | null) => void;
    onSave: () => void;
    handleAiWriter: (field: 'description', context: string) => Promise<string | null | void>;
    isAiGenerating: boolean;
}

export const AdminRoomModal: React.FC<AdminRoomModalProps> = ({
    editingRoom,
    setEditingRoom,
    onSave,
    handleAiWriter,
    isAiGenerating
}) => {
    const { showToast } = useToast();
    const { config } = useSite();
    const [newAmenity, setNewAmenity] = useState('');

    if (!editingRoom) return null;

    const addAmenity = () => {
        if (!newAmenity.trim()) return;
        const currentAmenities = editingRoom.amenities || [];
        if (!currentAmenities.includes(newAmenity.trim())) {
            setEditingRoom({ ...editingRoom, amenities: [...currentAmenities, newAmenity.trim()] });
        }
        setNewAmenity('');
    };

    const removeAmenity = (amenity: string) => {
        const currentAmenities = editingRoom.amenities || [];
        setEditingRoom({ ...editingRoom, amenities: currentAmenities.filter(a => a !== amenity) });
    };

    const addGalleryImage = (url: string) => {
        const currentImages = editingRoom.images || [];
        setEditingRoom({ ...editingRoom, images: [...currentImages, url] });
    };

    const removeGalleryImage = (index: number) => {
        const currentImages = editingRoom.images || [];
        setEditingRoom({ ...editingRoom, images: currentImages.filter((_, i) => i !== index) });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] p-12 overflow-y-auto max-h-[90vh] shadow-2xl relative">
                <h2 className="text-3xl font-black font-serif mb-10 text-charcoal">Suite Specification</h2>

                <div className="grid grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Room Name</label>
                        <input
                            type="text"
                            value={editingRoom.name || ''}
                            onChange={e => setEditingRoom({ ...editingRoom, name: e.target.value })}
                            className="w-full border-gray-100 bg-gray-50 rounded-xl p-5 text-sm font-bold"
                            placeholder="e.g. Presidential Suite"
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Category</label>
                        <select
                            value={editingRoom.category || ''}
                            onChange={e => setEditingRoom({ ...editingRoom, category: e.target.value })}
                            className="w-full border-gray-100 bg-gray-50 rounded-xl p-5 text-sm font-bold"
                        >
                            <option value="">Select Category</option>
                            {config.categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Price ({config.currency || 'GHS'})</label>
                        <input
                            type="number"
                            value={editingRoom.price || 0}
                            onChange={e => setEditingRoom({ ...editingRoom, price: parseInt(e.target.value) || 0 })}
                            className="w-full border-gray-100 bg-gray-50 rounded-xl p-5 text-sm font-bold"
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Rating (1-5)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={editingRoom.rating || 5}
                            onChange={e => setEditingRoom({ ...editingRoom, rating: parseFloat(e.target.value) || 5 })}
                            className="w-full border-gray-100 bg-gray-50 rounded-xl p-5 text-sm font-bold"
                        />
                    </div>

                    {/* Specs */}
                    <div className="col-span-2 md:col-span-1 lg:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Size (e.g. 45m²)</label>
                        <input
                            type="text"
                            value={editingRoom.size || ''}
                            onChange={e => setEditingRoom({ ...editingRoom, size: e.target.value })}
                            className="w-full border-gray-100 bg-gray-50 rounded-xl p-5 text-sm font-bold"
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1 lg:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Max Guests</label>
                        <input
                            type="text"
                            value={editingRoom.guests || ''}
                            onChange={e => setEditingRoom({ ...editingRoom, guests: e.target.value })}
                            className="w-full border-gray-100 bg-gray-50 rounded-xl p-5 text-sm font-bold"
                            placeholder="e.g. 2 Adults, 1 Child"
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">View Type</label>
                        <input
                            type="text"
                            value={editingRoom.view || ''}
                            onChange={e => setEditingRoom({ ...editingRoom, view: e.target.value })}
                            className="w-full border-gray-100 bg-gray-50 rounded-xl p-5 text-sm font-bold"
                            placeholder="e.g. Ocean View"
                        />
                    </div>

                    {/* Description */}
                    <div className="col-span-2">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gold block">Narrative Description</label>
                            <button
                                onClick={async () => {
                                    const result = await handleAiWriter('description', editingRoom.name || '');
                                    if (result) setEditingRoom({ ...editingRoom, description: result });
                                }}
                                disabled={isAiGenerating || !editingRoom.name}
                                className="text-[9px] font-black uppercase text-primary hover:underline disabled:opacity-50"
                            >
                                {isAiGenerating ? 'AI Scripting...' : '✨ AI Rewrite'}
                            </button>
                        </div>
                        <textarea
                            value={editingRoom.description || ''}
                            onChange={e => setEditingRoom({ ...editingRoom, description: e.target.value })}
                            className="w-full border-gray-100 bg-gray-50 rounded-xl p-6 text-sm font-medium transition-all"
                            rows={4}
                        />
                    </div>

                    {/* Amenities */}
                    <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Amenities</label>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newAmenity}
                                onChange={e => setNewAmenity(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && addAmenity()}
                                className="flex-1 border-gray-100 bg-gray-50 rounded-xl p-4 text-sm font-bold"
                                placeholder="Add amenity (e.g. Private Pool)"
                            />
                            <button
                                onClick={addAmenity}
                                className="bg-charcoal text-white px-6 rounded-xl text-[10px] font-black uppercase"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(editingRoom.amenities || []).map(amenity => (
                                <span key={amenity} className="bg-gray-100 text-charcoal px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                                    {amenity}
                                    <button onClick={() => removeAmenity(amenity)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Main Image */}
                    <div className="col-span-2">
                        <ImageUpload
                            label="Primary Showcase Image (Thumbnail)"
                            currentImage={editingRoom.image || ''}
                            onImageUploaded={(url) => setEditingRoom({ ...editingRoom, image: url })}
                            onError={(msg) => showToast(msg, 'error')}
                            folder="rooms"
                        />
                    </div>

                    {/* Gallery */}
                    <div className="col-span-2 border-t border-gray-100 pt-8 mt-4">
                        <h3 className="text-xl font-black font-serif mb-6 text-charcoal">Image Gallery</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {(editingRoom.images || []).map((url, idx) => (
                                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group">
                                    <img src={url} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                    <button
                                        onClick={() => removeGalleryImage(idx)}
                                        className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <div className="col-span-full">
                                <ImageUpload
                                    label="Add to Gallery"
                                    onImageUploaded={addGalleryImage}
                                    onError={(msg) => showToast(msg, 'error')}
                                    folder="rooms/gallery"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex gap-6">
                    <button onClick={onSave} className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-gold transition-all">Synchronize Unit Info</button>
                    <button onClick={() => setEditingRoom(null)} className="flex-1 bg-gray-100 text-charcoal font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px]">Discard</button>
                </div>
            </div>
        </div>
    );
};

