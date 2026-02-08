import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSite } from '../context/SiteContext';
import { Room, NavLink, HeroSlide, AmenityDetail, Booking } from '../types';
import { GoogleGenAI } from "@google/genai";
import { formatLuxuryText } from '../utils/formatters';
import { db, auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import ImageUpload from '../components/ImageUpload';

type Tab = 'overview' | 'bookings' | 'branding' | 'home' | 'pages' | 'navigation' | 'rooms' | 'amenities' | 'concierge' | 'footer' | 'newsletter' | 'settings';

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
        {/* Grid Lines */}
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

        {/* Area Fill */}
        <path d={areaPath} fill="url(#revenueGradient)" opacity="0.1" />
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B008B" />
            <stop offset="100%" stopColor="#8B008B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Main Line */}
        <path d={linePath} fill="none" stroke="#8B008B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data Points */}
        {points.map((p, i) => (
          <g key={i} className="group/point">
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#8B008B" strokeWidth="2" />
            <rect
              x={p.x - 1}
              y={p.y - 100}
              width="2"
              height="100"
              fill="#8B008B"
              opacity="0"
              className="group-hover/point:opacity-20 transition-opacity"
            />
          </g>
        ))}

        {/* X-Axis Labels (Only a few) */}
        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0 || i === data.length - 1).map((d, i) => {
          const p = points[data.indexOf(d)];
          return (
            <text
              key={i}
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              className="text-[8px] font-black uppercase tracking-widest fill-gray-400"
            >
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
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-sm bg-gray-100" />
          <span className="text-[8px] font-bold text-gray-500 uppercase">Empty</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-sm bg-gold/30" />
          <span className="text-[8px] font-bold text-gray-500 uppercase">Light</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 rounded-sm bg-gold" />
          <span className="text-[8px] font-bold text-gray-500 uppercase">Dense</span>
        </div>
      </div>
    </div>
  );
};

const Admin: React.FC = () => {
  const { rooms, config, updateConfig, updateRooms, loading } = useSite();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [editingNav, setEditingNav] = useState<NavLink | null>(null);
  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null);
  const [editingAmenity, setEditingAmenity] = useState<{ name: string, detail: AmenityDetail } | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState('all');
  const [bookingDateFilter, setBookingDateFilter] = useState('all');
  const [bookingStartDate, setBookingStartDate] = useState('');
  const [bookingEndDate, setBookingEndDate] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [revenueDateFilter, setRevenueDateFilter] = useState<'7d' | '30d' | '90d'>('7d');
  const [editingAboutPage, setEditingAboutPage] = useState<boolean>(false);
  const [editingContactPage, setEditingContactPage] = useState<boolean>(false);

  // Drag and Drop System
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Use a ghost image or just the transparent background
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (type: 'hero' | 'nav', targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    if (type === 'hero') {
      const newSlides = [...config.heroSlides];
      const [removed] = newSlides.splice(draggedIndex, 1);
      newSlides.splice(targetIndex, 0, removed);
      updateConfig({ ...config, heroSlides: newSlides });
      showToast('Hero slides reordered');
    } else {
      const newLinks = [...config.navLinks];
      const [removed] = newLinks.splice(draggedIndex, 1);
      newLinks.splice(targetIndex, 0, removed);
      updateConfig({ ...config, navLinks: newLinks });
      showToast('Navigation links reordered');
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

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

  const handleExportCSV = useCallback(() => {
    if (selectedBookings.length === 0) return;

    const bookingsToExport = config.bookings.filter(b => selectedBookings.includes(b.id));
    const headers = ['ID', 'Guest Name', 'Guest Email', 'Room Name', 'Nights', 'Total Price', 'Date'];
    const csvRows = [
      headers.join(','),
      ...bookingsToExport.map(b => [
        b.id,
        `"${b.guestName}"`,
        b.guestEmail,
        `"${b.roomName}"`,
        b.nights,
        b.totalPrice,
        new Date(b.date).toLocaleDateString()
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Exported ${selectedBookings.length} bookings to CSV`);
  }, [selectedBookings, config.bookings]);

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quarters_config_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Configuration backup exported');
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedConfig = JSON.parse(event.target?.result as string);
        updateConfig(importedConfig);
        showToast('Configuration imported successfully', 'success');
      } catch (err) {
        showToast('Invalid configuration file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveHero = () => {
    if (!editingHero) return;
    const existingIndex = config.heroSlides.findIndex(s => s.id === editingHero.id);
    let newSlides = [...config.heroSlides];
    if (existingIndex > -1) newSlides[existingIndex] = editingHero;
    else newSlides.push(editingHero);
    updateConfig({ ...config, heroSlides: newSlides });
    setEditingHero(null);
    showToast('Hero slide saved!');
  };



  // Toast Notification System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({ message: '', type: 'success', visible: false });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  // Global Search System
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    const q = globalSearchQuery.toLowerCase();
    const results: { type: 'room' | 'booking' | 'subscriber' | 'tab'; title: string; subtitle: string; action: () => void }[] = [];

    // Search rooms
    rooms.forEach(room => {
      if (room.name.toLowerCase().includes(q) || room.category.toLowerCase().includes(q)) {
        results.push({
          type: 'room',
          title: room.name,
          subtitle: `${room.category} • $${room.price}/night`,
          action: () => { setActiveTab('rooms'); setEditingRoom(room); setShowGlobalSearch(false); }
        });
      }
    });

    // Search bookings
    config.bookings.forEach(booking => {
      if (booking.guestName.toLowerCase().includes(q) || booking.guestEmail.toLowerCase().includes(q) || booking.roomName.toLowerCase().includes(q)) {
        results.push({
          type: 'booking',
          title: booking.guestName,
          subtitle: `${booking.roomName} • ${new Date(booking.date).toLocaleDateString()}`,
          action: () => { setActiveTab('bookings'); setViewingBooking(booking); setShowGlobalSearch(false); }
        });
      }
    });

    // Search subscribers
    config.subscribers?.forEach(sub => {
      if (sub.email.toLowerCase().includes(q)) {
        results.push({
          type: 'subscriber',
          title: sub.email,
          subtitle: `Subscribed ${new Date(sub.subscribedAt).toLocaleDateString()}`,
          action: () => { setActiveTab('newsletter'); setShowGlobalSearch(false); }
        });
      }
    });

    // Search tabs
    const tabs: Tab[] = ['overview', 'bookings', 'branding', 'home', 'pages', 'navigation', 'rooms', 'amenities', 'concierge', 'footer', 'newsletter'];
    tabs.forEach(tab => {
      if (tab.includes(q)) {
        results.push({
          type: 'tab',
          title: tab.charAt(0).toUpperCase() + tab.slice(1),
          subtitle: 'Navigate to tab',
          action: () => { setActiveTab(tab); setShowGlobalSearch(false); }
        });
      }
    });

    return results.slice(0, 8); // Limit results
  }, [globalSearchQuery, rooms, config.bookings, config.subscribers]);

  // Keyboard shortcut for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(prev => !prev);
        setGlobalSearchQuery('');
      }
      if (e.key === 'Escape' && showGlobalSearch) {
        setShowGlobalSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGlobalSearch]);

  // Business Intelligence Calculation
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

    return {
      totalPotentialValue,
      realizedRevenue,
      categoryStats,
    };
  }, [rooms, config.categories, config.bookings]);

  const filteredBookings = useMemo(() => {
    return config.bookings.filter(b => {
      const searchLower = bookingSearch.toLowerCase();
      const matchesSearch = b.guestName.toLowerCase().includes(searchLower) ||
        b.guestEmail.toLowerCase().includes(searchLower) ||
        b.id.toLowerCase().includes(searchLower);

      const matchesCategory = bookingCategoryFilter === 'all' ||
        rooms.find(r => r.id === b.roomId)?.category === bookingCategoryFilter;

      const bookingDate = new Date(b.date);
      const now = new Date();
      let matchesDate = true;

      if (bookingDateFilter === 'custom' && bookingStartDate && bookingEndDate) {
        const start = new Date(bookingStartDate);
        const end = new Date(bookingEndDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = bookingDate >= start && bookingDate <= end;
      } else if (bookingDateFilter === '7d') {
        matchesDate = (now.getTime() - bookingDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      } else if (bookingDateFilter === '30d') {
        matchesDate = (now.getTime() - bookingDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      } else if (bookingDateFilter === '90d') {
        matchesDate = (now.getTime() - bookingDate.getTime()) <= 90 * 24 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [config.bookings, bookingSearch, bookingCategoryFilter, bookingDateFilter, rooms]);

  const stats = [
    { label: 'Realized Revenue', value: `GH₵${financialData.realizedRevenue.toLocaleString()}`, sub: 'Settled Ledger', growth: '+15.2%', icon: '💰', trend: [30, 45, 35, 60, 55, 80, 75], color: '#8B008B' },
    { label: 'Portfolio Value', value: `GH₵${financialData.totalPotentialValue.toLocaleString()}`, sub: 'Nightly Cap', growth: '+12.5%', icon: '🏢', trend: [20, 30, 45, 40, 55, 50, 65], color: '#8B008B' },
    { label: 'Subscribers', value: config.newsletterSubscribers.length.toString(), sub: 'Active Audience', growth: '+5.2%', icon: '📧', trend: [10, 15, 12, 20, 25, 30, 35], color: '#10b981' },
    { label: 'Guest Sentiment', value: '4.92', sub: 'Avg Rating', growth: 'Stable', icon: '⭐', trend: [4.8, 4.9, 4.85, 4.9, 4.92, 4.91, 4.92], color: '#f59e0b' },
  ];

  const handleAiWriter = async (field: 'description' | 'hero' | 'tagline', context: string) => {
    setIsAiGenerating(true);
    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a luxury branding expert for C1002 Quarters, Accra's finest hotel. Current voice: "${config.brand.voice}". Write a professional ${field} for: "${context}".
      
      IMPORTANT FORMATTING RULES:
      1. Use *text* for italics (e.g., *this is italic*).
      2. Use newlines (\n) for line breaks.
      3. DO NOT use any HTML tags like <span> or <br />.`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      // The GenerateContentResponse object features a text property (not a method) that directly returns the string output.
      const textResult = (response.text || "").replace(/^"(.*)"$/, '$1');
      if (field === 'description' && editingRoom) setEditingRoom({ ...editingRoom, description: textResult });
      else if (field === 'tagline') updateConfig({ ...config, brand: { ...config.brand, tagline: textResult } });
    } catch (e) { console.error(e); } finally { setIsAiGenerating(false); }
  };

  const handleSaveRoom = () => {
    if (!editingRoom || !editingRoom.id) return;
    const existingIndex = rooms.findIndex(r => r.id === editingRoom.id);
    let newRooms = [...rooms];
    if (existingIndex > -1) newRooms[existingIndex] = editingRoom as Room;
    else newRooms.push(editingRoom as Room);
    updateRooms(newRooms);
    setEditingRoom(null);
    showToast('Room saved successfully!');
  };

  const handleSaveNav = () => {
    if (!editingNav) return;
    const existingIndex = config.navLinks.findIndex(l => l.id === editingNav.id);
    let newLinks = [...config.navLinks];
    if (existingIndex > -1) newLinks[existingIndex] = editingNav;
    else newLinks.push(editingNav);
    updateConfig({ ...config, navLinks: newLinks });
    setEditingNav(null);
    showToast('Navigation link saved!');
  };

  const handleSaveAmenity = () => {
    if (!editingAmenity) return;
    const newDetails = { ...config.amenityDetails, [editingAmenity.name]: editingAmenity.detail };
    updateConfig({ ...config, amenityDetails: newDetails });
    setEditingAmenity(null);
    showToast('Amenity details updated!');
  };



  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 md:sticky md:top-0 md:h-screen bg-charcoal text-white p-8 flex flex-col gap-2 shrink-0 border-r border-white/5 overflow-y-auto no-scrollbar">
        <div className="mb-10">
          <h2 className="text-2xl font-serif italic text-gold">{config.brand.name}</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">HQ Command Node</p>
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
          {(['overview', 'bookings', 'branding', 'home', 'pages', 'navigation', 'rooms', 'amenities', 'concierge', 'footer', 'newsletter', 'settings'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between group ${activeTab === tab ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'hover:bg-white/5 text-gray-400'
                }`}
            >
              <span className="capitalize">{tab}</span>
            </button>
          ))}

          <div className="mt-8 border-t border-white/10 pt-8">
            <button
              onClick={() => signOut(auth)}
              className="w-full text-left px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-white/5 hover:text-red-300 transition-all flex items-center gap-3"
            >
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 bg-background-light md:h-screen md:overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-gold font-black text-[10px] uppercase tracking-[0.4em] mb-3">System / {activeTab}</p>
              <h1 className="text-5xl font-black font-serif text-charcoal capitalize">{activeTab} Hub</h1>
            </div>
            {activeTab === 'amenities' && (
              <button
                onClick={() => setEditingAmenity({ name: '', detail: { icon: 'star', description: '', category: 'General' } })}
                className="bg-primary text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#6B006B] transition-all shadow-xl shadow-primary/20"
              >
                + Register Amenity
              </button>
            )}
          </header>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
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
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Financial Performance Chart */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  {/* Daily Revenue Chart */}
                  <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8">
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

                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-6 bg-gold rounded-full" />
                      <h3 className="text-2xl font-black font-serif text-charcoal">Inventory Yield</h3>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gold" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Potential</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-charcoal" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Realized</span>
                      </div>
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
                            <div
                              style={{ height: `${potHeight}%` }}
                              className="w-4 bg-gold/10 rounded-t-lg transition-all group-hover:bg-gold/20"
                            />
                            <div
                              style={{ height: `${realHeight}%` }}
                              className="w-4 bg-charcoal rounded-t-lg transition-all group-hover:bg-gold"
                            />
                            {/* Value Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                              GH₵{realizedForCat.toLocaleString()}
                            </div>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Booking Calendar Widget */}
                <div className="bg-charcoal p-10 rounded-[2.5rem] shadow-xl shadow-charcoal/20 relative overflow-hidden flex flex-col">
                  <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-1.5 h-6 bg-gold rounded-full" />
                      <h3 className="text-2xl font-black font-serif text-white">Occupancy Pulse</h3>
                    </div>
                    <BookingCalendar bookings={config.bookings} />
                  </div>
                </div>

                {/* Top Categories Card */}
                <div className="bg-charcoal p-10 rounded-[2.5rem] shadow-xl shadow-charcoal/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full pointer-events-none" />
                  <div className="relative z-10">
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
                            <div
                              style={{ width: `${stat.percent}%` }}
                              className="h-full bg-gold rounded-full transition-all duration-1000"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-12 pt-8 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Total Inventory Value</p>
                      <p className="text-4xl font-black text-white">GH₵{financialData.totalPotentialValue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Reservations Feed */}
              <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-charcoal rounded-full" />
                    <h3 className="text-2xl font-black font-serif text-charcoal">Pulse Activity Feed</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-[10px] font-black uppercase text-gold hover:underline tracking-widest"
                  >
                    Enter Command Center
                  </button>
                </div>
                <div className="space-y-4">
                  {config.bookings.slice(0, 3).map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-gold/30 transition-all">
                      <div className="flex items-center gap-8">
                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl shadow-sm">
                          👤
                        </div>
                        <div>
                          <p className="text-sm font-black text-charcoal">{booking.guestName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{booking.roomName} • {new Date(booking.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-charcoal">GH₵{booking.totalPrice.toLocaleString()}</p>
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1">Confirmed Node</p>
                      </div>
                    </div>
                  ))}
                  {config.bookings.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-gray-400 italic font-serif">Awaiting the first signal of commerce...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm animate-fade-in text-charcoal">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-gold rounded-full" />
                  <h3 className="text-2xl font-black font-serif">Global Reservations</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
                    <span className="text-[9px] font-black uppercase text-gold">Track</span>
                    <input
                      type="text"
                      placeholder="Search Guest / ID..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="bg-transparent text-sm focus:outline-none min-w-[200px] font-bold"
                    />
                  </div>
                  <select
                    value={bookingCategoryFilter}
                    onChange={(e) => setBookingCategoryFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-gold outline-none hover:bg-gray-100 transition-colors"
                  >
                    <option value="all">All Tiers</option>
                    {config.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>

                  {/* Enhanced Date Filter with Range Picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                      className={`bg-gray-50 border ${bookingDateFilter === 'custom' ? 'border-gold' : 'border-gray-100'} rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-gold outline-none hover:bg-gray-100 transition-all flex items-center gap-2`}
                    >
                      <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {bookingDateFilter === 'all' && 'Any Timestamp'}
                      {bookingDateFilter === '7d' && 'Last 7 Days'}
                      {bookingDateFilter === '30d' && 'Last 30 Days'}
                      {bookingDateFilter === '90d' && 'Last 90 Days'}
                      {bookingDateFilter === 'custom' && (bookingStartDate && bookingEndDate ? `${new Date(bookingStartDate).toLocaleDateString()} - ${new Date(bookingEndDate).toLocaleDateString()}` : 'Custom Range')}
                      <svg className={`w-3 h-3 transition-transform ${showDateRangePicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showDateRangePicker && (
                      <div className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 z-50 min-w-[320px] animate-fade-in">
                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gold">Quick Filters</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: 'all', label: 'All Time' },
                              { value: '7d', label: 'Last 7 Days' },
                              { value: '30d', label: 'Last 30 Days' },
                              { value: '90d', label: 'Last 90 Days' },
                            ].map(option => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setBookingDateFilter(option.value);
                                  if (option.value !== 'custom') {
                                    setShowDateRangePicker(false);
                                    setBookingStartDate('');
                                    setBookingEndDate('');
                                  }
                                }}
                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${bookingDateFilter === option.value ? 'bg-gold text-white' : 'bg-gray-50 text-charcoal hover:bg-gray-100'}`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>

                          <div className="border-t border-gray-100 pt-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-3">Custom Range</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">From</label>
                                <input
                                  type="date"
                                  value={bookingStartDate}
                                  onChange={(e) => {
                                    setBookingStartDate(e.target.value);
                                    setBookingDateFilter('custom');
                                  }}
                                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-gold transition-colors"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">To</label>
                                <input
                                  type="date"
                                  value={bookingEndDate}
                                  onChange={(e) => {
                                    setBookingEndDate(e.target.value);
                                    setBookingDateFilter('custom');
                                  }}
                                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-gold transition-colors"
                                />
                              </div>
                            </div>
                            {bookingStartDate && bookingEndDate && (
                              <button
                                onClick={() => setShowDateRangePicker(false)}
                                className="w-full mt-4 bg-charcoal text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold transition-all"
                              >
                                Apply Range
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(bookingSearch || bookingCategoryFilter !== 'all' || bookingDateFilter !== 'all') && (
                <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Active Filters:</span>
                  {bookingSearch && (
                    <span className="bg-gold/10 text-gold px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                      Search: "{bookingSearch}"
                      <button onClick={() => setBookingSearch('')} className="hover:text-charcoal transition-colors">×</button>
                    </span>
                  )}
                  {bookingCategoryFilter !== 'all' && (
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                      {bookingCategoryFilter}
                      <button onClick={() => setBookingCategoryFilter('all')} className="hover:text-charcoal transition-colors">×</button>
                    </span>
                  )}
                  {bookingDateFilter !== 'all' && (
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                      {bookingDateFilter === 'custom' ? 'Custom Range' : `Last ${bookingDateFilter.replace('d', ' Days')}`}
                      <button onClick={() => { setBookingDateFilter('all'); setBookingStartDate(''); setBookingEndDate(''); }} className="hover:text-charcoal transition-colors">×</button>
                    </span>
                  )}
                  <button
                    onClick={() => { setBookingSearch(''); setBookingCategoryFilter('all'); setBookingDateFilter('all'); setBookingStartDate(''); setBookingEndDate(''); }}
                    className="text-[10px] font-black uppercase text-gray-400 hover:text-charcoal transition-colors ml-auto"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Bulk Actions Toolbar */}
              {selectedBookings.length > 0 && (
                <div className="mb-6 flex items-center justify-between bg-gold/10 border border-gold/20 p-4 rounded-2xl animate-scale-in">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gold">{selectedBookings.length} Selected</span>

                    <div className="flex bg-white rounded-xl border border-gold/20 overflow-hidden">
                      <select
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const newBookings = config.bookings.map(b =>
                            selectedBookings.includes(b.id) ? { ...b, status: e.target.value } : b
                          );
                          updateConfig({ ...config, bookings: newBookings });
                          setSelectedBookings([]);
                          showToast(`Updated ${selectedBookings.length} bookings to ${e.target.value}`);
                        }}
                        className="bg-transparent px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none border-none cursor-pointer hover:bg-gray-50 transition-colors"
                        defaultValue=""
                      >
                        <option value="" disabled>Update Status</option>
                        <option value="confirmed">Confirm</option>
                        <option value="pending">Mark Pending</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    </div>

                    <button
                      onClick={handleExportCSV}
                      className="bg-gold text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-dark transition-all flex items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export CSV
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedBookings([])}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-charcoal transition-colors"
                  >
                    Cancel Selection
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-50">
                      <th className="pb-6">
                        <input
                          type="checkbox"
                          checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedBookings(filteredBookings.map(b => b.id));
                            else setSelectedBookings([]);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                        />
                      </th>
                      <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Guest Details</th>
                      <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Room / Suite</th>
                      <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Financials</th>
                      <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                      <th className="pb-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className={`group hover:bg-gray-50/50 transition-colors ${selectedBookings.includes(booking.id) ? 'bg-gold/5' : ''}`}>
                        <td className="py-6">
                          <input
                            type="checkbox"
                            checked={selectedBookings.includes(booking.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedBookings(prev => [...prev, booking.id]);
                              else setSelectedBookings(prev => prev.filter(id => id !== booking.id));
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                          />
                        </td>
                        <td className="py-6">
                          <div className="font-bold text-charcoal">{booking.guestName}</div>
                          <div className="text-xs text-gray-400">{booking.guestEmail}</div>
                        </td>
                        <td className="py-6">
                          <div className="text-sm font-medium text-charcoal">{booking.roomName}</div>
                          <div className="text-[10px] font-black uppercase text-gold">{booking.nights} Nights</div>
                        </td>
                        <td className="py-6">
                          <div className="text-sm font-black text-charcoal">GH₵{booking.totalPrice.toLocaleString()}</div>
                        </td>
                        <td className="py-6">
                          <div className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()}</div>
                        </td>
                        <td className="py-6 text-right">
                          <button
                            onClick={() => setViewingBooking(booking)}
                            className="text-[10px] font-black uppercase text-primary hover:text-[#6B006B] transition-colors"
                          >
                            View Node
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredBookings.length === 0 && (
                  <div className="py-24 text-center">
                    <p className="text-gray-400 italic font-serif text-xl">No reservations found matching current filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
              {/* Main Branding Controls */}
              <div className="xl:col-span-2 space-y-8">
                {/* Brand Identity Section */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-6 bg-gold rounded-full" />
                    <h3 className="text-2xl font-black font-serif text-charcoal">Brand Identity</h3>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Brand Name</label>
                      <input
                        type="text"
                        value={config.brand.name}
                        onChange={e => updateConfig({ ...config, brand: { ...config.brand, name: e.target.value } })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-lg font-black focus:border-gold outline-none transition-all"
                      />
                    </div>

                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Brand Tagline</label>
                        <input
                          type="text"
                          value={config.brand.tagline}
                          onChange={e => updateConfig({ ...config, brand: { ...config.brand, tagline: e.target.value } })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm font-medium focus:border-gold outline-none transition-all"
                        />
                      </div>
                      <button
                        onClick={() => handleAiWriter('tagline', config.brand.name)}
                        disabled={isAiGenerating}
                        className="h-[58px] px-6 bg-charcoal text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gold transition-all disabled:opacity-50 hover-lift flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {isAiGenerating ? 'Generating...' : 'AI Rewrite'}
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Brand Voice / Persona</label>
                      <select
                        value={config.brand.voice}
                        onChange={e => updateConfig({ ...config, brand: { ...config.brand, voice: e.target.value } })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm font-bold focus:border-gold outline-none transition-all"
                      >
                        <option>Regal & Sophisticated</option>
                        <option>Warm & Welcoming</option>
                        <option>Modern & Avant-Garde</option>
                        <option>Minimalist & Zen</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Color Palette Section */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    <h3 className="text-2xl font-black font-serif text-charcoal">Color Palette</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Primary Color */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-4 block">Primary Signature Color</label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-2xl shadow-lg cursor-pointer relative overflow-hidden color-swatch"
                            style={{ backgroundColor: config.brand.primaryColor }}
                          >
                            <input
                              type="color"
                              value={config.brand.primaryColor}
                              onChange={e => updateConfig({ ...config, brand: { ...config.brand, primaryColor: e.target.value } })}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>
                          <input
                            type="text"
                            value={config.brand.primaryColor}
                            onChange={e => updateConfig({ ...config, brand: { ...config.brand, primaryColor: e.target.value } })}
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-mono font-bold uppercase focus:border-gold outline-none transition-all"
                          />
                        </div>
                        {/* Preset Colors */}
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Quick Presets</p>
                          <div className="flex gap-2 flex-wrap">
                            {['#8B008B', '#1a1a2e', '#8B008B', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                              <button
                                key={color}
                                onClick={() => updateConfig({ ...config, brand: { ...config.brand, primaryColor: color } })}
                                className={`w-8 h-8 rounded-lg color-swatch ${config.brand.primaryColor === color ? 'selected ring-2 ring-offset-2 ring-gray-300' : ''}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-4 block">Accent Signature Color</label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-2xl shadow-lg cursor-pointer relative overflow-hidden color-swatch"
                            style={{ backgroundColor: config.brand.accentColor }}
                          >
                            <input
                              type="color"
                              value={config.brand.accentColor}
                              onChange={e => updateConfig({ ...config, brand: { ...config.brand, accentColor: e.target.value } })}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>
                          <input
                            type="text"
                            value={config.brand.accentColor}
                            onChange={e => updateConfig({ ...config, brand: { ...config.brand, accentColor: e.target.value } })}
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-mono font-bold uppercase focus:border-gold outline-none transition-all"
                          />
                        </div>
                        {/* Preset Colors */}
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Quick Presets</p>
                          <div className="flex gap-2 flex-wrap">
                            {['#1a1a2e', '#8B008B', '#0d9488', '#7c3aed', '#db2777', '#ea580c', '#059669', '#2563eb'].map(color => (
                              <button
                                key={color}
                                onClick={() => updateConfig({ ...config, brand: { ...config.brand, accentColor: color } })}
                                className={`w-8 h-8 rounded-lg color-swatch ${config.brand.accentColor === color ? 'selected ring-2 ring-offset-2 ring-gray-300' : ''}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links Section */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-6 bg-charcoal rounded-full" />
                    <h3 className="text-2xl font-black font-serif text-charcoal">Social Presence</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={config.brand.socials.instagram}
                        onChange={e => updateConfig({ ...config, brand: { ...config.brand, socials: { ...config.brand.socials, instagram: e.target.value } } })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-gold outline-none transition-all"
                        placeholder="@yourbrand"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        LinkedIn
                      </label>
                      <input
                        type="text"
                        value={config.brand.socials.linkedin}
                        onChange={e => updateConfig({ ...config, brand: { ...config.brand, socials: { ...config.brand.socials, linkedin: e.target.value } } })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-gold outline-none transition-all"
                        placeholder="linkedin.com/company/yourbrand"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Panel */}
              <div className="xl:col-span-1">
                <div className="bg-charcoal p-8 rounded-[2.5rem] shadow-2xl shadow-charcoal/30 sticky top-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-6 bg-gold rounded-full" />
                    <h3 className="text-xl font-black font-serif text-white">Live Preview</h3>
                  </div>

                  {/* Mini Header Preview */}
                  <div className="bg-white rounded-2xl overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-black font-serif" style={{ color: config.brand.primaryColor }}>{config.brand.name}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{config.brand.tagline.slice(0, 40)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                      </div>
                    </div>
                    <div className="h-24 bg-gradient-to-br flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${config.brand.primaryColor}, ${config.brand.accentColor})` }}>
                      <p className="text-white text-xs font-black uppercase tracking-widest opacity-80">Hero Section</p>
                    </div>
                  </div>

                  {/* Color Swatches */}
                  <div className="mb-6">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">Color Harmony</p>
                    <div className="flex gap-2">
                      <div className="flex-1 h-12 rounded-xl transition-all" style={{ backgroundColor: config.brand.primaryColor }} />
                      <div className="flex-1 h-12 rounded-xl transition-all" style={{ backgroundColor: config.brand.accentColor }} />
                      <div className="flex-1 h-12 rounded-xl bg-white transition-all" />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[8px] font-bold text-gray-500 uppercase">Primary</span>
                      <span className="text-[8px] font-bold text-gray-500 uppercase">Accent</span>
                      <span className="text-[8px] font-bold text-gray-500 uppercase">Background</span>
                    </div>
                  </div>

                  {/* Sample Button */}
                  <div className="space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Button Styles</p>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: config.brand.primaryColor }}
                      >
                        Primary
                      </button>
                      <button
                        className="flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: config.brand.accentColor }}
                      >
                        Accent
                      </button>
                    </div>
                  </div>

                  {/* Typography Preview */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">Typography</p>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-2xl font-black font-serif text-white mb-1">{config.brand.name}</p>
                      <p className="text-xs text-gray-400 italic">{config.brand.tagline}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: config.brand.primaryColor, color: 'white' }}>
                          {config.brand.voice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Amenities Tab */}
          {activeTab === 'amenities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              {/* Added explicit type assertion to Object.entries to fix Property 'category' and 'description' does not exist on type 'unknown' errors */}
              {(Object.entries(config.amenityDetails) as [string, AmenityDetail][]).map(([name, detail]) => (
                <div key={name} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm group hover:scale-[1.02] transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-gold">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <button
                      onClick={() => setEditingAmenity({ name, detail })}
                      className="text-[10px] font-black uppercase text-primary hover:underline"
                    >
                      Edit Node
                    </button>
                  </div>
                  <h3 className="text-lg font-black text-charcoal mb-2">{name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-4">{detail.category}</p>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">{detail.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Concierge Tab */}
          {activeTab === 'concierge' && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm animate-fade-in">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-1.5 h-6 bg-gold rounded-full" />
                <h3 className="text-2xl font-black font-serif text-charcoal">AI Cognitive Hub</h3>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">System Intelligence Protocol</label>
                  <textarea
                    rows={12}
                    value={config.conciergePrompt}
                    onChange={e => updateConfig({ ...config, conciergePrompt: e.target.value })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-8 text-sm font-medium leading-relaxed focus:ring-gold outline-none"
                    // Placeholder to ensure I see the file content firsterge should behave..."
                    placeholder="Describe how the concierge should behave..."
                  />
                </div>
                <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Contextual Awareness</p>
                  <p className="text-sm text-gray-500 italic">This prompt guides the Gemini 2.5 Flash model in handling all guest inquiries. Use structured instructions to define Ghanaian hospitality charm.</p>
                </div>
              </div>
            </div>
          )}

          {/* Home Tab */}
          {activeTab === 'home' && (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-gold rounded-full" />
                    <h2 className="text-2xl font-black font-serif text-charcoal">Narrative Sequence</h2>
                  </div>
                  <button
                    onClick={() => {
                      setEditingHero({ id: Date.now().toString(), image: '', subtitle: '', title: '', description: '' });
                    }}
                    className="bg-charcoal text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold transition-all shadow-xl shadow-charcoal/20"
                  >
                    + Compose Slide
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {config.heroSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={() => handleDrop('hero', index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:border-gold/30 ${dragOverIndex === index ? 'border-dashed border-2 border-gold scale-[1.01]' : ''}`}
                    >
                      <div className="flex items-center gap-8 flex-1 min-w-0">
                        <div className="cursor-move opacity-30 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                        <div className="w-20 h-14 bg-white rounded-lg overflow-hidden border border-gray-100 shrink-0">
                          {slide.image ? (
                            <img src={slide.image} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">No Image</div>
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-1">{slide.subtitle || 'NO SUBTITLE'}</p>
                          <p className="text-sm font-black text-charcoal truncate">
                            {formatLuxuryText(slide.title || 'Untitled Narrative')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-6">
                        <button
                          onClick={() => setEditingHero(slide)}
                          className="text-[10px] font-black uppercase text-primary hover:underline"
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => {
                            const newSlides = config.heroSlides.filter(s => s.id !== slide.id);
                            updateConfig({ ...config, heroSlides: newSlides });
                            showToast('Slide removed');
                          }}
                          className="text-[10px] font-black uppercase text-red-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {config.heroSlides.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                      <p className="text-gray-400 font-serif italic text-lg">Your brand story awaits its first chapter...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pages Tab */}
          {activeTab === 'pages' && (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-gold rounded-full" />
                    <h2 className="text-2xl font-black font-serif text-charcoal">Page Registry</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* About Page Entry */}
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:border-gold/30">
                    <div className="flex items-center gap-8 flex-1 min-w-0">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                      <div className="truncate">
                        <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-1">Heritage Narrative</p>
                        <p className="text-sm font-black text-charcoal truncate">About Page</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-6">
                      <button
                        onClick={() => setEditingAboutPage(true)}
                        className="text-[10px] font-black uppercase text-primary hover:underline"
                      >
                        Modify
                      </button>
                    </div>
                  </div>

                  {/* Contact Page Entry */}
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:border-gold/30">
                    <div className="flex items-center gap-8 flex-1 min-w-0">
                      <div className="w-1.5 h-1.5 bg-charcoal rounded-full" />
                      <div className="truncate">
                        <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-1">Spatial Coordinates</p>
                        <p className="text-sm font-black text-charcoal truncate">Contact Page</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-6">
                      <button
                        onClick={() => setEditingContactPage(true)}
                        className="text-[10px] font-black uppercase text-primary hover:underline"
                      >
                        Modify
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Narrative Intelligence Summary */}
              <div className="bg-charcoal p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gold/5 mix-blend-overlay" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-xl">
                    <h4 className="text-2xl font-black font-serif text-white mb-2">Narrative Intelligence</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Every word on your pages contributes to the digital aura of C1002 Quarters. Manage your heritage and location narratives here.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                      <p className="text-2xl font-black text-gold">2</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Live Pages</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tab */}
          {activeTab === 'navigation' && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm animate-fade-in">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-gold rounded-full" />
                  <h3 className="text-2xl font-black font-serif text-charcoal">System Nav Array</h3>
                </div>
                <button
                  onClick={() => setEditingNav({ id: Date.now().toString(), label: '', path: '/' })}
                  className="bg-primary text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#6B006B] transition-all"
                >
                  + Add Link
                </button>
              </div>

              <div className="space-y-4">
                {config.navLinks.map((link, index) => (
                  <div
                    key={link.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop('nav', index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group transition-all ${dragOverIndex === index ? 'border-gold border-2 -translate-y-1' : ''}`}
                  >
                    <div className="flex items-center gap-8">
                      <div className="cursor-move opacity-30 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                      <div>
                        <p className="text-sm font-black text-charcoal">{link.label}</p>
                        <p className="text-[10px] font-mono text-gray-400">{link.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setEditingNav(link)}
                        className="text-[10px] font-black uppercase text-primary hover:underline"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => {
                          const newLinks = config.navLinks.filter(l => l.id !== link.id);
                          updateConfig({ ...config, navLinks: newLinks });
                        }}
                        className="text-[10px] font-black uppercase text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Tab */}
          {activeTab === 'footer' && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm animate-fade-in">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-1.5 h-6 bg-charcoal rounded-full" />
                <h3 className="text-2xl font-black font-serif text-charcoal">Global Footer Config</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">About Brand Text</label>
                  <textarea
                    rows={3}
                    value={config.footer.aboutText}
                    onChange={e => updateConfig({ ...config, footer: { ...config.footer, aboutText: e.target.value } })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold focus:ring-gold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Address Node</label>
                  <input
                    type="text"
                    value={config.footer.address}
                    onChange={e => updateConfig({ ...config, footer: { ...config.footer, address: e.target.value } })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold focus:ring-gold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Contact Phone</label>
                  <input
                    type="text"
                    value={config.footer.phone}
                    onChange={e => updateConfig({ ...config, footer: { ...config.footer, phone: e.target.value } })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold focus:ring-gold outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Official Email Ledger</label>
                  <input
                    type="email"
                    value={config.footer.email}
                    onChange={e => updateConfig({ ...config, footer: { ...config.footer, email: e.target.value } })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold focus:ring-gold outline-none"
                  />
                </div>
              </div>
            </div>
          )}



          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Data Backup Card */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-1.5 h-6 bg-gold rounded-full" />
                      <h3 className="text-2xl font-black font-serif text-charcoal">Data Sovereignty</h3>
                    </div>
                    {/* Database Seeding Button */}
                    <button
                      onClick={async () => {
                        if (confirm('This will upload your current local data (Rooms & Config) to Firebase Firestore. Continue?')) {
                          try {
                            const { seedDatabase } = await import('../utils/seedData');
                            const success = await seedDatabase(config);
                            if (success) showToast('Database seeded successfully!', 'success');
                            else showToast('Failed to seed database.', 'error');
                          } catch (e: any) {
                            console.error(e);
                            showToast(`Failed: ${e.message || 'Unknown error'}`, 'error');
                          }
                        }
                      }}
                      className="mb-6 w-full bg-gold/10 text-gold border border-gold/20 font-black py-4 rounded-xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                      Initialize / Seed Database
                    </button>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                      Download a full snapshot of your system configuration. This includes branding, room data, and orders.
                    </p>
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={handleExportConfig}
                        className="w-full bg-charcoal text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-gold transition-all flex items-center justify-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Master Backup
                      </button>

                      <div className="relative">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportConfig}
                          className="absolute inset-0 opacity-0 cursor-pointer pointer-events-auto"
                        />
                        <button
                          className="w-full bg-gray-50 text-charcoal font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] border border-gray-100 flex items-center justify-center gap-3"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                          </svg>
                          Restore from Backup
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Preferences Card */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-6 bg-charcoal rounded-full" />
                    <h3 className="text-2xl font-black font-serif text-charcoal">System Pulse</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Base Currency</label>
                      <select className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold focus:ring-gold outline-none">
                        <option value="GHS">GHS - Ghanaian Cedi</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Timezone Node</label>
                      <select className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold focus:ring-gold outline-none">
                        <option value="GMT">GMT (Accra)</option>
                        <option value="UTC">UTC</option>
                        <option value="EST">EST (New York)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance Card */}
              <div className="bg-red-50/30 p-10 rounded-[2.5rem] border border-red-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                    <h3 className="text-2xl font-black font-serif text-charcoal">Hard Reset / Maintenance</h3>
                  </div>
                  <span className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Danger Zone</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 max-w-xl">
                    Clear all locally cached state and force a re-synchronization with the central node. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => {
                      window.location.reload();
                      showToast('System cache cleared', 'info');
                    }}
                    className="bg-white text-red-600 border border-red-200 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                  >
                    Force Re-sync
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              {rooms.map(room => (
                <div key={room.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl flex flex-col group hover:scale-[1.02] transition-transform">
                  <div className="aspect-[16/10] bg-gray-100 relative">
                    <img src={room.image} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => setEditingRoom(room)} className="p-3 bg-white/90 backdrop-blur rounded-xl text-primary shadow-xl hover:bg-primary hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-2">{room.category}</p>
                    <h4 className="font-black font-serif text-xl text-charcoal mb-4">{room.name}</h4>
                    <p className="text-2xl font-black text-charcoal">GH₵{room.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main >

      {/* Amenity Editor Modal */}
      {
        editingAmenity && (
          <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
              <h2 className="text-3xl font-black font-serif mb-10 text-charcoal">Amenity Registry</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Amenity Name</label>
                  <input
                    type="text"
                    value={editingAmenity.name}
                    onChange={e => setEditingAmenity({ ...editingAmenity, name: e.target.value })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none"
                    placeholder="e.g. Nespresso Machine"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Classification Category</label>
                  <input
                    type="text"
                    value={editingAmenity.detail.category}
                    onChange={e => setEditingAmenity({ ...editingAmenity, detail: { ...editingAmenity.detail, category: e.target.value } })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none"
                    placeholder="e.g. Comfort & Refreshment"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Service Description</label>
                  <textarea
                    rows={3}
                    value={editingAmenity.detail.description}
                    onChange={e => setEditingAmenity({ ...editingAmenity, detail: { ...editingAmenity.detail, description: e.target.value } })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium outline-none"
                  />
                </div>
              </div>
              <div className="mt-12 flex gap-4">
                <button onClick={handleSaveAmenity} className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all">Update Registry</button>
                <button onClick={() => setEditingAmenity(null)} className="flex-1 bg-gray-100 text-charcoal font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px]">Close</button>
              </div>
            </div>
          </div>
        )
      }

      {
        viewingBooking && (() => {
          const bookedRoom = rooms.find(r => r.id === viewingBooking.roomId);
          const checkInDate = new Date(viewingBooking.date);
          const checkOutDate = new Date(checkInDate);
          checkOutDate.setDate(checkOutDate.getDate() + viewingBooking.nights);
          const nightlyRate = viewingBooking.totalPrice / viewingBooking.nights;

          return (
            <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingBooking(null)}>
              <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
                {/* Room Image Header */}
                {bookedRoom && (
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img src={bookedRoom.image} alt={bookedRoom.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                    <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-1">{bookedRoom.category}</p>
                        <p className="text-2xl font-black text-white font-serif">{viewingBooking.roomName}</p>
                      </div>
                      <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Confirmed</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-10">
                  {/* Guest Info & ID */}
                  <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-2xl">
                        👤
                      </div>
                      <div>
                        <p className="text-xl font-black text-charcoal">{viewingBooking.guestName}</p>
                        <p className="text-sm text-gray-400">{viewingBooking.guestEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Booking ID</p>
                      <p className="text-xs font-mono font-bold text-charcoal bg-gray-50 px-3 py-1 rounded-lg">{viewingBooking.id.slice(0, 12)}...</p>
                    </div>
                  </div>

                  {/* Check-in / Check-out Timeline */}
                  <div className="mb-8 pb-8 border-b border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-4">Stay Duration</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gradient-to-r from-gold/10 to-transparent p-4 rounded-2xl">
                        <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Check-In</p>
                        <p className="text-lg font-black text-charcoal">{checkInDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p className="text-xs text-gray-400">2:00 PM</p>
                      </div>
                      <div className="flex flex-col items-center px-4">
                        <div className="flex items-center gap-1">
                          {[...Array(Math.min(viewingBooking.nights, 5))].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-gold" style={{ opacity: 1 - (i * 0.15) }} />
                          ))}
                        </div>
                        <p className="text-[10px] font-black text-gold mt-1">{viewingBooking.nights} {viewingBooking.nights === 1 ? 'Night' : 'Nights'}</p>
                      </div>
                      <div className="flex-1 bg-gradient-to-l from-gold/10 to-transparent p-4 rounded-2xl text-right">
                        <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Check-Out</p>
                        <p className="text-lg font-black text-charcoal">{checkOutDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p className="text-xs text-gray-400">12:00 PM</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-4">Financial Summary</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Nightly Rate</span>
                        <span className="text-sm font-bold text-charcoal">GH₵{nightlyRate.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Duration</span>
                        <span className="text-sm font-bold text-charcoal">× {viewingBooking.nights} nights</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
                        <span className="text-sm font-black text-charcoal uppercase">Total</span>
                        <span className="text-xl font-black text-gold">GH₵{viewingBooking.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Room Amenities if available */}
                  {bookedRoom && bookedRoom.amenities && bookedRoom.amenities.length > 0 && (
                    <div className="mb-8">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-3">Suite Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {bookedRoom.amenities.slice(0, 6).map((amenity, i) => (
                          <span key={i} className="bg-gray-50 text-charcoal px-3 py-1 rounded-full text-[10px] font-bold">
                            {amenity}
                          </span>
                        ))}
                        {bookedRoom.amenities.length > 6 && (
                          <span className="bg-gold/10 text-gold px-3 py-1 rounded-full text-[10px] font-bold">
                            +{bookedRoom.amenities.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => setViewingBooking(null)}
                    className="w-full bg-charcoal text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/20 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      }

      {/* Nav Link Editor Modal */}
      {
        editingNav && (
          <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
              <h2 className="text-3xl font-black font-serif mb-10 text-charcoal">Navigation Registry</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Link Label</label>
                  <input
                    type="text"
                    value={editingNav.label}
                    onChange={e => setEditingNav({ ...editingNav, label: e.target.value })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none"
                    placeholder="e.g. Gallery"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Target Path</label>
                  <input
                    type="text"
                    value={editingNav.path}
                    onChange={e => setEditingNav({ ...editingNav, path: e.target.value })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none"
                    placeholder="e.g. /gallery"
                  />
                </div>
              </div>
              <div className="mt-12 flex gap-4">
                <button onClick={handleSaveNav} className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all">Update Array</button>
                <button onClick={() => setEditingNav(null)} className="flex-1 bg-gray-100 text-charcoal font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px]">Close</button>
              </div>
            </div>
          </div>
        )
      }

      {
        editingRoom && (
          <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-3xl rounded-[3rem] p-12 overflow-y-auto max-h-[90vh] shadow-2xl relative">
              <h2 className="text-3xl font-black font-serif mb-10 text-charcoal">Suite Specification</h2>
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Room Name</label>
                  <input type="text" value={editingRoom.name} onChange={e => setEditingRoom({ ...editingRoom, name: e.target.value })} className="w-full border-gray-100 bg-gray-50 rounded-xl p-5 text-sm font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Price (GH₵)</label>
                  <input type="number" value={editingRoom.price} onChange={e => setEditingRoom({ ...editingRoom, price: parseInt(e.target.value) })} className="w-full border-gray-100 bg-gray-50 rounded-xl p-5 text-sm font-bold" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Narrative Description</label>
                  <textarea value={editingRoom.description} onChange={e => setEditingRoom({ ...editingRoom, description: e.target.value })} className="w-full border-gray-100 bg-gray-50 rounded-xl p-6 text-sm font-medium transition-all" rows={4} />
                </div>
                <div className="col-span-2">
                  <ImageUpload
                    label="Visual Index Link"
                    currentImage={editingRoom.image}
                    onImageUploaded={(url) => setEditingRoom({ ...editingRoom, image: url })}
                    onError={(msg) => showToast(msg, 'error')}
                    folder="rooms"
                  />
                </div>
              </div>
              <div className="mt-12 flex gap-6">
                <button onClick={handleSaveRoom} className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-gold transition-all">Synchronize Node</button>
                <button onClick={() => setEditingRoom(null)} className="flex-1 bg-gray-100 text-charcoal font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px]">Discard</button>
              </div>
            </div>
          </div>
        )
      }

      {/* Hero Slide Editor Modal */}
      {
        editingHero && (
          <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
              <h2 className="text-3xl font-black font-serif mb-10 text-charcoal">Narrative Chapter</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Subtitle Anchor</label>
                    <input
                      type="text"
                      value={editingHero.subtitle}
                      onChange={e => setEditingHero({ ...editingHero, subtitle: e.target.value })}
                      className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none"
                      placeholder="e.g. LUXURY REDEFINED"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Main Headline</label>
                    <input
                      type="text"
                      value={editingHero.title}
                      onChange={e => setEditingHero({ ...editingHero, title: e.target.value })}
                      className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none"
                      placeholder="e.g. Experience Ghana"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Narrative Description</label>
                    <textarea
                      rows={3}
                      value={editingHero.description}
                      onChange={e => setEditingHero({ ...editingHero, description: e.target.value })}
                      className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium outline-none"
                      placeholder="Tell the story of this visual chapter..."
                    />
                  </div>
                </div>

                <div className="space-y-6 font-serif">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gold mb-1 font-sans">Imagery Node</p>
                  <ImageUpload
                    currentImage={editingHero.image}
                    onImageUploaded={(url) => setEditingHero({ ...editingHero, image: url })}
                    onError={(msg) => showToast(msg, 'error')}
                    folder="hero-slides"
                    label=""
                  />
                </div>
              </div>
              <div className="mt-12 flex gap-4">
                <button onClick={handleSaveHero} className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/20">Commit Chapter</button>
                <button onClick={() => setEditingHero(null)} className="flex-1 bg-gray-100 text-charcoal font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px]">Discard</button>
              </div>
            </div>
          </div>
        )
      }

      {/* About Page Editor Modal */}
      {
        editingAboutPage && (
          <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] p-12 shadow-2xl relative overflow-hidden overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-black font-serif text-charcoal">About Manuscript</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gold mt-2">Historical & Brand Narrative</p>
                </div>
                <button onClick={() => setEditingAboutPage(false)} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Hero Headline</label>
                  <input
                    type="text"
                    value={config.aboutPage.heroTitle}
                    onChange={e => updateConfig({ ...config, aboutPage: { ...config.aboutPage, heroTitle: e.target.value } })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                    placeholder="e.g. A Legacy of Elegance"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Hero Sub-Anchor</label>
                  <input
                    type="text"
                    value={config.aboutPage.heroSubtitle}
                    onChange={e => updateConfig({ ...config, aboutPage: { ...config.aboutPage, heroSubtitle: e.target.value } })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-gold/20"
                    placeholder="e.g. Est. 2024"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold block">Heritage Narrative - Phase I</label>
                    <button
                      onClick={() => handleAiWriter('description', 'heritage background phase 1')}
                      className="text-[9px] font-black uppercase text-primary flex items-center gap-1 hover:underline"
                    >
                      <span>✨ AI Draft</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={config.aboutPage.heritageDescription1}
                    onChange={e => updateConfig({ ...config, aboutPage: { ...config.aboutPage, heritageDescription1: e.target.value } })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium leading-relaxed outline-none focus:ring-2 ring-gold/20"
                    placeholder="The beginning of the story..."
                  />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold block">Heritage Narrative - Phase II</label>
                    <button
                      onClick={() => handleAiWriter('description', 'heritage background phase 2')}
                      className="text-[9px] font-black uppercase text-primary flex items-center gap-1 hover:underline"
                    >
                      <span>✨ AI Draft</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={config.aboutPage.heritageDescription2}
                    onChange={e => updateConfig({ ...config, aboutPage: { ...config.aboutPage, heritageDescription2: e.target.value } })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium leading-relaxed outline-none focus:ring-2 ring-gold/20"
                    placeholder="The growth and evolution..."
                  />
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4">
                <button
                  onClick={() => {
                    setEditingAboutPage(false);
                    showToast('Manuscript Synchronized');
                  }}
                  className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/20"
                >
                  Synchronize Narrative
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Contact Page Editor Modal */}
      {
        editingContactPage && (
          <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-3xl rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-black font-serif text-charcoal">Spatial Coordinates</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gold mt-2">Gateway & Physical Presence</p>
                </div>
                <button onClick={() => setEditingContactPage(false)} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Hero Narrative Lead</label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={config.contactPage.heroDescription}
                      onChange={e => updateConfig({ ...config, contactPage: { ...config.contactPage, heroDescription: e.target.value } })}
                      className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-medium outline-none focus:ring-2 ring-gold/20 pr-24"
                      placeholder="Inviting guests to connect..."
                    />
                    <button
                      onClick={() => handleAiWriter('description', 'contact page greeting')}
                      className="absolute bottom-6 right-6 text-[9px] font-black uppercase text-primary bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100"
                    >
                      ✨ AI Write
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Geospatial Embed Index (Map URL)</label>
                  <input
                    type="text"
                    value={config.contactPage.mapEmbedUrl}
                    onChange={e => updateConfig({ ...config, contactPage: { ...config.contactPage, mapEmbedUrl: e.target.value } })}
                    className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-[10px] font-mono font-bold outline-none focus:ring-2 ring-gold/20"
                    placeholder="https://www.google.com/maps/embed?..."
                  />
                  <p className="text-[9px] text-gray-400 mt-3 italic">"Ensure the URL begins with HTTPS for secure spatial rendering."</p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4">
                <button
                  onClick={() => {
                    setEditingContactPage(false);
                    showToast('Coordinates Calibrated');
                  }}
                  className="flex-1 bg-charcoal text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-charcoal/20"
                >
                  Update Vector Node
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Toast Notification */}
      <div
        className={`fixed top-6 right-6 z-[100] transition-all duration-300 ${toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      >
        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl ${toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-charcoal text-white'
          }`}>
          {toast.type === 'success' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.type === 'info' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-sm font-bold">{toast.message}</span>
          <button
            onClick={() => setToast(prev => ({ ...prev, visible: false }))}
            className="ml-2 hover:opacity-70 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Global Search Modal */}
      {
        showGlobalSearch && (
          <div className="fixed inset-0 z-[110] flex items-start justify-center pt-[15vh]">
            <div
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
              onClick={() => setShowGlobalSearch(false)}
            />
            <div className="relative w-full max-w-2xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
              {/* Search Input */}
              <div className="flex items-center gap-4 p-6 border-b border-gray-100">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search rooms, bookings, subscribers..."
                  value={globalSearchQuery}
                  onChange={e => setGlobalSearchQuery(e.target.value)}
                  className="flex-1 text-lg outline-none font-medium placeholder:text-gray-400"
                  autoFocus
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500">
                  ESC
                </kbd>
              </div>

              {/* Search Results */}
              <div className="max-h-[400px] overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={result.action}
                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all text-left group"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.type === 'room' ? 'bg-gold/10 text-gold' :
                          result.type === 'booking' ? 'bg-green-100 text-green-600' :
                            result.type === 'subscriber' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                          }`}>
                          {result.type === 'room' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          )}
                          {result.type === 'booking' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                          {result.type === 'subscriber' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                          {result.type === 'tab' && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-charcoal truncate">{result.title}</p>
                          <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-300 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                ) : globalSearchQuery && (
                  <div className="p-12 text-center">
                    <p className="text-gray-400 italic font-serif text-lg">No results found for "{globalSearchQuery}"</p>
                  </div>
                )}

                {!globalSearchQuery && (
                  <div className="p-8 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Quick Tips</p>
                    <p className="text-sm text-gray-500">Search for room names, guest emails, or tab names</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="font-bold">Pro tip:</span>
                  <span>Press</span>
                  <kbd className="px-2 py-0.5 bg-white rounded border text-[10px] font-bold">⌘K</kbd>
                  <span>anytime to search</span>
                </div>
                <button
                  onClick={() => setShowGlobalSearch(false)}
                  className="text-xs font-bold text-gray-500 hover:text-charcoal transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
        
        /* Staggered list animation */
        .stagger-item {
          opacity: 0;
          animation: fade-in 0.4s ease-out forwards;
        }
        .stagger-item:nth-child(1) { animation-delay: 0ms; }
        .stagger-item:nth-child(2) { animation-delay: 50ms; }
        .stagger-item:nth-child(3) { animation-delay: 100ms; }
        .stagger-item:nth-child(4) { animation-delay: 150ms; }
        .stagger-item:nth-child(5) { animation-delay: 200ms; }
        .stagger-item:nth-child(6) { animation-delay: 250ms; }
        .stagger-item:nth-child(7) { animation-delay: 300ms; }
        .stagger-item:nth-child(8) { animation-delay: 350ms; }
        
        /* Button hover lift effect */
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .hover-lift:active {
          transform: translateY(0);
        }
        
        /* Color picker swatch animation */
        .color-swatch {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .color-swatch:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .color-swatch.selected {
          transform: scale(1.15);
          box-shadow: 0 0 0 3px white, 0 0 0 5px currentColor;
        }
        
        /* Input focus glow */
        input:focus, textarea:focus, select:focus {
          box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.15);
        }
        
        /* Card hover effect */
        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
        }
        
        /* Tab transition */
        .tab-content {
          animation: fade-in 0.4s ease-out;
        }
        
        /* Shimmer loading effect */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div >
  );
};

export default Admin;