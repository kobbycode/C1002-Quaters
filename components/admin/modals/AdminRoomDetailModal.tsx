import React from 'react';
import { Room, Booking, SiteConfig } from '../../../types';
import { formatPrice } from '../../../utils/formatters';

interface AdminRoomDetailModalProps {
    room: Room;
    bookings: Booking[];
    config: SiteConfig;
    onClose: () => void;
}

export const AdminRoomDetailModal: React.FC<AdminRoomDetailModalProps> = ({
    room,
    bookings,
    config,
    onClose
}) => {
    const roomBookings = bookings
        .filter(b => b.roomId === room.id)
        .sort((a, b) => b.isoCheckIn.localeCompare(a.isoCheckIn));

    const totalRevenue = roomBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const bookingCount = roomBookings.length;
    const avgBookingValue = bookingCount > 0 ? totalRevenue / bookingCount : 0;

    // Calculate occupancy rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const recentBookings = roomBookings.filter(b =>
        b.isoCheckIn && b.isoCheckIn >= thirtyDaysAgoStr && b.status !== 'cancelled'
    );
    const bookedNights = recentBookings.reduce((sum, b) => sum + (b.nights || 0), 0);
    const occupancyRate = (bookedNights / 30) * 100;

    return (
        <div className="fixed inset-0 z-[110] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-5xl rounded-[3rem] p-12 overflow-y-auto max-h-[90vh] shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-10 text-gray-400 hover:text-charcoal transition-colors p-2"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="flex flex-col md:flex-row gap-10 mb-12">
                    <div className="w-full md:w-1/3 aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl">
                        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <p className="text-gold font-black uppercase tracking-[0.3em] text-[10px] mb-2">{room.category} • {room.roomCode}</p>
                        <h2 className="text-4xl font-black font-serif text-charcoal mb-4">{room.name}</h2>
                        <div className="flex flex-wrap gap-4 items-center">
                            <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {room.status || 'Active'}
                            </span>
                            <span className="text-charcoal/40 text-xs font-bold">{room.size} • {room.guests} Guests • {room.floor}</span>
                        </div>
                    </div>
                </div>

                {/* Performance Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Revenue</p>
                        <h4 className="text-2xl font-black text-charcoal font-serif">{formatPrice(totalRevenue, config.currency)}</h4>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Bookings</p>
                        <h4 className="text-2xl font-black text-charcoal font-serif">{bookingCount}</h4>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Avg. Ticket</p>
                        <h4 className="text-2xl font-black text-charcoal font-serif">{formatPrice(avgBookingValue, config.currency)}</h4>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Occupancy (30d)</p>
                        <h4 className="text-2xl font-black text-charcoal font-serif">{Math.min(occupancyRate, 100).toFixed(1)}%</h4>
                    </div>
                </div>

                {/* Booking History Table */}
                <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="text-lg font-black font-serif text-charcoal">Residency History</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{roomBookings.length} Total records</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-gray-400">Guest</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-gray-400">Check In</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-gray-400">Check Out</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-gray-400">Nights</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-gray-400">Total Price</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {roomBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-black text-charcoal">{booking.guestName}</p>
                                            <p className="text-[9px] font-bold text-gray-400">{booking.guestEmail}</p>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-gray-600">{booking.isoCheckIn}</td>
                                        <td className="px-8 py-6 text-xs font-bold text-gray-600">{booking.isoCheckOut}</td>
                                        <td className="px-8 py-6 text-xs font-bold text-gray-600">{booking.nights}</td>
                                        <td className="px-8 py-6 text-xs font-black text-charcoal">{formatPrice(booking.totalPrice, config.currency)}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${booking.status === 'confirmed' || booking.status === 'arrived' ? 'bg-emerald-50 text-emerald-600' :
                                                    booking.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                                                        'bg-amber-50 text-amber-600'
                                                }`}>
                                                {booking.status || 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {roomBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No residency history found for this unit</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-12 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-charcoal text-white font-black px-12 py-5 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/10"
                    >
                        Close Analysis
                    </button>
                </div>
            </div>
        </div>
    );
};
