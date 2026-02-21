import React, { useState } from 'react';
import { Room } from '../../../types';
import ImageUpload from '../../ImageUpload';
import { useToast } from '../../../context/ToastContext';
import { useSite } from '../../../context/SiteContext';

interface AdminRoomModalProps {
    editingRoom: Partial<Room> | null;
    setEditingRoom: (room: Partial<Room> | null) => void;
    onSave: () => void;
}

export const AdminRoomModal: React.FC<AdminRoomModalProps> = ({
    editingRoom,
    setEditingRoom,
    onSave
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

    const addGalleryImages = (urls: string[]) => {
        const currentImages = editingRoom.images || [];
        setEditingRoom({ ...editingRoom, images: [...currentImages, ...urls] });
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
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Operational Status</label>
                        <select
                            value={editingRoom.status || 'available'}
                            onChange={e => setEditingRoom({ ...editingRoom, status: e.target.value as any })}
                            className="w-full border-gray-100 bg-gray-50 rounded-xl p-5 text-sm font-bold capitalize"
                        >
                            <option value="available">Available</option>
                            <option value="cleaning">Cleaning</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Room Spec Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {(config.roomTags || []).map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => {
                                        const currentTags = editingRoom.tags || [];
                                        const newTags = currentTags.includes(tag)
                                            ? currentTags.filter(t => t !== tag)
                                            : [...currentTags, tag];
                                        setEditingRoom({ ...editingRoom, tags: newTags });
                                    }}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(editingRoom.tags || []).includes(tag)
                                        ? 'bg-gold text-white shadow-lg shadow-gold/20'
                                        : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-gold/30'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                            {(!config.roomTags || config.roomTags.length === 0) && (
                                <p className="text-[9px] text-gray-400 italic">No tags defined in Settings.</p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Price ({config.currency || 'GHS'})</label>
                        <input
                            type="number"
                            value={editingRoom.price === 0 ? '' : editingRoom.price}
                            onChange={e => setEditingRoom({ ...editingRoom, price: parseInt(e.target.value) || 0 })}
                            onFocus={e => (e.target as HTMLInputElement).select()}
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
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Suite Amenities</label>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {(editingRoom.amenities || []).map(amenity => {
                                const isRegistered = config.amenityDetails && config.amenityDetails[amenity];
                                return (
                                    <span key={amenity} className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRegistered ? 'bg-charcoal text-white hover:bg-gold' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                        {!isRegistered && (
                                            <span title="Unregistered Amenity" className="flex items-center">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </span>
                                        )}
                                        {amenity}
                                        <button onClick={() => removeAmenity(amenity)} className="hover:scale-125 transition-transform">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </span>
                                );
                            })}
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4">Quick Add from Registry</p>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {Object.keys(config.amenityDetails || {})
                                    .filter(a => !(editingRoom.amenities || []).includes(a))
                                    .slice(0, 12)
                                    .map(a => (
                                        <button
                                            key={a}
                                            onClick={() => setEditingRoom({ ...editingRoom, amenities: [...(editingRoom.amenities || []), a] })}
                                            className="px-3 py-1.5 rounded-lg bg-white border border-gray-100 text-[10px] font-bold text-charcoal hover:border-gold hover:text-gold transition-all"
                                        >
                                            + {a}
                                        </button>
                                    ))
                                }
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newAmenity}
                                    onChange={e => setNewAmenity(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && addAmenity()}
                                    className="flex-1 bg-white border border-gray-100 rounded-xl p-4 text-xs font-bold focus:border-gold outline-none transition-all"
                                    placeholder="Add custom amenity..."
                                />
                                <button
                                    onClick={addAmenity}
                                    className="bg-charcoal text-white px-8 rounded-xl text-[10px] font-black uppercase hover:bg-gold transition-all"
                                >
                                    Add Custom
                                </button>
                            </div>
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
                                    multiple={true}
                                    onImagesUploaded={addGalleryImages}
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

