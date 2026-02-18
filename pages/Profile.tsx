
import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import { Booking } from '../types';

const BookingCard: React.FC<{ booking: Booking; roomName: string; roomImage: string; currency: string; isPast?: boolean }> = ({ booking, roomName, roomImage, currency, isPast }) => (
    <div className={`bg-white rounded-3xl p-6 border ${isPast ? 'border-gray-100 opacity-75' : 'border-gray-100 shadow-lg hover:shadow-xl'} transition-all flex flex-col md:flex-row gap-6`}>
        <div className="w-full md:w-48 aspect-video md:aspect-square rounded-2xl overflow-hidden shrink-0">
            <img src={roomImage} alt={roomName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-2 inline-block ${isPast ? 'bg-gray-100 text-gray-400' :
                            booking.status === 'checked-out' ? 'bg-gray-100 text-gray-400' :
                                booking.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'
                            }`}>
                            {booking.status === 'checked-out' ? 'Completed' : booking.paymentStatus === 'paid' ? 'Confirmed' : 'Pending Payment'}
                        </span>
                        <h3 className="text-xl font-serif text-charcoal font-bold">{roomName}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-black text-charcoal">{formatPrice(booking.totalPrice, currency)}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{booking.nights} Nights</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Check In</p>
                        <p className="text-sm font-bold text-charcoal">{new Date(booking.isoCheckIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Check Out</p>
                        <p className="text-sm font-bold text-charcoal">{new Date(booking.isoCheckOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-50 flex gap-4">
                <Link to={`/rooms/${booking.roomId}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-gold hover:text-gold-dark transition-colors">
                    View Room
                </Link>
                {!isPast && booking.paymentStatus === 'paid' && (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                        Invoice Available
                    </span>
                )}
            </div>
        </div>
    </div>
);

const Profile = () => {
    const { user, logout } = useAuth();
    const { bookings, rooms, config, loading: siteLoading } = useSite();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'bookings' | 'notifications'>('bookings');

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const myBookings = useMemo(() => {
        if (!user?.email || !bookings) return { upcoming: [], past: [] };

        const userEmail = user.email.toLowerCase();
        const userBookings = bookings.filter(b => b.guestEmail.toLowerCase() === userEmail);

        const today = new Date().toISOString().split('T')[0];

        const upcoming = userBookings.filter(b => b.isoCheckOut >= today).sort((a, b) => b.isoCheckIn.localeCompare(a.isoCheckIn));
        const past = userBookings.filter(b => b.isoCheckOut < today).sort((a, b) => b.isoCheckIn.localeCompare(a.isoCheckIn));

        return { upcoming, past };
    }, [bookings, user]);

    const notifications = [
        { id: 1, title: `Welcome to ${config.brand.name}`, message: 'We are delighted to have you with us.', date: 'Just now', read: false },
        { id: 2, title: 'Profile Created', message: 'Your account has been successfully set up.', date: 'Just now', read: true },
    ];

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background-light pt-24 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-serif text-charcoal italic mb-2">Hello, {user.displayName?.split(' ')[0] || 'Guest'}</h1>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Manage your stays and preferences</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-white border border-gray-100 hover:border-red-100 hover:bg-red-50 hover:text-red-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all text-charcoal shadow-sm"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="flex gap-8 border-b border-gray-200 mb-10 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'bookings' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-charcoal'}`}
                    >
                        My Reservations
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'notifications' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-charcoal'}`}
                    >
                        Notifications
                        <span className="ml-2 bg-gold text-white text-[9px] px-1.5 py-0.5 rounded-full">2</span>
                    </button>
                </div>

                {activeTab === 'bookings' && (
                    <div className="space-y-12 animate-fade-in">
                        {/* Upcoming */}
                        <div>
                            <h2 className="text-lg font-serif italic text-charcoal mb-6 flex items-center gap-3">
                                Upcoming Stays <span className="text-xs not-italic font-bold bg-gray-100 px-2 py-1 rounded text-gray-500 font-sans">{myBookings.upcoming.length}</span>
                            </h2>
                            {myBookings.upcoming.length > 0 ? (
                                <div className="space-y-4">
                                    {myBookings.upcoming.map(booking => {
                                        const room = rooms.find(r => r.id === booking.roomId);
                                        return (
                                            <BookingCard
                                                key={booking.id}
                                                booking={booking}
                                                roomName={booking.roomName}
                                                roomImage={room?.image || ''}
                                                currency={config.currency || 'GHS'}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">No upcoming reservations</p>
                                    <Link to="/rooms" className="inline-block bg-charcoal text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold transition-all">
                                        Explore Rooms
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Past */}
                        {myBookings.past.length > 0 && (
                            <div className="opacity-75">
                                <h2 className="text-lg font-serif italic text-charcoal mb-6 flex items-center gap-3">
                                    Past Stays <span className="text-xs not-italic font-bold bg-gray-100 px-2 py-1 rounded text-gray-500 font-sans">{myBookings.past.length}</span>
                                </h2>
                                <div className="space-y-4">
                                    {myBookings.past.map(booking => {
                                        const room = rooms.find(r => r.id === booking.roomId);
                                        return (
                                            <BookingCard
                                                key={booking.id}
                                                booking={booking}
                                                roomName={booking.roomName}
                                                roomImage={room?.image || ''}
                                                currency={config.currency || 'GHS'}
                                                isPast
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="space-y-4 animate-fade-in max-w-2xl">
                        {notifications.map(notif => (
                            <div key={notif.id} className={`bg-white p-6 rounded-2xl border ${notif.read ? 'border-gray-50' : 'border-gold/20 bg-gold/5 flex gap-4'}`}>
                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.read ? 'bg-gray-200' : 'bg-gold'}`} />
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-charcoal text-sm">{notif.title}</h3>
                                        <span className="text-[9px] text-gray-400 uppercase tracking-widest">{notif.date}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed max-w-lg">{notif.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
