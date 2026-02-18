import React, { useMemo } from 'react';
import { useSite } from '../../context/SiteContext';
import { formatPrice } from '../../utils/formatters';
import { ExportService } from '../../utils/export-service';

import { useAnalytics } from '../../hooks/useAnalytics';

export const AdminFinancials: React.FC = () => {
    const { rooms, bookings, reviews, config } = useSite();

    const { financialData } = useAnalytics({
        rooms,
        bookings,
        reviews,
        config
    });

    const roiData = useMemo(() => {
        return rooms.map(room => {
            const roomBookings = bookings.filter(b => b.roomId === room.id && b.paymentStatus === 'paid');
            const grossRevenue = roomBookings.reduce((acc, b) => acc + b.totalPrice, 0);

            // Calculate costs
            const maintenance = room.maintenanceCost || 250; // Default if not set
            const overheadPercent = room.operationalOverhead || 0.12; // 12% default
            const operationalCosts = grossRevenue * overheadPercent;

            const netProfit = grossRevenue - operationalCosts - (maintenance * 6); // Look at 6 months as default window
            const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

            // Find current occupancy from centralized data if available, or fallback
            const perf = financialData.roomPerformance.find(p => p.id === room.id);

            return {
                ...room,
                grossRevenue,
                netProfit,
                margin: Math.round(margin),
                occupancy: perf ? perf.occupancy : Math.round((roomBookings.length / 30) * 100)
            };
        }).sort((a, b) => b.netProfit - a.netProfit);
    }, [rooms, bookings, financialData.roomPerformance]);

    const portfolioMetrics = useMemo(() => {
        const totalGross = roiData.reduce((acc, r) => acc + r.grossRevenue, 0);
        const totalNet = roiData.reduce((acc, r) => acc + r.netProfit, 0);
        const avgMargin = roiData.length > 0 ? roiData.reduce((acc, r) => acc + r.margin, 0) / roiData.length : 0;

        return { totalGross, totalNet, avgMargin };
    }, [roiData]);

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* High Level Portfolio Health */}
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-3xl font-black font-serif text-charcoal">Financial Performance</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ROI & Net Yield Analysis</p>
                </div>
                <button
                    onClick={() => ExportService.exportFinancialsToPDF(financialData, bookings, config)}
                    // Passing real financialData now!
                    className="bg-charcoal text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold transition-all shadow-xl shadow-charcoal/20 flex items-center gap-2"
                >
                    <span className="text-lg">📄</span> Download Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-charcoal p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem] pointer-events-none" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Portfolio Net Yield</p>
                    <h3 className="text-4xl font-black font-serif text-white mb-2">{formatPrice(portfolioMetrics.totalNet, config.currency)}</h3>
                    <p className="text-[10px] font-bold text-gold uppercase tracking-widest">After Operational Overhead</p>
                </div>
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Average Operating Margin</p>
                    <h3 className="text-4xl font-black font-serif text-charcoal mb-2">{Math.round(portfolioMetrics.avgMargin)}%</h3>
                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                        <div style={{ width: `${portfolioMetrics.avgMargin}%` }} className="h-full bg-primary rounded-full" />
                    </div>
                </div>
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Market Efficiency</p>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-black font-serif text-gold">Elite</span>
                        <div className="px-3 py-1 bg-gold/5 text-gold border border-gold/10 rounded-lg text-[9px] font-black uppercase tracking-widest">Top 5%</div>
                    </div>
                </div>
            </div>

            {/* Profitability Leaderboard */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black font-serif text-charcoal">Profitability Matrix</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ranking quarters by Net Contribution</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">High Margin</span>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                                <th className="px-10 py-6">Accommodation</th>
                                <th className="px-8 py-6">Gross Yield</th>
                                <th className="px-8 py-6">Net Contribution</th>
                                <th className="px-8 py-6">Operating Margin</th>
                                <th className="px-10 py-6 text-right">Performance Index</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {roiData.map((room) => (
                                <tr key={room.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-sm shadow-inner overflow-hidden">
                                                <img src={room.image} className="w-full h-full object-cover group-hover:scale-125 transition-transform" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-charcoal">{room.name}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{room.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <p className="text-sm font-black text-charcoal">{formatPrice(room.grossRevenue, config.currency)}</p>
                                    </td>
                                    <td className="px-8 py-8">
                                        <p className="text-sm font-black text-primary">{formatPrice(room.netProfit, config.currency)}</p>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                <div style={{ width: `${room.margin}%` }} className={`h-full rounded-full ${room.margin > 70 ? 'bg-primary' : 'bg-gold'}`} />
                                            </div>
                                            <span className="text-[10px] font-black text-charcoal">{room.margin}%</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${room.margin > 70 ? 'bg-primary/5 text-primary border-primary/20' : 'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                            {room.margin > 70 ? 'Alpha Asset' : 'Core Performer'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Strategic Advice */}
            <div className="bg-gold/5 border border-gold/10 p-10 rounded-[3rem] flex items-start gap-8">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-3xl">💡</div>
                <div>
                    <h4 className="text-lg font-black font-serif text-charcoal mb-2">Portfolio Optimization Strategy</h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-2xl">
                        Based on current ROI metrics, your **{roiData[0]?.category}** assets are yielding the highest net margins.
                        We recommend prioritizing maintenance upgrades for these units and consider a **5-10% rate escalation** in the next seasonal adjustment to further capture consumer surplus.
                    </p>
                </div>
            </div>
        </div>
    );
};
