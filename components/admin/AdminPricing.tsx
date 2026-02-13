import React, { useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { PricingRule, Room } from '../../types';
import { formatPrice } from '../../utils/formatters';

export const AdminPricing: React.FC = () => {
    const { config, rooms, addPricingRule, deletePricingRule } = useSite();
    const rules = config.pricingRules || [];
    const [isCreating, setIsCreating] = useState(false);
    const [newRule, setNewRule] = useState<Omit<PricingRule, 'id' | 'isActive'>>({
        name: '',
        type: 'seasonal',
        adjustmentType: 'percentage',
        value: 10,
        startDate: '',
        endDate: '',
        daysOfWeek: [],
        roomCategories: ['all'],
        priority: 0
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        addPricingRule({
            ...newRule,
            isActive: true
        });
        setIsCreating(false);
        setNewRule({
            name: '',
            type: 'seasonal',
            adjustmentType: 'percentage',
            value: 10,
            startDate: '',
            endDate: '',
            daysOfWeek: [],
            roomCategories: ['all'],
            priority: 0
        });
    };

    const toggleDay = (day: number) => {
        setNewRule(prev => {
            const days = prev.daysOfWeek || [];
            if (days.includes(day)) {
                return { ...prev, daysOfWeek: days.filter(d => d !== day) };
            } else {
                return { ...prev, daysOfWeek: [...days, day] };
            }
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'seasonal': return '📅';
            case 'weekend': return '🎉';
            case 'long-stay': return '⏳';
            case 'last-minute': return '⚡';
            default: return '🏷️';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black font-serif text-charcoal mb-2">Dynamic Pricing</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue Optimization Engine</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-gold text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#C5A059] transition-all shadow-xl shadow-gold/20 flex items-center gap-2"
                >
                    <span className="text-lg">+</span> New Rule
                </button>
            </div>

            {/* Active Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rules.map(rule => (
                    <div key={rule.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${rule.value > 0 ? 'from-green-50' : 'from-red-50'} to-transparent rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shadow-inner">
                                    {getTypeIcon(rule.type)}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => deletePricingRule(rule.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>

                            <h4 className="text-lg font-black text-charcoal mb-2">{rule.name}</h4>

                            <div className="flex items-center gap-2 mb-4">
                                <span className={`text-xl font-black ${rule.value > 0 ? 'text-green-500' : 'text-gold'}`}>
                                    {rule.value > 0 ? '+' : ''}{rule.value}{rule.adjustmentType === 'percentage' ? '%' : ''}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adjustment</span>
                            </div>

                            <div className="space-y-2">
                                {rule.type === 'seasonal' && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>🗓️</span>
                                        <span>{new Date(rule.startDate!).toLocaleDateString()} - {new Date(rule.endDate!).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {rule.type === 'weekend' && rule.daysOfWeek && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>📅</span>
                                        <span>{rule.daysOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</span>
                                    </div>
                                )}
                                {rule.type === 'long-stay' && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>🌑</span>
                                        <span>Min {rule.minNights} nights</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Rule Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/90 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-serif font-black text-charcoal">Define Pricing Strategy</h3>
                            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-charcoal transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Rule Name</label>
                                    <input required type="text" value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-bold text-charcoal" placeholder="e.g. December Peak Season" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Rule Type</label>
                                    <select value={newRule.type} onChange={e => setNewRule({ ...newRule, type: e.target.value as any })} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all appearance-none cursor-pointer font-bold text-charcoal">
                                        <option value="seasonal">Seasonal Range</option>
                                        <option value="weekend">Weekly Recurring</option>
                                        <option value="long-stay">Long Stay Discount</option>
                                        <option value="last-minute">Last Minute Deal</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Adjustment</label>
                                    <div className="flex gap-2">
                                        <select value={newRule.adjustmentType} onChange={e => setNewRule({ ...newRule, adjustmentType: e.target.value as any })} className="bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all appearance-none cursor-pointer font-bold text-[10px] uppercase">
                                            <option value="percentage">%</option>
                                            <option value="fixed_amount">$</option>
                                        </select>
                                        <input required type="number" value={newRule.value} onChange={e => setNewRule({ ...newRule, value: Number(e.target.value) })} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-bold text-charcoal" placeholder="10" />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 ml-1">Use negative values for discounts (e.g. -10)</p>
                                </div>

                                {newRule.type === 'seasonal' && (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Start Date</label>
                                            <input required type="date" value={newRule.startDate} onChange={e => setNewRule({ ...newRule, startDate: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">End Date</label>
                                            <input required type="date" value={newRule.endDate} onChange={e => setNewRule({ ...newRule, endDate: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all" />
                                        </div>
                                    </>
                                )}

                                {newRule.type === 'weekend' && (
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Active Days</label>
                                        <div className="flex gap-2">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => toggleDay(i)}
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all ${newRule.daysOfWeek?.includes(i) ? 'bg-gold text-white shadow-lg shadow-gold/20 scale-110' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'}`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {newRule.type === 'long-stay' && (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Min. Nights</label>
                                        <input required type="number" min="2" value={newRule.minNights || 3} onChange={e => setNewRule({ ...newRule, minNights: Number(e.target.value) })} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all font-bold text-charcoal" />
                                    </div>
                                )}

                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Applied Categories</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setNewRule({ ...newRule, roomCategories: ['all'] })}
                                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${newRule.roomCategories?.includes('all') ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-gray-400 border-gray-200'}`}
                                        >
                                            All Rooms
                                        </button>
                                        {config.categories.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => {
                                                    const current = newRule.roomCategories?.filter(c => c !== 'all') || [];
                                                    if (current.includes(cat)) {
                                                        setNewRule({ ...newRule, roomCategories: current.filter(c => c !== cat).length ? current.filter(c => c !== cat) : ['all'] });
                                                    } else {
                                                        setNewRule({ ...newRule, roomCategories: [...current, cat] });
                                                    }
                                                }}
                                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${newRule.roomCategories?.includes(cat) ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-gray-400 border-gray-200'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50 flex gap-4">
                                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-gold text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#C5A059] transition-colors shadow-lg shadow-gold/20">Create Rule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
