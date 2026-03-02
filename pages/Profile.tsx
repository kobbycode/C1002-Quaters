
import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import { Booking } from '../types';

const BookingCard: React.FC<{
    booking: Booking;
    roomName: string;
    roomImage: string;
    currency: string;
    config: any;
    isPast?: boolean;
}> = ({ booking, roomName, roomImage, currency, config, isPast }) => {
    const handleViewInvoice = () => {
        const invoiceWindow = window.open('', '_blank', 'width=800,height=900');
        if (!invoiceWindow) return;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${booking.id}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 40px; }
                    .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
                    .invoice-info { text-align: right; }
                    .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                    .label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 5px; }
                    .value { font-size: 16px; font-weight: 600; }
                    table { w-full; border-collapse: collapse; margin-top: 40px; }
                    th { text-align: left; padding: 15px; border-bottom: 1px solid #eee; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; }
                    td { padding: 15px; border-bottom: 1px solid #eee; font-size: 14px; }
                    .total-row { background: #fafafa; font-weight: 900; font-size: 18px; }
                    .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #999; font-style: italic; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">${config.brand.name}</div>
                    <div class="invoice-info">
                        <div class="label">Invoice Date</div>
                        <div class="value">${new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                <div class="grid">
                    <div>
                        <div class="label">Billed To</div>
                        <div class="value">${booking.guestName}</div>
                        <div class="value">${booking.guestEmail}</div>
                    </div>
                    <div>
                        <div class="label">Reservation Details</div>
                        <div class="value">Room: ${roomName}</div>
                        <div class="value">Reference: ${booking.id.slice(0, 8).toUpperCase()}</div>
                    </div>
                </div>

                <div class="grid">
                    <div>
                        <div class="label">Check In</div>
                        <div class="value">${booking.checkInDate}</div>
                    </div>
                    <div>
                        <div class="label">Check Out</div>
                        <div class="value">${booking.checkOutDate}</div>
                    </div>
                </div>

                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Nights</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${roomName} - Luxury Accommodation</td>
                            <td>${booking.nights}</td>
                            <td style="text-align: right;">${formatPrice(booking.totalPrice, currency)}</td>
                        </tr>
                        ${booking.hasGymAccess ? `
                        <tr>
                            <td>Elite Gym Access Add-on</td>
                            <td>${booking.nights}</td>
                            <td style="text-align: right;">Included</td>
                        </tr>
                        ` : ''}
                        <tr class="total-row">
                            <td colspan="2">Total Amount Paid</td>
                            <td style="text-align: right;">${formatPrice(booking.totalPrice, currency)}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="footer">
                    Thank you for choosing ${config.brand.name}. Obaake!<br>
                    ${config.footer.address}
                </div>

                <div class="no-print" style="margin-top: 40px; text-align: center;">
                    <button onclick="window.print()" style="padding: 12px 24px; background: #1a1a1a; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        Print Receipt
                    </button>
                </div>
            </body>
            </html>
        `;

        invoiceWindow.document.write(html);
        invoiceWindow.document.close();
    };

    return (
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
                    {booking.paymentStatus === 'paid' && (
                        <button
                            onClick={handleViewInvoice}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-charcoal transition-colors decoration-primary/30 underline underline-offset-4"
                        >
                            View Invoice
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Profile = () => {
    const { user, logout } = useAuth();
    const { bookings, rooms, config, notifications, markNotificationRead, loading: siteLoading } = useSite();
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

    const myNotifications = useMemo(() => {
        if (!user?.uid || !notifications) return [];
        return notifications
            .filter(n => n.userId === user.uid)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, [notifications, user]);

    const unreadCount = myNotifications.filter(n => !n.isRead).length;

    const handleNotificationClick = async (notif: any) => {
        if (!notif.isRead) {
            await markNotificationRead(notif.id);
        }
        if (notif.link) {
            navigate(notif.link);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background-light pt-24 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-3xl font-serif text-charcoal italic mb-2">Hello, {user.displayName?.split(' ')[0] || 'Guest'}</h1>
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
                        {unreadCount > 0 && <span className="ml-2 bg-gold text-white text-[9px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
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
                                                config={config}
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
                                                config={config}
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
                        {myNotifications.length > 0 ? myNotifications.map(notif => (
                            <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`bg-white p-6 rounded-2xl border transition-all cursor-pointer ${notif.isRead ? 'border-gray-50 opacity-75' : 'border-gold/20 bg-gold/5 flex gap-4 hover:border-gold/40'}`}
                            >
                                {!notif.isRead && <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-gold" />}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-charcoal text-sm">{notif.title}</h3>
                                        <span className="text-[9px] text-gray-400 uppercase tracking-widest">
                                            {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed max-w-lg">{notif.message}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">No notifications yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
