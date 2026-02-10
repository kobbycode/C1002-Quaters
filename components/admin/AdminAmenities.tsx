import React from 'react';
import { SiteConfig, AmenityDetail } from '../../types';

interface AdminAmenitiesProps {
    config: SiteConfig;
    onEditAmenity: (name: string, detail: AmenityDetail) => void;
    onDelete: (name: string) => void;
}

export const AdminAmenities: React.FC<AdminAmenitiesProps> = ({ config, onEditAmenity, onDelete }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {(Object.entries(config.amenityDetails) as [string, AmenityDetail][]).map(([name, detail]) => (
                <div key={name} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm group hover:scale-[1.02] transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-gold">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => onEditAmenity(name, detail)}
                                className="text-[10px] font-black uppercase text-primary hover:underline"
                            >
                                Edit Node
                            </button>
                            <button
                                onClick={() => onDelete(name)}
                                className="text-[10px] font-black uppercase text-red-500 hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                    <h3 className="text-lg font-black text-charcoal mb-2">{name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-4">{detail.category}</p>
                    <p className="text-sm text-gray-400 leading-relaxed font-medium">{detail.description}</p>
                </div>
            ))}
        </div>
    );
};
