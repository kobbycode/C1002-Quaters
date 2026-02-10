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

const RevenueChart: React.FC<{ data: { date: string, value: number }[], projected?: { date: string, value: number }[] }> = ({ data, projected = [] }) => {
    const allData = [...data, ...projected];
    const max = Math.max(...allData.map(d => d.value)) || 1;
    const width = 800;
    const height = 200;
    const padding = 40;

    const points = data.map((d, i) => ({
        x: padding + (i / (allData.length - 1)) * (width - padding * 2),
        y: (height - padding) - (d.value / max) * (height - padding * 2)
    }));

    const projPoints = projected.map((d, i) => ({
        x: padding + ((data.length + i) / (allData.length - 1)) * (width - padding * 2),
        y: (height - padding) - (d.value / max) * (height - padding * 2)
    }));

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const projPath = projPoints.length > 0
        ? `M ${points[points.length - 1].x} ${points[points.length - 1].y} ` + projPoints.map(p => `L ${p.x} ${p.y}`).join(' ')
        : '';
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
                {projPath && (
                    <path d={projPath} fill="none" stroke="#8B008B" strokeWidth="2" strokeDasharray="6,4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                )}
                {points.map((p, i) => (
                    <g key={i} className="group/point">
                        <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#8B008B" strokeWidth="2" />
                    </g>
                ))}
                {projPoints.map((p, i) => (
                    <circle key={`proj-${i}`} cx={p.x} cy={p.y} r="3" fill="white" stroke="#8B008B" strokeWidth="1.5" strokeDasharray="2,1" />
                ))}
                {allData.filter((_, i) => i % Math.ceil(allData.length / 5) === 0 || i === allData.length - 1).map((d, i) => {
                    const idx = allData.indexOf(d);
                    const p = idx < data.length ? points[idx] : projPoints[idx - data.length];
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
    const now = useMemo(() => new Date(), []);
    const [revenueDateFilter, setRevenueDateFilter] = useState<'7d' | '30d' | '90d'>('7d');
    const chartData = useMemo(() => {
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
        const projected: { date: string, value: number }[] = [];
        const dailyAvg = data.reduce((acc, d) => acc + d.value, 0) / (data.length || 1);

        // Calculate growth trend between first half and second half of historical data
        const halfIdx = Math.floor(data.length / 2);
        const firstHalf = data.slice(0, halfIdx);
        const secondHalf = data.slice(halfIdx);
        const firstAvg = firstHalf.reduce((acc, d) => acc + d.value, 0) / (firstHalf.length || 1);
        const secondAvg = secondHalf.reduce((acc, d) => acc + d.value, 0) / (secondHalf.length || 1);
        const growthMultiplier = firstAvg > 0 ? secondAvg / firstAvg : 1;

        for (let i = 1; i <= 3; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() + i * (days / 3));
            projected.push({
                date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                value: dailyAvg * Math.pow(growthMultiplier, i / 3) * (1 + (Math.random() * 0.1 - 0.05))
            });
        }

        return { historical: data, projected };
    }, [revenueDateFilter, bookings, now]);

    const { reviews } = useSite();

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

        // RevPAR (Revenue Per Available Room)
        const revenueLast30 = bookings
            .filter(b => b.date && b.date >= thirtyDaysAgo.toISOString().split('T')[0])
            .reduce((acc, b) => acc + b.totalPrice, 0);
        const revPAR = totalCapacityLast30 > 0 ? (revenueLast30 / totalCapacityLast30).toFixed(0) : '0';

        // Room Performance Scores
        const roomPerformance = rooms.map(room => {
            const roomBookings = bookings.filter(b => b.roomId === room.id);
            const roomBookedNights = roomBookings
                .filter(b => b.isoCheckIn && b.isoCheckIn >= thirtyDaysAgo.toISOString().split('T')[0])
                .reduce((acc, b) => acc + b.nights, 0);

            const roomOccupancy = Math.min(100, (roomBookedNights / 30) * 100);

            // Integrate guest sentiment (reviews) into score
            const roomReviews = reviews.filter(r => r.roomId === room.id && r.status === 'approved');
            const reviewCountFactor = Math.min(1, roomReviews.length / 5); // Trust factor caps at 5 reviews
            const avgRating = roomReviews.length > 0
                ? roomReviews.reduce((acc, r) => acc + r.rating, 0) / roomReviews.length
                : room.rating;

            const score = (roomOccupancy * 0.6) + (avgRating * 6) + (reviewCountFactor * 10); // Max score 100

            return {
                id: room.id,
                name: room.name,
                score: Math.round(score),
                revenue: roomBookings.reduce((acc, b) => acc + b.totalPrice, 0),
                occupancy: Math.round(roomOccupancy)
            };
        }).sort((a, b) => b.score - a.score);

        // Revenue Forecasting
        const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInCurrentMonth - now.getDate();
        const dailyAvgLast30 = revenueLast30 / 30;
        const knownNext30 = bookings
            .filter(b => b.isoCheckIn && b.isoCheckIn > now.toISOString().split('T')[0] && b.isoCheckIn <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .reduce((acc, b) => acc + b.totalPrice, 0);
        const forecastedRevenue = knownNext30 + (dailyAvgLast30 * daysRemaining);

        // Seasonal Occupancy Pulse (Calculated from actual bookings)
        const seasonalPulse = [
            { season: 'Jan-Mar', start: 0, end: 2, color: '#8B008B' },
            { season: 'Apr-Jun', start: 3, end: 5, color: '#10b981' },
            { season: 'Jul-Sep', start: 6, end: 8, color: '#fbbf24' },
            { season: 'Oct-Dec', start: 9, end: 11, color: '#3b82f6' }
        ].map(s => {
            const seasonalBookings = bookings.filter(b => {
                const month = new Date(b.date).getMonth();
                return month >= s.start && month <= s.end;
            });
            const totalNights = seasonalBookings.reduce((acc, b) => acc + b.nights, 0);
            const totalCapacity = rooms.length * 91; // Approx days per quarter
            const level = totalCapacity > 0 ? Math.min(1, totalNights / totalCapacity) : 0;
            return {
                season: s.season,
                level: Math.max(0.1, level), // Ensure it's at least visible
                color: s.color
            };
        });

        // Strategic Insight (Generated based on data trends)
        let strategicInsight = "Portfolio yield is stable. Maintain current market positioning and housekeeping standards.";
        if (occupancyRate > 85) {
            strategicInsight = "Exceptional occupancy momentum. Consider a 10-15% premium adjustment for the upcoming cycle.";
        } else if (occupancyRate < 30) {
            strategicInsight = "Yield momentum is below target. Consider targeted digital promotions or social media showcases.";
        } else if (roomPerformance.length > 0 && roomPerformance[0].score > 90) {
            strategicInsight = `${roomPerformance[0].name} is performing at an elite level. Use its aesthetic as a baseline for other units.`;
        }

        return { totalPotentialValue, realizedRevenue, categoryStats, avgStayDuration, occupancyRate, revPAR, roomPerformance, forecastedRevenue, seasonalPulse, strategicInsight };
    }, [rooms, config.categories || [], bookings, reviews]);

    const statsData = useMemo(() => {
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
        { label: 'Realized Revenue', value: formatPrice(financialData.realizedRevenue, config.currency || 'GHS'), sub: `${formatPrice(parseInt(financialData.revPAR), config.currency || 'GHS')} RevPAR`, growth: statsData.revenue.growth, icon: '💰', trend: statsData.revenue.trend, color: '#8B008B' },
        { label: 'Occupancy Rate', value: `${financialData.occupancyRate}%`, sub: '30-Day Inventory Yield', growth: '+0.0%', icon: '📈', trend: Array(7).fill(financialData.occupancyRate), color: '#10b981' },
        { label: 'Top Performer', value: financialData.roomPerformance[0]?.score.toString() || '0', sub: financialData.roomPerformance[0]?.name || 'No data', growth: 'Elite', icon: '🏆', trend: Array(7).fill(financialData.roomPerformance[0]?.score || 0), color: '#fbbf24' },
        { label: 'Avg. Duration', value: `${financialData.avgStayDuration} Nights`, sub: 'Guest Commitment', growth: statsData.duration.growth, icon: '⏳', trend: statsData.duration.trend, color: '#3b82f6' },
        { label: 'Monthly Forecast', value: formatPrice(financialData.forecastedRevenue, config.currency || 'GHS'), sub: 'Next 30 Days Projection', growth: 'Foresight', icon: '🔮', trend: [financialData.realizedRevenue * 0.8, financialData.realizedRevenue, financialData.forecastedRevenue], color: '#6B006B' },
    ];

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
                        <RevenueChart data={chartData.historical} projected={chartData.projected} />
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h3 className="text-2xl font-black font-serif text-charcoal">Room Performance Matrix</h3>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {financialData.roomPerformance.slice(0, 5).map(room => (
                                <div key={room.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-sm font-black text-gold">
                                            {room.score}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-charcoal">{room.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{room.occupancy}% Occupancy</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 max-w-[200px] h-1.5 bg-gray-50 rounded-full mx-8 overflow-hidden hidden md:block">
                                        <div style={{ width: `${room.score}%` }} className="h-full bg-primary rounded-full" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-charcoal">{formatPrice(room.revenue, config.currency || 'GHS')}</p>
                                        <p className="text-[9px] font-bold text-gold uppercase tracking-widest">Total Yield</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] pointer-events-none" />
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                <h3 className="text-2xl font-black font-serif text-charcoal">Seasonal Occupancy Pulse</h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 h-48 items-end px-4 border-b border-gray-50 pb-4">
                            {financialData.seasonalPulse.map(s => (
                                <div key={s.season} className="flex-1 flex flex-col items-center gap-3 group">
                                    <div className="w-full relative flex flex-col items-center">
                                        <div
                                            className="w-8 rounded-t-xl transition-all duration-1000 group-hover:scale-y-110 origin-bottom"
                                            style={{
                                                height: `${s.level * 100}%`,
                                                backgroundColor: s.color,
                                                opacity: s.level > 0.8 ? 1 : 0.6
                                            }}
                                        />
                                        {s.level > 0.8 && <div className="absolute -top-6 text-[8px] font-black text-primary uppercase">Peak</div>}
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">{s.season}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                            <span className="text-xl">💡</span>
                            <div>
                                <p className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1">Strategic Insight</p>
                                <p className="text-[10px] text-gray-400 font-bold leading-relaxed lowercase">{financialData.strategicInsight}</p>
                            </div>
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
