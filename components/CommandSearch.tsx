
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

interface CommandSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CommandSearch: React.FC<CommandSearchProps> = ({ isOpen, onClose }) => {
    const { rooms, config } = useSite();
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        const matches: { type: 'room' | 'booking' | 'amenity' | 'tab' | 'subscriber'; title: string; subtitle: string; action: () => void }[] = [];

        // Search Rooms
        rooms.forEach(room => {
            if (room.name.toLowerCase().includes(q) || room.category.toLowerCase().includes(q)) {
                matches.push({
                    type: 'room',
                    title: room.name,
                    subtitle: `${room.category} • GH₵${room.price}/night`,
                    action: () => {
                        if (isAdmin) {
                            navigate(`/admin?tab=rooms&edit=${room.id}`);
                            onClose();
                        } else {
                            navigate(`/room/${room.id}`);
                            onClose();
                        }
                    }
                });
            }
        });

        // Search Amenities (for Guests)
        if (config.amenityDetails) {
            Object.keys(config.amenityDetails).forEach(key => {
                const detail = config.amenityDetails[key];
                if (key.toLowerCase().includes(q) || detail.description.toLowerCase().includes(q)) {
                    matches.push({
                        type: 'amenity',
                        title: key,
                        subtitle: 'Hotel Experience',
                        action: () => {
                            navigate('/amenities');
                            onClose();
                        }
                    });
                }
            });
        }

        // Search Bookings & Subscribers (Admin Only)
        if (isAdmin) {
            config.bookings.forEach(booking => {
                if (booking.guestName.toLowerCase().includes(q) || booking.guestEmail.toLowerCase().includes(q) || booking.roomName.toLowerCase().includes(q)) {
                    matches.push({
                        type: 'booking',
                        title: booking.guestName,
                        subtitle: `${booking.roomName} • ${new Date(booking.date).toLocaleDateString()}`,
                        action: () => {
                            navigate('/admin?tab=bookings');
                            onClose();
                        }
                    });
                }
            });

            config.subscribers?.forEach(sub => {
                if (sub.email.toLowerCase().includes(q)) {
                    matches.push({
                        type: 'subscriber',
                        title: sub.email,
                        subtitle: `Subscribed ${new Date(sub.subscribedAt).toLocaleDateString()}`,
                        action: () => {
                            navigate('/admin?tab=newsletter');
                            onClose();
                        }
                    });
                }
            });

            // Search Tabs (Admin Only)
            const tabs = ['overview', 'bookings', 'branding', 'home', 'pages', 'navigation', 'rooms', 'amenities', 'concierge', 'footer', 'newsletter', 'settings'];
            tabs.forEach(tab => {
                if (tab.includes(q)) {
                    matches.push({
                        type: 'tab',
                        title: tab.charAt(0).toUpperCase() + tab.slice(1),
                        subtitle: 'Admin Control Center',
                        action: () => {
                            navigate(`/admin?tab=${tab}`);
                            onClose();
                        }
                    });
                }
            });
        }

        return matches.slice(0, 8);
    }, [query, rooms, config, isAdmin, navigate, onClose]);

    useEffect(() => {
        if (!isOpen) setQuery('');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Search Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in border border-gray-100">
                <div className="flex items-center gap-4 p-8 border-b border-gray-50">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search for experiences, rooms, or signatures..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="flex-1 text-xl outline-none font-black font-serif text-charcoal placeholder:text-gray-300"
                        autoFocus
                    />
                    <kbd className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-xl text-[10px] font-black text-gray-400 border border-gray-100">
                        ESC
                    </kbd>
                </div>

                <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                    {results.length > 0 ? (
                        <div className="p-4">
                            <div className="px-4 py-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">Top Matches</p>
                            </div>
                            {results.map((result, idx) => (
                                <button
                                    key={idx}
                                    onClick={result.action}
                                    className="w-full flex items-center gap-6 p-4 rounded-2xl hover:bg-gray-50 transition-all text-left group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${result.type === 'room' ? 'bg-gold/10 text-gold' :
                                        result.type === 'booking' ? 'bg-green-50 text-green-600' :
                                            result.type === 'amenity' ? 'bg-blue-50 text-blue-600' :
                                                'bg-gray-100 text-charcoal'
                                        }`}>
                                        {result.type === 'room' && '🏨'}
                                        {result.type === 'booking' && '📅'}
                                        {result.type === 'amenity' && '✨'}
                                        {result.type === 'subscriber' && '✉️'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-charcoal truncate text-lg">{result.title}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{result.subtitle}</p>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-200 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    ) : query ? (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">🏜️</span>
                            </div>
                            <p className="text-xl font-black font-serif text-charcoal mb-2">No results found</p>
                            <p className="text-gray-400 text-sm">We couldn't find anything matching "{query}"</p>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                {['Penthouse', 'Suite', 'Concierge', 'Amenities'].map(suggest => (
                                    <button
                                        key={suggest}
                                        onClick={() => setQuery(suggest)}
                                        className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-gold/30 hover:text-gold transition-all"
                                    >
                                        {suggest}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-50 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-[10px] font-black text-gray-400">↵</span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Select</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-gray-200 shadow-sm ml-2">
                            <span className="text-[10px] font-black text-gray-400">↑↓</span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Navigate</span>
                        </div>
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">C1002 Quarters Landmark Search</p>
                </div>
            </div>
        </div>
    );
};
