import React from 'react';
import { NavLink } from '../../../types';

interface AdminNavModalProps {
    editingNav: NavLink | null;
    setEditingNav: (nav: NavLink | null) => void;
    onSave: () => void;
}

export const AdminNavModal: React.FC<AdminNavModalProps> = ({
    editingNav,
    setEditingNav,
    onSave
}) => {
    if (!editingNav) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                <h2 className="text-3xl font-black font-serif mb-10 text-charcoal">Navigation Registry</h2>
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Link Label</label>
                        <input
                            type="text"
                            value={editingNav.label}
                            onChange={e => setEditingNav({ ...editingNav, label: e.target.value })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none"
                            placeholder="e.g. Gallery"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Target Path</label>
                        <input
                            type="text"
                            value={editingNav.path}
                            onChange={e => setEditingNav({ ...editingNav, path: e.target.value })}
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none"
                            placeholder="e.g. /gallery"
                        />
                    </div>
                </div>
                <div className="mt-12 flex gap-4">
                    <button onClick={onSave} className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all">Update Array</button>
                    <button onClick={() => setEditingNav(null)} className="flex-1 bg-gray-100 text-charcoal font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px]">Close</button>
                </div>
            </div>
        </div>
    );
};
