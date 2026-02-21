import React, { useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { Activity } from '../../types';

export const AdminActivity: React.FC = () => {
    const { activities } = useSite();
    const [filter, setFilter] = useState<Activity['type'] | 'all'>('all');
    const [search, setSearch] = useState('');

    const filteredActivities = activities.filter(a => {
        const matchesFilter = filter === 'all' || a.type === filter;
        const matchesSearch = a.action.toLowerCase().includes(search.toLowerCase()) ||
            a.details.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getTypeEmoji = (type: Activity['type']) => {
        switch (type) {
            case 'booking': return '📅';
            case 'registration': return '👤';
            case 'payment': return '💳';
            case 'review': return '⭐';
            case 'admin': return '⚙️';
            default: return '🔔';
        }
    };

    const getTypeColor = (type: Activity['type']) => {
        switch (type) {
            case 'booking': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'registration': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'payment': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'review': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'admin': return 'bg-gold/10 text-gold border-gold/20';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex-1 w-full">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search activity logs..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-gray-50 border-transparent rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-bold text-sm"
                        />
                    </div>
                </div>
                <div className="flex bg-gray-50 rounded-xl p-1 gap-1 w-full md:w-auto overflow-x-auto no-scrollbar">
                    {(['all', 'booking', 'registration', 'payment', 'review', 'admin'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-white text-gold shadow-sm' : 'text-gray-400 hover:text-charcoal'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Type</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Action</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Details</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredActivities.length > 0 ? filteredActivities.map(activity => (
                                <tr key={activity.id} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getTypeColor(activity.type)}`}>
                                            <span>{getTypeEmoji(activity.type)}</span>
                                            {activity.type}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-charcoal">{activity.action}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs text-gray-500 font-medium">{activity.details}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <p className="text-[10px] font-black text-charcoal uppercase tracking-widest">
                                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {new Date(activity.timestamp).toLocaleDateString()}
                                        </p>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No matching activities found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
