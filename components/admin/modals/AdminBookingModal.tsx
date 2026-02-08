import React from 'react';
import { Booking, Room } from '../../../types';

interface AdminBookingModalProps {
    viewingBooking: Booking | null;
    setViewingBooking: (booking: Booking | null) => void;
    rooms: Room[];
}

export const AdminBookingModal: React.FC<AdminBookingModalProps> = ({
    viewingBooking,
    setViewingBooking,
    rooms
}) => {
    if (!viewingBooking) return null;

    const bookedRoom = rooms.find(r => r.id === viewingBooking.roomId);
    const checkInDate = new Date(viewingBooking.date);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + viewingBooking.nights);
    const nightlyRate = viewingBooking.totalPrice / viewingBooking.nights;

    return (
        <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingBooking(null)}>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
                {/* Room Image Header */}
                {bookedRoom && (
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                        <img src={bookedRoom.image} alt={bookedRoom.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                        <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-1">{bookedRoom.category}</p>
                                <p className="text-2xl font-black text-white font-serif">{viewingBooking.roomName}</p>
                            </div>
                            <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Confirmed</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-10">
                    {/* Guest Info & ID */}
                    <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-2xl">
                                👤
                            </div>
                            <div>
                                <p className="text-xl font-black text-charcoal">{viewingBooking.guestName}</p>
                                <p className="text-sm text-gray-400">{viewingBooking.guestEmail}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Booking ID</p>
                            <p className="text-xs font-mono font-bold text-charcoal bg-gray-50 px-3 py-1 rounded-lg">{viewingBooking.id.slice(0, 12)}...</p>
                        </div>
                    </div>

                    {/* Check-in / Check-out Timeline */}
                    <div className="mb-8 pb-8 border-b border-gray-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-4">Stay Duration</p>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-gradient-to-r from-gold/10 to-transparent p-4 rounded-2xl">
                                <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Check-In</p>
                                <p className="text-lg font-black text-charcoal">{checkInDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                <p className="text-xs text-gray-400">2:00 PM</p>
                            </div>
                            <div className="flex flex-col items-center px-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(Math.min(viewingBooking.nights, 5))].map((_, i) => (
                                        <div key={i} className="w-2 h-2 rounded-full bg-gold" style={{ opacity: 1 - (i * 0.15) }} />
                                    ))}
                                </div>
                                <p className="text-[10px] font-black text-gold mt-1">{viewingBooking.nights} {viewingBooking.nights === 1 ? 'Night' : 'Nights'}</p>
                            </div>
                            <div className="flex-1 bg-gradient-to-l from-gold/10 to-transparent p-4 rounded-2xl text-right">
                                <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Check-Out</p>
                                <p className="text-lg font-black text-charcoal">{checkOutDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                <p className="text-xs text-gray-400">12:00 PM</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-4">Financial Summary</p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Nightly Rate</span>
                                <span className="text-sm font-bold text-charcoal">GH₵{nightlyRate.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Duration</span>
                                <span className="text-sm font-bold text-charcoal">× {viewingBooking.nights} nights</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                                <span className="text-sm font-black text-charcoal uppercase">Total</span>
                                <span className="text-xl font-black text-gold">GH₵{viewingBooking.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Room Amenities if available */}
                    {bookedRoom && bookedRoom.amenities && bookedRoom.amenities.length > 0 && (
                        <div className="mb-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-3">Suite Amenities</p>
                            <div className="flex flex-wrap gap-2">
                                {bookedRoom.amenities.slice(0, 6).map((amenity, i) => (
                                    <span key={i} className="bg-gray-50 text-charcoal px-3 py-1 rounded-full text-[10px] font-bold">
                                        {amenity}
                                    </span>
                                ))}
                                {bookedRoom.amenities.length > 6 && (
                                    <span className="bg-gold/10 text-gold px-3 py-1 rounded-full text-[10px] font-bold">
                                        +{bookedRoom.amenities.length - 6} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={() => setViewingBooking(null)}
                        className="w-full bg-charcoal text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/20 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};
