import React, { useMemo, useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { formatPrice } from '../../utils/formatters';
import { Booking } from '../../types';
import { ExportService } from '../../utils/export-service';

export const AdminPatrons: React.FC = () => {
    const { bookings, config } = useSite();
    const [searchTerm, setSearchTerm] = useState('');

    const patrons = useMemo(() => {
        const patronMap: Record<string, {
            email: string;
            name: string;
            totalSpent: number;
            totalNights: number;
            lastStay: string;
            bookings: Booking[]
        }> = {};

        bookings.forEach(booking => {
            const email = booking.guestEmail.toLowerCase();
            if (!patronMap[email]) {
                patronMap[email] = {
                    email,
                    name: booking.guestName,
                    totalSpent: 0,
                    totalNights: 0,
                    lastStay: booking.isoCheckIn,
                    bookings: []
                };
            }

            const p = patronMap[email];
            p.totalSpent += booking.totalPrice;
            p.totalNights += booking.nights;
            p.bookings.push(booking);
            if (new Date(booking.isoCheckIn) > new Date(p.lastStay)) {
                p.lastStay = booking.isoCheckIn;
            }
        });

        return Object.values(patronMap)
            .filter(p => p.email.includes(searchTerm.toLowerCase()) || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => b.totalSpent - a.totalSpent);
    }, [bookings, searchTerm]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden gap-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full pointer-events-none" />
                <div className="relative z-10">
                    <h3 className="text-2xl font-black font-serif text-charcoal">Patron Registry</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Cultivating Relationships with {patrons.length} Guests
                    </p>
                </div>

                <div className="relative w-full md:w-96 z-10">
                    <input
                        type="text"
                        placeholder="Search patrons by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <button
                    onClick={() => ExportService.exportToCSV(patrons.map(p => ({ Name: p.name, Email: p.email, 'Total Spent': p.totalSpent, 'Nights': p.totalNights, 'Last Stay': p.lastStay })), 'c1002-patrons')}
                    className="bg-gold text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#C5A059] transition-all shadow-xl shadow-gold/20 flex items-center gap-2 whitespace-nowrap"
                >
                    <span className="text-lg">📥</span> Export List
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {patrons.map((patron) => (
                    <div key={patron.email} className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                                    {patron.totalSpent > 5000 ? '💎' : patron.totalNights > 10 ? '⭐' : '👤'}
                                </div>
                                <div>
                                    <h4 className="text-base font-black text-charcoal">{patron.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 truncate w-40">{patron.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${patron.totalSpent > 10000 ? 'bg-primary/5 text-primary border-primary/20' : 'bg-gold/5 text-gold border-gold/20'
                                    }`}>
                                    {patron.totalSpent > 10000 ? 'Royal Elite' : 'Valued Patron'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                                <p className="text-lg font-black text-charcoal">{formatPrice(patron.totalSpent, config.currency)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Nights</p>
                                <p className="text-lg font-black text-charcoal">{patron.totalNights}</p>
                            </div>
                        </div>

                        <div className="mt-auto space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Last Stay</span>
                                <span className="text-charcoal font-black">{new Date(patron.lastStay).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Visits</span>
                                <span className="text-charcoal font-black">{patron.bookings.length} Chapters</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50 flex gap-2">
                            <button className="flex-1 bg-charcoal text-white font-black py-4 rounded-xl hover:bg-gold transition-all uppercase tracking-widest text-[9px] shadow-lg shadow-charcoal/10">
                                View History
                            </button>
                            <button className="px-5 bg-gray-50 text-charcoal rounded-xl hover:bg-gray-100 transition-all border border-gray-100" title="Add Private Note">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                        </div>
                    </div>
                ))}

                {patrons.length === 0 && (
                    <div className="col-span-full py-40 text-center">
                        <div className="text-5xl mb-6 grayscale opacity-30">👥</div>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No patrons found in the archives</p>
                    </div>
                )}
            </div>
        </div>
    );
};
