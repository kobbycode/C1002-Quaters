import React, { useState, useMemo } from 'react';
import { useSite } from '../../context/SiteContext';
import { Booking } from '../../types';

interface AdminBookingsProps {
    onViewBooking: (booking: Booking) => void;
}

export const AdminBookings: React.FC<AdminBookingsProps> = ({ onViewBooking }) => {
    const { config, deleteBooking } = useSite();
    const [bookingSearch, setBookingSearch] = useState('');
    const [bookingFilter, setBookingFilter] = useState<'all' | 'rent' | 'reservation'>('all');
    const [dateFilter, setDateFilter] = useState('');

    const filteredBookings = useMemo(() => {
        return config.bookings.filter(booking => {
            const searchMatch = (booking.guestName + booking.roomName + booking.email).toLowerCase().includes(bookingSearch.toLowerCase());
            const typeMatch = bookingFilter === 'all' || booking.type === bookingFilter;
            const dateMatch = !dateFilter || booking.date.startsWith(dateFilter);
            return searchMatch && typeMatch && dateMatch;
        });
    }, [config.bookings, bookingSearch, bookingFilter, dateFilter]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            await deleteBooking(id);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm transition-all focus-within:shadow-md">
                <div className="relative flex-1 w-full group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gold transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by guest, room, or email..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-gray-50 border-transparent rounded-[1.5rem] text-sm focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                    />
                </div>

                <div className="flex bg-gray-50 rounded-[1.5rem] p-1.5 gap-1.5 border border-gray-100">
                    {(['all', 'rent', 'reservation'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setBookingFilter(f)}
                            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${bookingFilter === f ? 'bg-white text-gold shadow-sm' : 'text-gray-400 hover:text-charcoal'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="pl-6 pr-6 py-4 bg-gray-50 border-transparent rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-gray-500 focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-charcoal text-white">
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em]">Guest Information</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em]">Stay Details</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em]">Financials</th>
                                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em]">Status</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">👤</div>
                                            <div>
                                                <p className="text-base font-black text-charcoal mb-1">{booking.guestName}</p>
                                                <p className="text-[10px] font-bold text-gray-400 tracking-wider flex items-center gap-2">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    {booking.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <p className="text-sm font-black text-charcoal mb-1">{booking.roomName}</p>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span>{new Date(booking.date).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                            <span>{booking.nights} Nights</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <p className="text-base font-black text-gold">GH₵{booking.totalPrice.toLocaleString()}</p>
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Confirmed</p>
                                    </td>
                                    <td className="px-8 py-8">
                                        <span className={`inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${booking.type === 'rent' ? 'bg-blue-50 text-blue-500 border border-blue-100' : 'bg-purple-50 text-purple-500 border border-purple-100'}`}>
                                            {booking.type}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onViewBooking(booking)}
                                                className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gold hover:border-gold/30 hover:shadow-lg transition-all"
                                                title="View Details"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(booking.id)}
                                                className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 hover:shadow-lg transition-all"
                                                title="Delete Booking"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredBookings.length === 0 && (
                        <div className="px-10 py-20 text-center">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No bookings found matching your criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
