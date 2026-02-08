import React from 'react';
import { Room } from '../../../types';
import ImageUpload from '../../ImageUpload';
import { useToast } from '../../../context/ToastContext';

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
    if (!editingRoom) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-3xl rounded-[3rem] p-12 overflow-y-auto max-h-[90vh] shadow-2xl relative">
                <h2 className="text-3xl font-black font-serif mb-10 text-charcoal">Suite Specification</h2>
                <div className="grid grid-cols-2 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Room Name</label>
                        <input
                            type="text"
                            value={editingRoom.name || ''}
                            onChange={e => setEditingRoom({ ...editingRoom, name: e.target.value })}
                            className="w-full border-gray-100 bg-gray-50 rounded-xl p-5 text-sm font-bold"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Price (GH₵)</label>
                        <input
                            type="number"
                            value={editingRoom.price || 0}
                            onChange={e => setEditingRoom({ ...editingRoom, price: parseInt(e.target.value) || 0 })}
                            className="w-full border-gray-100 bg-gray-50 rounded-xl p-5 text-sm font-bold"
                        />
                    </div>
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
                    <div className="col-span-2">
                        <ImageUpload
                            label="Visual Index Link"
                            currentImage={editingRoom.image || ''}
                            onImageUploaded={(url) => setEditingRoom({ ...editingRoom, image: url })}
                            onError={(msg) => showToast(msg, 'error')}
                            folder="rooms"
                        />
                    </div>
                </div>
                <div className="mt-12 flex gap-6">
                    <button onClick={onSave} className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-gold transition-all">Synchronize Node</button>
                    <button onClick={() => setEditingRoom(null)} className="flex-1 bg-gray-100 text-charcoal font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px]">Discard</button>
                </div>
            </div>
        </div>
    );
};
