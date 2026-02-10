import React, { useMemo, useState } from 'react';
import { Room, SiteConfig, Booking } from '../../types';
import { useSite } from '../../context/SiteContext';
import { formatPrice } from '../../utils/formatters';

interface AdminOverviewProps {
    rooms: Room[];
    config: SiteConfig;
    setActiveTab: (tab: any) => void;
    setEditingRoom: (room: Room) => void;
    setViewingBooking: (booking: Booking) => void;
}

const Sparkline: React.FC<{ data: number[], color: string }> = ({ data, color }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 100;
    const height = 30;
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((d - min) / range) * height
    }));
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const RevenueChart: React.FC<{ data: { date: string, value: number }[] }> = ({ data }) => {
    const max = Math.max(...data.map(d => d.value)) || 1;
    const width = 800;
    const height = 200;
    const padding = 40;

    const points = data.map((d, i) => ({
        x: padding + (i / (data.length - 1)) * (width - padding * 2),
        y: (height - padding) - (d.value / max) * (height - padding * 2)
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <div className="w-full h-64 relative">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
                <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B008B" />
                        <stop offset="100%" stopColor="#8B008B" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map(v => (
                    <line
                        key={v}
                        x1={padding}
                        y1={(height - padding) - v * (height - padding * 2)}
                        x2={width - padding}
                        y2={(height - padding) - v * (height - padding * 2)}
                        stroke="#f3f4f6"
                        strokeWidth="1"
                    />
                ))}
                <path d={areaPath} fill="url(#revenueGradient)" opacity="0.1" />
                <path d={linePath} fill="none" stroke="#8B008B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                    <g key={i} className="group/point">
                        <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#8B008B" strokeWidth="2" />
                    </g>
                ))}
                {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0 || i === data.length - 1).map((d, i) => {
                    const p = points[data.indexOf(d)];
                    return (
                        <text key={i} x={p.x} y={height - 10} textAnchor="middle" className="text-[8px] font-black uppercase tracking-widest fill-gray-400">
                            {d.date}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

const BookingCalendar: React.FC<{ bookings: Booking[] }> = ({ bookings }) => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

    const dates = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
        const dateStr = d.toISOString().split('T')[0];
        const count = bookings.filter(b => b.date.startsWith(dateStr)).length;
        return { day: i + 1, count };
    });

    const getIntensity = (count: number) => {
        if (count === 0) return 'bg-gray-50 text-gray-300';
        if (count === 1) return 'bg-gold/20 text-gold';
        if (count > 2) return 'bg-gold text-white shadow-lg shadow-gold/20';
        return 'bg-gold/60 text-white';
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-[8px] font-black text-gray-400 text-center py-2 uppercase">{day}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {dates.map(d => (
                    <div
                        key={d.day}
                        className={`aspect-square flex items-center justify-center text-[10px] font-black rounded-lg transition-all hover:scale-110 cursor-default ${getIntensity(d.count)} ${d.day === now.getDate() ? 'border-2 border-charcoal' : ''}`}
                        title={`${d.count} reservations on ${d.day}`}
                    >
                        {d.day}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AdminOverview: React.FC<AdminOverviewProps> = ({
    rooms,
    config,
    setActiveTab,
    setEditingRoom,
    setViewingBooking
}) => {
    const { bookings } = useSite();
    const [revenueDateFilter, setRevenueDateFilter] = useState<'7d' | '30d' | '90d'>('7d');
    const chartData = useMemo(() => {
        const now = new Date();
        const days = revenueDateFilter === '7d' ? 7 : revenueDateFilter === '30d' ? 30 : 90;
        const data: { date: string, value: number }[] = [];

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dailyRev = bookings
                .filter(b => b.date.startsWith(dateStr))
                .reduce((acc, b) => acc + b.totalPrice, 0);
            data.push({ date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value: dailyRev });
        }
        return data;
    }, [revenueDateFilter, bookings]);

    const financialData = useMemo(() => {
        const totalPotentialValue = rooms.reduce((acc, r) => acc + r.price, 0);
        const realizedRevenue = bookings.reduce((acc, b) => acc + b.totalPrice, 0);
        const categoryStats = (config.categories || []).map(cat => {
            const catRooms = rooms.filter(r => r.category === cat);
            return {
                name: cat,
                count: catRooms.length,
                percent: rooms.length ? Math.round((catRooms.length / rooms.length) * 100) : 0
            };
        });
        const avgStayDuration = bookings.length
            ? (bookings.reduce((acc, b) => acc + b.nights, 0) / bookings.length).toFixed(1)
            : '0.0';

        // Calculate Occupancy Rate for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const bookedNightsLast30 = bookings
            .filter(b => b.isoCheckIn && b.isoCheckIn >= thirtyDaysAgo.toISOString().split('T')[0])
            .reduce((acc, b) => acc + b.nights, 0);
        const totalCapacityLast30 = rooms.length * 30;
        const occupancyRate = totalCapacityLast30 > 0
            ? Math.min(100, Math.round((bookedNightsLast30 / totalCapacityLast30) * 100))
            : 0;

        return { totalPotentialValue, realizedRevenue, categoryStats, avgStayDuration, occupancyRate };
    }, [rooms, config.categories || [], bookings]);

    const statsData = useMemo(() => {
        const now = new Date();
        const getRangeStats = (daysOffset: number, length: number) => {
            const start = new Date();
            start.setDate(now.getDate() - (daysOffset + length));
            start.setHours(0, 0, 0, 0);

            const end = new Date();
            end.setDate(now.getDate() - daysOffset);
            end.setHours(23, 59, 59, 999);

            const rangeBookings = bookings.filter(b => {
                const bDate = new Date(b.date);
                return bDate >= start && bDate <= end;
            });

            const revenue = rangeBookings.reduce((acc, b) => acc + b.totalPrice, 0);
            const count = rangeBookings.length;
            const nights = rangeBookings.reduce((acc, b) => acc + b.nights, 0);
            const avgNights = count > 0 ? nights / count : 0;

            return { revenue, count, avgNights };
        };

        const currentPeriod = getRangeStats(0, 7);
        const previousPeriod = getRangeStats(7, 7);

        const calculateGrowth = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? '+100%' : '0%';
            const growth = ((current - previous) / previous) * 100;
            return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
        };

        const getDailyTrend = (days: number, metric: 'revenue' | 'count' | 'avgNights') => {
            const trend: number[] = [];
            for (let i = days - 1; i >= 0; i--) {
                const stats = getRangeStats(i, 1);
                trend.push(stats[metric]);
            }
            return trend;
        };

        return {
            revenue: {
                growth: calculateGrowth(currentPeriod.revenue, previousPeriod.revenue),
                trend: getDailyTrend(7, 'revenue')
            },
            bookings: {
                growth: calculateGrowth(currentPeriod.count, previousPeriod.count),
                trend: getDailyTrend(7, 'count')
            },
            duration: {
                growth: calculateGrowth(currentPeriod.avgNights, previousPeriod.avgNights),
                trend: getDailyTrend(7, 'avgNights')
            }
        };
    }, [bookings]);

    const stats = [
        { label: 'Realized Revenue', value: formatPrice(financialData.realizedRevenue, config.currency || 'GHS'), sub: 'Settled Ledger', growth: statsData.revenue.growth, icon: '💰', trend: statsData.revenue.trend, color: '#8B008B' },
        { label: 'Occupancy Rate', value: `${financialData.occupancyRate}%`, sub: 'Inventory Yield', growth: '+0.0%', icon: '📈', trend: Array(7).fill(financialData.occupancyRate), color: '#10b981' },
        { label: 'Active Bookings', value: bookings.length.toString(), sub: 'Confirmed Stays', growth: statsData.bookings.growth, icon: '📅', trend: statsData.bookings.trend, color: '#8B008B' },
        { label: 'Avg. Duration', value: `${financialData.avgStayDuration} Nights`, sub: 'Guest Commitment', growth: statsData.duration.growth, icon: '⏳', trend: statsData.duration.trend, color: '#3b82f6' },
    ];

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(s => (
                    <div key={s.label} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-2xl">{s.icon}</span>
                            <Sparkline data={s.trend} color={s.color} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-1">{s.label}</p>
                            <div className="flex items-end gap-3 mb-1">
                                <p className="text-3xl font-black text-charcoal">{s.value}</p>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mb-1.5 ${s.growth.startsWith('+') ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'}`}>
                                    {s.growth}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-6 bg-gold rounded-full" />
                                <h3 className="text-2xl font-black font-serif text-charcoal">Revenue Performance</h3>
                            </div>
                            <div className="flex bg-gray-50 rounded-xl p-1 gap-1">
                                {(['7d', '30d', '90d'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setRevenueDateFilter(f)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${revenueDateFilter === f ? 'bg-white text-gold shadow-sm' : 'text-gray-400 hover:text-charcoal'}`}
                                    >
                                        {f === '7d' ? 'Week' : f === '30d' ? 'Month' : 'Quarter'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <RevenueChart data={chartData} />
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-6 bg-gold rounded-full" />
                                <h3 className="text-2xl font-black font-serif text-charcoal">Inventory Yield</h3>
                            </div>
                        </div>
                        <div className="h-64 flex items-end gap-12 px-4 border-b border-gray-50 pb-2">
                            {financialData.categoryStats.map(stat => {
                                const realizedForCat = bookings
                                    .filter(b => rooms.find(r => r.id === b.roomId)?.category === stat.name)
                                    .reduce((acc, b) => acc + b.totalPrice, 0);
                                const potentialForCat = rooms
                                    .filter(r => r.category === stat.name)
                                    .reduce((acc, r) => acc + r.price, 0);

                                const maxVal = Math.max(...financialData.categoryStats.map(s => {
                                    const pot = rooms.filter(r => r.category === s.name).reduce((acc, r) => acc + r.price, 0);
                                    return pot || 1;
                                }));

                                const potHeight = (potentialForCat / maxVal) * 100;
                                const realHeight = (realizedForCat / maxVal) * 100;

                                return (
                                    <div key={stat.name} className="flex-1 flex flex-col items-center gap-4 group">
                                        <div className="w-full h-full flex items-end justify-center gap-1.5 relative">
                                            <div style={{ height: `${potHeight}%` }} className="w-4 bg-gold/10 rounded-t-lg transition-all group-hover:bg-gold/20" />
                                            <div style={{ height: `${realHeight}%` }} className="w-4 bg-charcoal rounded-t-lg transition-all group-hover:bg-gold" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-charcoal p-10 rounded-[2.5rem] shadow-xl shadow-charcoal/20 relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-1.5 h-6 bg-gold rounded-full" />
                            <h3 className="text-2xl font-black font-serif text-white">Occupancy Pulse</h3>
                        </div>
                        <BookingCalendar bookings={bookings} />
                    </div>

                    <div className="bg-charcoal p-10 rounded-[2.5rem] shadow-xl shadow-charcoal/20 relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-1.5 h-6 bg-gold rounded-full" />
                            <h3 className="text-2xl font-black font-serif text-white">Portfolio DNA</h3>
                        </div>
                        <div className="space-y-6">
                            {financialData.categoryStats.map(stat => (
                                <div key={stat.name} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.name}</span>
                                        <span className="text-[10px] font-black text-gold">{stat.percent}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div style={{ width: `${stat.percent}%` }} className="h-full bg-gold rounded-full transition-all duration-1000" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-6 bg-gold rounded-full" />
                            <h3 className="text-2xl font-black font-serif text-charcoal">Upcoming Arrivals</h3>
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Next 7 Days</span>
                    </div>
                    <div className="space-y-4">
                        {bookings
                            .filter(b => b.isoCheckIn && b.isoCheckIn >= new Date().toISOString().split('T')[0])
                            .sort((a, b) => a.isoCheckIn.localeCompare(b.isoCheckIn))
                            .slice(0, 5)
                            .map(booking => (
                                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-lg">🧳</div>
                                        <div>
                                            <p className="text-sm font-black text-charcoal">{booking.guestName}</p>
                                            <p className="text-[10px] font-bold text-gold uppercase tracking-widest">{booking.isoCheckIn}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-charcoal uppercase tracking-widest">{booking.roomName}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{booking.nights} Nights</p>
                                    </div>
                                </div>
                            ))}
                        {bookings.filter(b => b.isoCheckIn && b.isoCheckIn >= new Date().toISOString().split('T')[0]).length === 0 && (
                            <p className="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">No upcoming arrivals</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-6 bg-charcoal rounded-full" />
                            <h3 className="text-2xl font-black font-serif text-charcoal">Pulse Activity Feed</h3>
                        </div>
                        <button onClick={() => setActiveTab('bookings')} className="text-[10px] font-black uppercase text-gold hover:underline tracking-widest">
                            Command Center
                        </button>
                    </div>
                    <div className="space-y-4">
                        {bookings.slice(0, 5).map(booking => (
                            <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-gold/30 transition-all cursor-pointer" onClick={() => setViewingBooking(booking)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-lg shadow-sm">👤</div>
                                    <div>
                                        <p className="text-sm font-black text-charcoal">{booking.guestName}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{booking.roomName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-charcoal">{formatPrice(booking.totalPrice, config.currency || 'GHS')}</p>
                                    <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${booking.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {booking.paymentStatus}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
