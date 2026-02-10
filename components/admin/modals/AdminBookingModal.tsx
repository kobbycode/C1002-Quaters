import React, { useState } from 'react';
import { Booking, Room } from '../../../types';
import { useSite } from '../../../context/SiteContext';
import { formatPrice } from '../../../utils/formatters';
import { useToast } from '../../../context/ToastContext';

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
    const { config, updateBooking } = useSite();
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [localNotes, setLocalNotes] = useState(viewingBooking?.adminNotes || '');

    if (!viewingBooking) return null;

    const bookedRoom = rooms.find(r => r.id === viewingBooking.roomId);
    const checkInDate = new Date(viewingBooking.isoCheckIn || viewingBooking.date);
    const checkOutDate = new Date(viewingBooking.isoCheckOut || new Date(checkInDate.getTime() + viewingBooking.nights * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const nightlyRate = viewingBooking.totalPrice / viewingBooking.nights;

    const handleUpdate = async (data: Partial<Booking>) => {
        setIsSaving(true);
        try {
            await updateBooking(viewingBooking.id, data);
            setViewingBooking({ ...viewingBooking, ...data });
            showToast('Booking updated successfully', 'success');
        } catch (err) {
            showToast('Failed to update booking', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const statusColors = {
        'pending': 'bg-yellow-100 text-yellow-600',
        'arrived': 'bg-blue-100 text-blue-600',
        'checked-out': 'bg-green-100 text-green-600',
        'cancelled': 'bg-red-100 text-red-600'
    };

    return (
        <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingBooking(null)}>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Room Image Header */}
                {bookedRoom && (
                    <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
                        <img src={bookedRoom.image} alt={bookedRoom.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                        <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-1">{bookedRoom.category}</p>
                                <p className="text-2xl font-black text-white font-serif">{viewingBooking.roomName}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <select
                                    value={viewingBooking.status || 'pending'}
                                    onChange={(e) => handleUpdate({ status: e.target.value as any })}
                                    disabled={isSaving}
                                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border-none outline-none appearance-none cursor-pointer ${statusColors[viewingBooking.status || 'pending']}`}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="arrived">Arrived</option>
                                    <option value="checked-out">Checked Out</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-10">
                    {/* Guest Info & ID */}
                    <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-2xl text-gold">
                                👤
                            </div>
                            <div>
                                <p className="text-xl font-black text-charcoal">{viewingBooking.guestName}</p>
                                <p className="text-sm text-gray-400">{viewingBooking.guestEmail}</p>
                                {viewingBooking.guestPhone && <p className="text-xs text-gray-400 mt-1">{viewingBooking.guestPhone}</p>}
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

                    {/* Financial & Payment Management */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-4">Financial Summary</p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Nightly Rate</span>
                                    <span className="text-xs font-bold text-charcoal">{formatPrice(nightlyRate, config.currency)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Duration</span>
                                    <span className="text-xs font-bold text-charcoal">× {viewingBooking.nights} nights</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                                    <span className="text-xs font-black text-charcoal uppercase">Total</span>
                                    <span className="text-lg font-black text-gold">{formatPrice(viewingBooking.totalPrice, config.currency)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-4">Payment Management</p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Method</span>
                                    <span className="text-xs font-bold text-charcoal capitalize">{viewingBooking.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Status</span>
                                    <select
                                        value={viewingBooking.paymentStatus}
                                        onChange={(e) => handleUpdate({ paymentStatus: e.target.value as any })}
                                        disabled={isSaving}
                                        className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border-none outline-none cursor-pointer ${viewingBooking.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                                {viewingBooking.paymentReference && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Reference</p>
                                        <p className="text-[10px] font-mono break-all text-charcoal">{viewingBooking.paymentReference}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gold">Administrative Notes</p>
                            {localNotes !== viewingBooking.adminNotes && (
                                <button
                                    onClick={() => handleUpdate({ adminNotes: localNotes })}
                                    disabled={isSaving}
                                    className="text-[9px] font-black uppercase text-primary hover:underline"
                                >
                                    Save Notes
                                </button>
                            )}
                        </div>
                        <textarea
                            value={localNotes}
                            onChange={(e) => setLocalNotes(e.target.value)}
                            placeholder="Add internal notes about guest preferences, special requests, etc."
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-medium focus:border-gold outline-none transition-all resize-none h-24"
                        />
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => setViewingBooking(null)}
                        className="w-full bg-charcoal text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/20"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};
