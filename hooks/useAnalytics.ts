import { useMemo } from 'react';
import { Room, SiteConfig, Booking, Review } from '../types';
import { formatPrice } from '../utils/formatters';

interface AnalyticsHookProps {
    rooms: Room[];
    bookings: Booking[];
    reviews: Review[];
    config: SiteConfig;
    revenueDateFilter?: '7d' | '30d' | '90d';
}

export const useAnalytics = ({
    rooms,
    bookings,
    reviews,
    config,
    revenueDateFilter = '7d'
}: AnalyticsHookProps) => {
    const now = useMemo(() => new Date(), []);

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

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const bookedNightsLast30 = bookings
            .filter(b => b.isoCheckIn && b.isoCheckIn >= thirtyDaysAgo.toISOString().split('T')[0])
            .reduce((acc, b) => acc + b.nights, 0);
        const totalCapacityLast30 = rooms.length * 30;
        const occupancyRate = totalCapacityLast30 > 0
            ? Math.min(100, Math.round((bookedNightsLast30 / totalCapacityLast30) * 100))
            : 0;

        const revenueLast30 = bookings
            .filter(b => b.date && b.date >= thirtyDaysAgo.toISOString().split('T')[0])
            .reduce((acc, b) => acc + b.totalPrice, 0);
        const revPAR = totalCapacityLast30 > 0 ? (revenueLast30 / totalCapacityLast30).toFixed(0) : '0';

        const roomPerformance = rooms.map(room => {
            const roomBookings = bookings.filter(b => b.roomId === room.id);
            const roomBookedNights = roomBookings
                .filter(b => b.isoCheckIn && b.isoCheckIn >= thirtyDaysAgo.toISOString().split('T')[0])
                .reduce((acc, b) => acc + b.nights, 0);

            const roomOccupancy = Math.min(100, (roomBookedNights / 30) * 100);
            const roomReviews = reviews.filter(r => r.roomId === room.id && r.status === 'approved');
            const reviewCountFactor = Math.min(1, roomReviews.length / 5);
            const avgRating = roomReviews.length > 0
                ? roomReviews.reduce((acc, r) => acc + r.rating, 0) / roomReviews.length
                : room.rating;

            const score = (roomOccupancy * 0.6) + (avgRating * 6) + (reviewCountFactor * 10);

            return {
                id: room.id,
                name: room.name,
                score: Math.round(score),
                revenue: roomBookings.reduce((acc, b) => acc + b.totalPrice, 0),
                occupancy: Math.round(roomOccupancy)
            };
        }).sort((a, b) => b.score - a.score);

        const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInCurrentMonth - now.getDate();
        const dailyAvgLast30 = revenueLast30 / 30;
        const knownNext30 = bookings
            .filter(b => b.isoCheckIn && b.isoCheckIn > now.toISOString().split('T')[0] && b.isoCheckIn <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .reduce((acc, b) => acc + b.totalPrice, 0);
        const forecastedRevenue = knownNext30 + (dailyAvgLast30 * daysRemaining);

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
            const totalCapacity = rooms.length * 91;
            const level = totalCapacity > 0 ? Math.min(1, totalNights / totalCapacity) : 0;
            return {
                season: s.season,
                level: Math.max(0.1, level),
                color: s.color
            };
        });

        let strategicInsight = "Portfolio yield is stable. Maintain current market positioning and housekeeping standards.";
        if (occupancyRate > 85) {
            strategicInsight = "Exceptional occupancy momentum. Consider a 10-15% premium adjustment for the upcoming cycle.";
        } else if (occupancyRate < 30) {
            strategicInsight = "Yield momentum is below target. Consider targeted digital promotions or social media showcases.";
        } else if (roomPerformance.length > 0 && roomPerformance[0].score > 90) {
            strategicInsight = `${roomPerformance[0].name} is performing at an elite level. Use its aesthetic as a baseline for other units.`;
        }

        return { totalPotentialValue, realizedRevenue, categoryStats, avgStayDuration, occupancyRate, revPAR, roomPerformance, forecastedRevenue, seasonalPulse, strategicInsight };
    }, [rooms, config.categories, bookings, reviews, now]);

    const statsData = useMemo(() => {
        const getRangeStats = (daysOffset: number, length: number) => {
            const start = new Date(now);
            start.setDate(now.getDate() - (daysOffset + length));
            start.setHours(0, 0, 0, 0);

            const end = new Date(now);
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
    }, [bookings, now]);

    const stats = useMemo(() => [
        { label: 'Realized Revenue', value: formatPrice(financialData.realizedRevenue, config.currency || 'GHS'), sub: `${formatPrice(parseInt(financialData.revPAR), config.currency || 'GHS')} RevPAR`, growth: statsData.revenue.growth, icon: '💰', trend: statsData.revenue.trend, color: '#8B008B' },
        { label: 'Occupancy Rate', value: `${financialData.occupancyRate}%`, sub: '30-Day Inventory Yield', growth: '+0.0%', icon: '📈', trend: Array(7).fill(financialData.occupancyRate), color: '#10b981' },
        { label: 'Top Performer', value: financialData.roomPerformance[0]?.score.toString() || '0', sub: financialData.roomPerformance[0]?.name || 'No data', growth: 'Elite', icon: '🏆', trend: Array(7).fill(financialData.roomPerformance[0]?.score || 0), color: '#fbbf24' },
        { label: 'Avg. Duration', value: `${financialData.avgStayDuration} Nights`, sub: 'Guest Commitment', growth: statsData.duration.growth, icon: '⏳', trend: statsData.duration.trend, color: '#3b82f6' },
        { label: 'Monthly Forecast', value: formatPrice(financialData.forecastedRevenue, config.currency || 'GHS'), sub: 'Next 30 Days Projection', growth: 'Foresight', icon: '🔮', trend: [financialData.realizedRevenue * 0.8, financialData.realizedRevenue, financialData.forecastedRevenue], color: '#6B006B' },
    ], [financialData, statsData, config.currency]);

    return {
        chartData,
        financialData,
        statsData,
        stats,
        now
    };
};
