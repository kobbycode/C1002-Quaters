import React, { useState, useMemo } from 'react';
import { useSite } from '../../context/SiteContext';
import { formatPrice } from '../../utils/formatters';
import { Booking } from '../../types';
import { useToast } from '../../context/ToastContext';
import { AdminCalendar } from './AdminCalendar';
import { ExportService } from '../../utils/export-service';

interface AdminBookingsProps {
    onViewBooking: (booking: Booking) => void;
}

export const AdminBookings: React.FC<AdminBookingsProps> = ({ onViewBooking }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newBooking, setNewBooking] = useState({
        guestName: '',
        guestEmail: '',
        roomId: '',
        nights: 1,
        totalPrice: 0,
        isoCheckIn: new Date().toISOString().split('T')[0],
        hasGymAccess: false
    });

    const [bookingSearch, setBookingSearch] = useState('');
    const [bookingFilter, setBookingFilter] = useState<'all' | 'rent' | 'reservation'>('all');
    const [dateFilter, setDateFilter] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');

    const { rooms, addBooking, deleteBooking, bookings, config, isRoomAvailable, calculatePrice } = useSite();
    const { showToast } = useToast();

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        const room = rooms.find(r => r.id === newBooking.roomId);
        if (!room || !newBooking.isoCheckIn) return;

        const checkIn = new Date(newBooking.isoCheckIn);
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + Number(newBooking.nights));

        const isoCheckIn = newBooking.isoCheckIn;
        const isoCheckOut = checkOut.toISOString().split('T')[0];

        // Security Check: Availability
        if (!isRoomAvailable(room.id, isoCheckIn, isoCheckOut)) {
            showToast('This room is already booked for the selected dates.', 'error');
            return;
        }

        const formattedCheckIn = checkIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const formattedCheckOut = checkOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        await addBooking({
            roomId: room.id,
            roomName: room.name,
            guestName: newBooking.guestName,
            guestEmail: newBooking.guestEmail,
            nights: Number(newBooking.nights),
            totalPrice: Number(newBooking.totalPrice),
            paymentStatus: 'pending',
            paymentMethod: 'cash',
            status: 'pending',
            isoCheckIn,
            isoCheckOut,
            checkInDate: formattedCheckIn,
            checkOutDate: formattedCheckOut,
            hasGymAccess: newBooking.hasGymAccess
        });

        setIsCreating(false);
        setNewBooking({ guestName: '', guestEmail: '', roomId: '', nights: 1, totalPrice: 0, isoCheckIn: new Date().toISOString().split('T')[0], hasGymAccess: false });
    };

    const handleRoomChange = (roomId: string) => {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
            setNewBooking(prev => ({
                ...prev,
                roomId,
                totalPrice: calculatePrice(roomId, new Date(prev.isoCheckIn), new Date(new Date(prev.isoCheckIn).getTime() + prev.nights * 24 * 60 * 60 * 1000), prev.hasGymAccess).finalTotal
            }));
        }
    };

    const handleNightsChange = (nights: number) => {
        const room = rooms.find(r => r.id === newBooking.roomId);
        setNewBooking(prev => ({
            ...prev,
            nights,
            totalPrice: room ? calculatePrice(room.id, new Date(prev.isoCheckIn), new Date(new Date(prev.isoCheckIn).getTime() + nights * 24 * 60 * 60 * 1000), prev.hasGymAccess).finalTotal : 0
        }));
    };

    const handleGymChange = (hasGymAccess: boolean) => {
        const room = rooms.find(r => r.id === newBooking.roomId);
        setNewBooking(prev => ({
            ...prev,
            hasGymAccess,
            totalPrice: room ? calculatePrice(room.id, new Date(prev.isoCheckIn), new Date(new Date(prev.isoCheckIn).getTime() + prev.nights * 24 * 60 * 60 * 1000), hasGymAccess).finalTotal : 0
        }));
    };

    const filteredBookings = useMemo(() => {
        return bookings
            .filter(booking => {
                const searchMatch = (booking.guestName + booking.roomName + booking.guestEmail + booking.id).toLowerCase().includes(bookingSearch.toLowerCase());

                let typeMatch = true;
                if (bookingFilter === 'reservation') {
                    typeMatch = !booking.status || booking.status === 'pending';
                } else if (bookingFilter === 'rent') {
                    typeMatch = booking.status === 'arrived';
                }

                const dateMatch = !dateFilter || booking.date.startsWith(dateFilter);
                return searchMatch && typeMatch && dateMatch;
            })
            .sort((a, b) => {
                const dateA = a.isoCheckIn || '';
                const dateB = b.isoCheckIn || '';
                return dateB.localeCompare(dateA); // Newest check-ins first
            });
    }, [bookings, bookingSearch, bookingFilter, dateFilter]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            try {
                await deleteBooking(id);
            } catch (err) {
                console.error("Delete error:", err);
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-serif font-black text-charcoal">New Manual Reservation</h3>
                            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-charcoal transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateBooking} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Guest Name</label>
                                    <input required type="text" value={newBooking.guestName} onChange={e => setNewBooking({ ...newBooking, guestName: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Guest Email</label>
                                    <input required type="email" value={newBooking.guestEmail} onChange={e => setNewBooking({ ...newBooking, guestEmail: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all" placeholder="guest@example.com" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Check-In Date</label>
                                        <input required type="date" value={newBooking.isoCheckIn} onChange={e => setNewBooking({ ...newBooking, isoCheckIn: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Duration (Nights)</label>
                                        <input required type="number" min="1" value={newBooking.nights} onChange={e => handleNightsChange(Number(e.target.value))} className="w-full bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Room Selection</label>
                                    <select required value={newBooking.roomId} onChange={e => handleRoomChange(e.target.value)} className="w-full bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all">
                                        <option value="">Select Room</option>
                                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({formatPrice(r.price, config.currency)})</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent hover:border-gold/20 transition-all cursor-pointer" onClick={() => handleGymChange(!newBooking.hasGymAccess)}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🏋️</span>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-charcoal">Elite Gym Access</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">{formatPrice(config.gymDailyFee || 0, config.currency)} / Day</p>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full transition-all flex items-center p-1 ${newBooking.hasGymAccess ? 'bg-gold' : 'bg-gray-200'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${newBooking.hasGymAccess ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total Rate ({config.currency || 'GHS'})</label>
                                    <input type="number" value={newBooking.totalPrice} onChange={e => setNewBooking({ ...newBooking, totalPrice: Number(e.target.value) })} className="w-full bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-bold text-lg text-gold" />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-50 flex gap-3">
                                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-charcoal text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold transition-colors shadow-lg shadow-charcoal/20">Create Reservation</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

                <div className="h-full w-px bg-gray-200 mx-2 hidden md:block"></div>

                <div className="flex bg-gray-50 rounded-[1.5rem] p-1.5 gap-1.5 border border-gray-100">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-400 hover:text-charcoal'}`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-400 hover:text-charcoal'}`}
                    >
                        Calendar
                    </button>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        onClick={() => ExportService.exportBookingsToExcel(filteredBookings, rooms)}
                        className="bg-white text-green-600 px-6 py-3 rounded-xl border border-green-100 font-black text-[10px] uppercase tracking-widest hover:bg-green-50 transition-all flex items-center gap-2"
                    >
                        <span className="text-lg">📊</span> Export to Excel
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-gold text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#C5A059] transition-all shadow-xl shadow-gold/20 flex items-center gap-2"
                    >
                        <span className="text-lg">+</span> New Booking
                    </button>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                <AdminCalendar
                    onViewBooking={onViewBooking}
                    onBookSlot={(roomId, date) => {
                        const room = rooms.find(r => r.id === roomId);
                        setNewBooking({
                            guestName: '',
                            guestEmail: '',
                            roomId,
                            nights: 1,
                            totalPrice: room ? room.price : 0,
                            isoCheckIn: date
                        });
                        setIsCreating(true);
                    }}
                />
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-charcoal text-white">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em]">Guest Information</th>
                                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em]">Stay Details</th>
                                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em]">Financials</th>
                                    <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em]">Payment</th>
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
                                                        {booking.guestEmail}
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
                                                {booking.hasGymAccess && (
                                                    <>
                                                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                        <span className="flex items-center gap-1 text-gold">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            GYM
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <p className="text-base font-black text-gold">{formatPrice(booking.totalPrice, config.currency)}</p>
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Confirmed</p>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${booking.paymentStatus === 'paid' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-yellow-50 text-yellow-500 border-yellow-100'} border`}>
                                                    {booking.paymentStatus}
                                                </span>
                                                <span className="text-[8px] font-black text-gray-400 tracking-tighter uppercase px-1">
                                                    via {booking.paymentMethod}
                                                </span>
                                            </div>
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
            )}
        </div>
    );
};
