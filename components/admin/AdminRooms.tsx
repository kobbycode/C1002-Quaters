import React, { useMemo } from 'react';
import { useSite } from '../../context/SiteContext';
import { Room } from '../../types';
import { formatPrice } from '../../utils/formatters';

interface AdminRoomsProps {
    onEditRoom: (room: Room) => void;
    onOpenAddRoom: () => void;
}

export const AdminRooms: React.FC<AdminRoomsProps> = ({ onEditRoom, onOpenAddRoom }) => {
    const { rooms, updateRoom, deleteRoom, config, bookings } = useSite();

    const handleToggleBestSeller = async (id: string, current: boolean) => {
        await updateRoom(id, { isBestSeller: !current });
    };

    const handleToggleElite = async (id: string, current: boolean) => {
        await updateRoom(id, { isElite: !current });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this room? This cannot be undone.')) {
            await deleteRoom(id);
        }
    };

    // Calculate financial metrics for each room
    const roomMetrics = useMemo(() => {
        const metrics = new Map();

        rooms.forEach(room => {
            const roomBookings = bookings.filter(b => b.roomId === room.id);
            const totalRevenue = roomBookings.reduce((sum, b) => sum + b.totalPrice, 0);
            const bookingCount = roomBookings.length;
            const avgBookingValue = bookingCount > 0 ? totalRevenue / bookingCount : 0;

            // Calculate occupancy rate (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

            const recentBookings = roomBookings.filter(b =>
                b.isoCheckIn && b.isoCheckIn >= thirtyDaysAgoStr
            );
            const bookedNights = recentBookings.reduce((sum, b) => sum + (b.nights || 0), 0);
            const occupancyRate = (bookedNights / 30) * 100;

            metrics.set(room.id, {
                totalRevenue,
                bookingCount,
                avgBookingValue,
                occupancyRate: Math.min(occupancyRate, 100),
                roomName: room.name
            });
        });

        return metrics;
    }, [rooms, bookings]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div>
                    <h3 className="text-xl font-black font-serif text-charcoal">Inventory Management</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your {rooms.length} digital twin quarters</p>
                </div>
                <button
                    onClick={onOpenAddRoom}
                    className="bg-charcoal text-white font-black px-8 py-4 rounded-xl hover:bg-gold transition-all shadow-xl shadow-charcoal/10 uppercase tracking-widest text-xs flex items-center gap-3"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    Add New Room
                </button>
            </div>

            {/* Financial Breakdown Cards */}
            <div className="bg-gradient-to-br from-charcoal via-charcoal to-primary/20 p-10 rounded-[2.5rem] shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-8 bg-gold rounded-full" />
                    <div>
                        <h3 className="text-2xl font-black font-serif text-white">Financial Performance</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gold mt-1">Revenue breakdown by room</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => {
                        const metrics = roomMetrics.get(room.id) || { totalRevenue: 0, bookingCount: 0, avgBookingValue: 0, occupancyRate: 0 };

                        return (
                            <div key={room.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-gold uppercase tracking-widest mb-1">{room.category}</p>
                                        <h4 className="text-lg font-black text-white font-serif mb-1">{room.name}</h4>
                                    </div>
                                    {metrics.bookingCount > 0 && (
                                        <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {metrics.bookingCount > 0 ? (
                                    <div className="space-y-4">
                                        {/* Total Revenue */}
                                        <div>
                                            <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Total Revenue</p>
                                            <p className="text-3xl font-black text-gold font-serif">{formatPrice(metrics.totalRevenue, config.currency)}</p>
                                        </div>

                                        {/* Metrics Grid */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                            <div>
                                                <p className="text-[8px] font-black text-white/50 uppercase tracking-widest mb-1">Bookings</p>
                                                <p className="text-xl font-black text-white">{metrics.bookingCount}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-white/50 uppercase tracking-widest mb-1">Avg Value</p>
                                                <p className="text-xl font-black text-white">{formatPrice(metrics.avgBookingValue, config.currency)}</p>
                                            </div>
                                        </div>

                                        {/* Occupancy Bar */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Occupancy (30d)</p>
                                                <p className="text-xs font-black text-gold">{metrics.occupancyRate.toFixed(1)}%</p>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-gold to-white h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(metrics.occupancyRate, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">No bookings yet</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Room Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room) => (
                    <div key={room.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col hover:-translate-y-2">
                        <div className="aspect-[16/10] relative overflow-hidden">
                            <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                {room.isBestSeller && (
                                    <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary shadow-lg border border-white/20">Popular Choice</span>
                                )}
                                {room.isElite && (
                                    <span className="bg-primary px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg border border-primary/20">Top Pick</span>
                                )}
                            </div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-1">{room.category}</p>
                                <h4 className="text-xl font-black text-white font-serif">{room.name}</h4>
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Starting from</p>
                                    <p className="text-2xl font-black text-charcoal font-serif">{formatPrice(room.price, config.currency)}</p>
                                </div>
                                <div className="flex items-center text-gold text-xs font-black bg-gold/5 px-3 py-1.5 rounded-lg border border-gold/10">
                                    ★ {room.rating}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <button
                                    onClick={() => handleToggleBestSeller(room.id, room.isBestSeller || false)}
                                    className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${room.isBestSeller ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-gray-50 border-transparent text-gray-400 hover:text-charcoal hover:bg-gray-100'}`}
                                >
                                    {room.isBestSeller ? 'Remove Popular' : 'Set Popular'}
                                </button>
                                <button
                                    onClick={() => handleToggleElite(room.id, room.isElite || false)}
                                    className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${room.isElite ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-gray-50 border-transparent text-gray-400 hover:text-charcoal hover:bg-gray-100'}`}
                                >
                                    {room.isElite ? 'Remove Pick' : 'Set Pick'}
                                </button>
                            </div>

                            <div className="mt-auto flex gap-3 pt-6 border-t border-gray-50">
                                <button
                                    onClick={() => onEditRoom(room)}
                                    className="flex-1 bg-gray-50 text-charcoal font-black py-4 rounded-xl hover:bg-gray-100 transition-all uppercase tracking-widest text-[10px] border border-transparent hover:border-gray-200"
                                >
                                    Edit Unit
                                </button>
                                <button
                                    onClick={() => handleDelete(room.id)}
                                    className="px-5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100/50"
                                    title="Delete Room"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
