import React, { useState, useMemo } from 'react';
import { useSite } from '../../context/SiteContext';
import { Booking, Room } from '../../types';
import { formatPrice } from '../../utils/formatters';

interface AdminCalendarProps {
    onViewBooking: (booking: Booking) => void;
    onBookSlot: (roomId: string, date: string) => void;
}

export const AdminCalendar: React.FC<AdminCalendarProps> = ({ onViewBooking, onBookSlot }) => {
    const { rooms, bookings, config } = useSite();
    const [viewDate, setViewDate] = useState(new Date());

    // Generate 21 days for the grid view
    const days = useMemo(() => {
        const d = [];
        const start = new Date(viewDate);
        start.setHours(0, 0, 0, 0);

        for (let i = -2; i < 19; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            d.push(date);
        }
        return d;
    }, [viewDate]);

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const getBookingForRoomAndDate = (roomId: string, date: Date) => {
        const isoStr = date.toISOString().split('T')[0];
        return bookings.find(b =>
            b.roomId === roomId &&
            b.isoCheckIn <= isoStr &&
            b.isoCheckOut > isoStr &&
            b.status !== 'cancelled'
        );
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-fade-in flex flex-col h-[700px]">
            {/* Calendar Header */}
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <div className="w-1.5 h-6 bg-gold rounded-full" />
                    <div>
                        <h3 className="text-xl font-black font-serif text-charcoal">Occupancy Timeline</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Visual Grid Management • {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                    <button
                        onClick={() => {
                            const d = new Date(viewDate);
                            d.setDate(d.getDate() - 7);
                            setViewDate(d);
                        }}
                        className="p-3 hover:bg-white hover:text-gold hover:shadow-sm rounded-xl transition-all text-gray-400"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => setViewDate(new Date())}
                        className="px-6 py-2.5 bg-white text-charcoal text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm hover:text-gold transition-all"
                    >
                        Go to Today
                    </button>
                    <button
                        onClick={() => {
                            const d = new Date(viewDate);
                            d.setDate(d.getDate() + 7);
                            setViewDate(d);
                        }}
                        className="p-3 hover:bg-white hover:text-gold hover:shadow-sm rounded-xl transition-all text-gray-400"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Grid Container */}
            <div className="overflow-auto flex-1 min-h-0 bg-gray-50/30">
                <div className="inline-block min-w-full align-middle">
                    <table className="border-collapse table-fixed w-full">
                        <thead className="sticky top-0 z-10 bg-white">
                            <tr>
                                <th className="w-64 p-0 sticky left-0 z-30 bg-white border-b border-gray-100">
                                    <div className="p-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Accommodations</div>
                                </th>
                                {days.map((day, idx) => (
                                    <th key={idx} className={`w-24 border-b border-gray-100 p-4 ${isToday(day) ? 'bg-gold/5' : ''}`}>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">{day.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                            <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all ${isToday(day) ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'text-charcoal'}`}>
                                                {day.getDate()}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rooms.map((room) => (
                                <tr key={room.id} className="group hover:bg-white transition-colors h-24">
                                    <td className="sticky left-0 z-20 bg-white p-6 shadow-xl shadow-gray-200/50 group-hover:bg-gray-50/50 transition-colors">
                                        <div>
                                            <p className="text-sm font-black text-charcoal">{room.name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{room.category}</p>
                                        </div>
                                    </td>
                                    {days.map((day, dIdx) => {
                                        const booking = getBookingForRoomAndDate(room.id, day);
                                        const iso = day.toISOString().split('T')[0];
                                        const isStart = booking?.isoCheckIn === iso;
                                        const isEnd = booking?.isoCheckOut === iso;

                                        return (
                                            <td
                                                key={dIdx}
                                                className={`relative border-r border-gray-100/50 p-1 group-hover:border-gray-200 transition-colors ${isToday(day) ? 'bg-gold/5' : ''}`}
                                                onClick={() => !booking && onBookSlot(room.id, iso)}
                                            >
                                                {!booking && (
                                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                                        <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                                        </div>
                                                    </div>
                                                )}

                                                {booking && isStart && (
                                                    <div
                                                        onClick={(e) => { e.stopPropagation(); onViewBooking(booking); }}
                                                        className="absolute inset-y-2 left-1 z-10 rounded-2xl p-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group/booking overflow-hidden flex flex-col justify-center"
                                                        style={{
                                                            width: `calc(${booking.nights * 100}% + ${(booking.nights - 1) * 4}px)`,
                                                            backgroundColor: booking.paymentStatus === 'paid' ? '#8B008B' : '#1a1a2e',
                                                            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.3)'
                                                        }}
                                                    >
                                                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/booking:opacity-100 transition-opacity">
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        </div>
                                                        <p className="text-[10px] font-black text-white truncate leading-none mb-1">{booking.guestName}</p>
                                                        <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest truncate">{booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</p>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="p-6 bg-white border-t border-gray-100 flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirmed (Paid)</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-charcoal" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reservation (Pending)</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gold/10 border border-gold/20" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today</span>
                </div>
            </div>
        </div>
    );
};
