import React, { useMemo, useState } from 'react';
import { Room, SiteConfig, Booking } from '../../types';

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
    const [revenueDateFilter, setRevenueDateFilter] = useState<'7d' | '30d' | '90d'>('7d');
    const chartData = useMemo(() => {
        const now = new Date();
        const days = revenueDateFilter === '7d' ? 7 : revenueDateFilter === '30d' ? 30 : 90;
        const data: { date: string, value: number }[] = [];

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dailyRev = config.bookings
                .filter(b => b.date.startsWith(dateStr))
                .reduce((acc, b) => acc + b.totalPrice, 0);
            data.push({ date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value: dailyRev });
        }
        return data;
    }, [revenueDateFilter, config.bookings]);

    const financialData = useMemo(() => {
        const totalPotentialValue = rooms.reduce((acc, r) => acc + r.price, 0);
        const realizedRevenue = config.bookings.reduce((acc, b) => acc + b.totalPrice, 0);
        const categoryStats = config.categories.map(cat => {
            const catRooms = rooms.filter(r => r.category === cat);
            return {
                name: cat,
                count: catRooms.length,
                percent: rooms.length ? Math.round((catRooms.length / rooms.length) * 100) : 0
            };
        });
        const avgStayDuration = config.bookings.length
            ? (config.bookings.reduce((acc, b) => acc + b.nights, 0) / config.bookings.length).toFixed(1)
            : '0.0';

        return { totalPotentialValue, realizedRevenue, categoryStats, avgStayDuration };
    }, [rooms, config.categories, config.bookings]);

    const stats = [
        { label: 'Realized Revenue', value: `GH₵${financialData.realizedRevenue.toLocaleString()}`, sub: 'Settled Ledger', growth: '+15.2%', icon: '💰', trend: [30, 45, 35, 60, 55, 80, 75], color: '#8B008B' },
        { label: 'Active Bookings', value: config.bookings.length.toString(), sub: 'Confirmed Stays', growth: `+${config.bookings.length > 5 ? '12' : '5'}.5%`, icon: '📅', trend: [20, 30, 45, 40, 55, 50, 65], color: '#8B008B' },
        { label: 'Subscribers', value: config.newsletterSubscribers.length.toString(), sub: 'Active Audience', growth: '+5.2%', icon: '📧', trend: [10, 15, 12, 20, 25, 30, 35], color: '#10b981' },
        { label: 'Avg. Duration', value: `${financialData.avgStayDuration} Nights`, sub: 'Guest Commitment', growth: '+0.2%', icon: '⏳', trend: [1.2, 1.5, 1.4, 1.8, 2.1, 2.0, 2.2], color: '#3b82f6' },
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
                                const realizedForCat = config.bookings
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
                        <BookingCalendar bookings={config.bookings} />
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

            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-charcoal rounded-full" />
                        <h3 className="text-2xl font-black font-serif text-charcoal">Pulse Activity Feed</h3>
                    </div>
                    <button onClick={() => setActiveTab('bookings')} className="text-[10px] font-black uppercase text-gold hover:underline tracking-widest">
                        Enter Command Center
                    </button>
                </div>
                <div className="space-y-4">
                    {config.bookings.slice(0, 3).map(booking => (
                        <div key={booking.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-gold/30 transition-all cursor-pointer" onClick={() => setViewingBooking(booking)}>
                            <div className="flex items-center gap-8">
                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl shadow-sm">👤</div>
                                <div>
                                    <p className="text-sm font-black text-charcoal">{booking.guestName}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{booking.roomName} • {new Date(booking.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-charcoal">GH₵{booking.totalPrice.toLocaleString()}</p>
                                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1">Confirmed</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
