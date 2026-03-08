import React, { useMemo, useState } from 'react';
import { useSite } from '../../context/SiteContext';
import { Room } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { useConfirmation } from '../../context/ConfirmationContext';
import { AdminRoomDetailModal } from './modals/AdminRoomDetailModal';
import { BulkActionBar } from './BulkActionBar';
import { Highlighter } from './Highlighter';

interface AdminRoomsProps {
    onEditRoom: (room: Room) => void;
    onOpenAddRoom: () => void;
}

export const AdminRooms: React.FC<AdminRoomsProps> = ({ onEditRoom, onOpenAddRoom }) => {
    const { rooms, updateRoom, deleteRoom, config, bookings } = useSite();
    const confirm = useConfirmation();

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Filtering State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<string>('newest');
    const [selectedRoomDetail, setSelectedRoomDetail] = useState<Room | null>(null);

    const handleToggleSelectAll = () => {
        if (selectedIds.length === filteredRooms.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredRooms.map(r => r.id));
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        const confirmed = await confirm({
            title: `Delete ${selectedIds.length} Rooms ? `,
            message: 'This will permanently remove all selected rooms. This action cannot be undone.',
            confirmText: `Delete ${selectedIds.length} Rooms`,
            type: 'danger'
        });

        if (confirmed) {
            for (const id of selectedIds) {
                await deleteRoom(id);
            }
            setSelectedIds([]);
        }
    };

    const handleBulkExport = () => {
        const selectedRooms = rooms.filter(r => selectedIds.includes(r.id));
        const blob = new Blob([JSON.stringify(selectedRooms, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rooms_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleBulkStatusUpdate = async (status: Room['status']) => {
        for (const id of selectedIds) {
            await updateRoom(id, { status });
        }
        setSelectedIds([]);
    };

    const handleToggleBestSeller = async (id: string, current: boolean) => {
        await updateRoom(id, { isBestSeller: !current });
    };

    const handleToggleElite = async (id: string, current: boolean) => {
        await updateRoom(id, { isElite: !current });
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: 'Delete Room?',
            message: 'Are you sure you want to delete this room? This cannot be undone.',
            confirmText: 'Delete',
            type: 'danger'
        });

        if (confirmed) {
            await deleteRoom(id);
        }
    };

    // Filter Logic
    const filteredRooms = useMemo(() => {
        return rooms.filter(room => {
            const matchesSearch =
                room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (room.roomCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.category.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === 'all' || room.category === selectedCategory;

            const todayStr = new Date().toISOString().split('T')[0];
            const isOccupied = bookings.some(b =>
                b.roomId === room.id &&
                b.isoCheckIn <= todayStr &&
                b.isoCheckOut > todayStr &&
                b.status !== 'cancelled'
            );

            const currentStatus = room.status || (isOccupied ? 'occupied' : 'available');
            const matchesStatus = selectedStatus === 'all' || currentStatus === selectedStatus;

            const matchesTags = selectedTags.length === 0 ||
                selectedTags.every(tag => (room.tags || []).includes(tag));

            return matchesSearch && matchesCategory && matchesStatus && matchesTags;
        }).sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'category-asc': return a.category.localeCompare(b.category);
                case 'rating-desc': return b.rating - a.rating;
                default: return 0; // 'newest' or default
            }
        });
    }, [rooms, searchQuery, selectedCategory, selectedStatus, selectedTags, bookings, sortBy]);

    // Calculate financial metrics for each room
    const roomMetrics = useMemo(() => {
        const metrics = new Map();

        filteredRooms.forEach(room => {
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
    }, [filteredRooms, bookings]);

    return (
        <div className="space-y-8 animate-fade-in pb-32">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div>
                    <h3 className="text-xl font-black font-serif text-charcoal">Inventory Management</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your {rooms.length} digital twin quarters</p>
                </div>
                <div className="flex items-center gap-4">
                    {filteredRooms.length > 0 && (
                        <button
                            onClick={handleToggleSelectAll}
                            className="bg-gray-50 text-charcoal font-black px-6 py-4 rounded-xl hover:bg-gray-100 transition-all uppercase tracking-widest text-[10px] flex items-center gap-3 cursor-pointer"
                        >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedIds.length === filteredRooms.length ? 'bg-gold border-gold' : 'border-gray-200 bg-white'}`}>
                                {selectedIds.length === filteredRooms.length && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                )}
                            </div>
                            {selectedIds.length === filteredRooms.length ? 'Deselect All' : 'Select All'}
                        </button>
                    )}
                    <button
                        onClick={onOpenAddRoom}
                        className="bg-charcoal text-white font-black px-8 py-4 rounded-xl hover:bg-gold transition-all shadow-xl shadow-charcoal/10 uppercase tracking-widest text-xs flex items-center gap-3 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        Add New Room
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search rooms by name or code..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border-gray-100 rounded-xl px-10 py-3 text-xs font-bold focus:ring-gold focus:border-gold"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <div className="flex flex-wrap gap-2">
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:ring-gold focus:border-gold"
                    >
                        <option value="all">All Categories</option>
                        {Array.from(new Set(rooms.map(r => r.category))).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={e => setSelectedStatus(e.target.value)}
                        className="bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:ring-gold focus:border-gold"
                    >
                        <option value="all">Any Status</option>
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="maintenance">Maintenance</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:ring-gold focus:border-gold"
                    >
                        <option value="newest">Newest First</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name-asc">Name: A-Z</option>
                        <option value="category-asc">Category: A-Z</option>
                        <option value="rating-desc">Rating: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Financial Breakdown Cards */}
            <div className="bg-gradient-to-br from-charcoal via-charcoal to-primary/20 p-10 rounded-[2.5rem] shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-8 bg-gold rounded-full" />
                    <div>
                        <h3 className="text-2xl font-black font-serif text-white">Financial Performance</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gold mt-1">
                            Revenue breakdown for {filteredRooms.length} rooms
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRooms.map((room) => {
                        const metrics = roomMetrics.get(room.id) || { totalRevenue: 0, bookingCount: 0, avgBookingValue: 0, occupancyRate: 0 };
                        return (
                            <div key={room.id} className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 group hover:bg-white/10 transition-all">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                    <Highlighter text={room.category} search={searchQuery} />
                                </p>
                                <h4 className="text-lg font-bold text-white mb-4">
                                    <Highlighter text={room.name} search={searchQuery} />
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Revenue</p>
                                            <p className="text-xl font-black text-gold">{formatPrice(metrics.totalRevenue, config.currency)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Bookings</p>
                                            <p className="text-lg font-black text-white">{metrics.bookingCount}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-gray-400">Occupancy</span>
                                            <span className="text-white">{metrics.occupancyRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gold transition-all duration-1000"
                                                style={{ width: `${metrics.occupancyRate}% ` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredRooms.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-white/40 font-black uppercase tracking-[0.2em] text-sm">No rooms match your filters</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Room Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRooms.map((room) => (
                    <div key={room.id} className={`group bg-white rounded-[2.5rem] overflow-hidden border transition-all duration-500 flex flex-col hover:-translate-y-2 relative ${selectedIds.includes(room.id) ? 'border-gold ring-4 ring-gold/10' : 'border-gray-100 shadow-sm hover:shadow-2xl'}`}>
                        {/* Checkbox Overlay */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSelect(room.id);
                            }}
                            className={`absolute top-6 left-6 z-20 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${selectedIds.includes(room.id) ? 'bg-gold border-gold scale-110' : 'bg-black/20 border-white/40 hover:border-white'}`}
                        >
                            {selectedIds.includes(room.id) && (
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            )}
                        </div>

                        <div className="aspect-[16/10] relative overflow-hidden">
                            <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                            <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                                {(() => {
                                    const todayStr = new Date().toISOString().split('T')[0];

                                    // 1. Check for manual status (Cleaning/Maintenance)
                                    if (room.status === 'maintenance') {
                                        return (
                                            <div className="bg-red-500 text-white px-3 py-1.5 rounded-xl shadow-xl flex flex-col items-end">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Maintenance</span>
                                                </div>
                                                <span className="text-[8px] font-bold text-white/80 uppercase mt-0.5">Out of Service</span>
                                            </div>
                                        );
                                    }

                                    if (room.status === 'cleaning') {
                                        return (
                                            <div className="bg-amber-500 text-white px-3 py-1.5 rounded-xl shadow-xl flex flex-col items-end">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Cleaning</span>
                                                </div>
                                                <span className="text-[8px] font-bold text-white/80 uppercase mt-0.5">Quick Refresh</span>
                                            </div>
                                        );
                                    }

                                    // 2. Check for active booking
                                    const activeBooking = bookings.find(b =>
                                        b.roomId === room.id &&
                                        b.isoCheckIn <= todayStr &&
                                        b.isoCheckOut > todayStr &&
                                        b.status !== 'cancelled'
                                    );

                                    if (activeBooking) {
                                        const isArrived = activeBooking.status === 'arrived';
                                        return (
                                            <div className={`bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl border shadow-xl flex flex-col items-end ${isArrived ? 'border-primary/30 animate-none' : 'border-red-100 animate-pulse'}`}>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isArrived ? 'bg-primary' : 'bg-red-500'}`} />
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isArrived ? 'text-primary' : 'text-red-500'}`}>
                                                        {isArrived ? 'In-House' : 'Occupied'}
                                                    </span>
                                                </div>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Until {activeBooking.isoCheckOut}</span>
                                            </div>
                                        );
                                    }

                                    // 3. Fallback to available
                                    const nextBooking = bookings
                                        .filter(b => b.roomId === room.id && b.isoCheckIn > todayStr && b.status !== 'cancelled')
                                        .sort((a, b) => a.isoCheckIn.localeCompare(b.isoCheckIn))[0];

                                    return (
                                        <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl border border-emerald-100 shadow-xl flex flex-col items-end">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Available</span>
                                            </div>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">
                                                {nextBooking ? `Next: ${nextBooking.isoCheckIn} ` : 'No upcoming stays'}
                                            </span>
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-1">
                                    <Highlighter text={room.category} search={searchQuery} />
                                </p>
                                <h4 className="text-xl font-black text-white font-serif">
                                    <Highlighter text={room.name} search={searchQuery} />
                                </h4>
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
                                    className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${room.isBestSeller ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-gray-50 border-transparent text-gray-400 hover:text-charcoal hover:bg-gray-100'}`}
                                >
                                    {room.isBestSeller ? 'Remove Popular' : 'Set Popular'}
                                </button>
                                <button
                                    onClick={() => handleToggleElite(room.id, room.isElite || false)}
                                    className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${room.isElite ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-gray-50 border-transparent text-gray-400 hover:text-charcoal hover:bg-gray-100'}`}
                                >
                                    {room.isElite ? 'Remove Pick' : 'Set Pick'}
                                </button>
                            </div>

                            <div className="mt-auto flex gap-3 pt-6 border-t border-gray-50">
                                <button
                                    onClick={() => onEditRoom(room)}
                                    className="flex-1 bg-gray-50 text-charcoal font-black py-4 rounded-xl hover:bg-gray-100 transition-all uppercase tracking-widest text-[10px] border border-transparent hover:border-gray-200 cursor-pointer"
                                >
                                    Edit Unit
                                </button>
                                <button
                                    onClick={() => handleDelete(room.id)}
                                    className="px-5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100/50 cursor-pointer"
                                    title="Delete Room"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                                <button
                                    onClick={() => setSelectedRoomDetail(room)}
                                    className="px-5 bg-gold/10 text-gold rounded-xl hover:bg-gold hover:text-white transition-all border border-gold/20 cursor-pointer"
                                    title="View Detailed Analysis"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredRooms.length === 0 && (
                    <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h4 className="text-xl font-black font-serif text-charcoal mb-2">Inventory Empty</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No rooms match your current search or filter criteria</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                                setSelectedStatus('all');
                                setSelectedTags([]);
                            }}
                            className="mt-8 text-gold font-black uppercase tracking-widest text-[10px] hover:text-charcoal transition-colors border-b border-gold/30 cursor-pointer"
                        >
                            Reset all filters
                        </button>
                    </div>
                )}
            </div>

            <BulkActionBar
                selectedCount={selectedIds.length}
                onClear={() => setSelectedIds([])}
                actions={[
                    {
                        label: 'Export JSON',
                        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
                        onClick: handleBulkExport
                    },
                    {
                        label: 'Mark Available',
                        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
                        onClick: () => handleBulkStatusUpdate('available'),
                        variant: 'success'
                    },
                    {
                        label: 'Maintenance',
                        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
                        onClick: () => handleBulkStatusUpdate('maintenance')
                    },
                    {
                        label: 'Delete Selected',
                        icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
                        onClick: handleBulkDelete,
                        variant: 'danger'
                    }
                ]}
            />

            {selectedRoomDetail && (
                <AdminRoomDetailModal
                    room={selectedRoomDetail}
                    bookings={bookings}
                    config={config}
                    onClose={() => setSelectedRoomDetail(null)}
                />
            )}
        </div>
    );
};
