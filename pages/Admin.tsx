import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useToast } from '../context/ToastContext';
import { Room, NavLink, HeroSlide, AmenityDetail, Booking } from '../types';
import { useAiWriter } from '../hooks/useAiWriter';
import { formatLuxuryText } from '../utils/formatters';
import { db, auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import ImageUpload from '../components/ImageUpload';
import { AdminBranding } from '../components/admin/AdminBranding';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminBookings } from '../components/admin/AdminBookings';
import { AdminRooms } from '../components/admin/AdminRooms';
import { AdminHome } from '../components/admin/AdminHome';
import { AdminNavigation } from '../components/admin/AdminNavigation';
import { AdminPages } from '../components/admin/AdminPages';
import { AdminFooter } from '../components/admin/AdminFooter';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminAmenities } from '../components/admin/AdminAmenities';
import { AdminReviews } from '../components/admin/AdminReviews';
import { AdminNewsletter } from '../components/admin/AdminNewsletter';
import { AdminConcierge } from '../components/admin/AdminConcierge';
import { AdminConciergeLab } from '../components/admin/AdminConciergeLab';
import { AdminPatrons } from '../components/admin/AdminPatrons';

import { AdminFinancials } from '../components/admin/AdminFinancials';

import { AdminEmails } from '../components/admin/AdminEmails';
import { AdminPricing } from '../components/admin/AdminPricing';
import { AdminHeroModal } from '../components/admin/modals/AdminHeroModal';
import { AdminNavModal } from '../components/admin/modals/AdminNavModal';
import { AdminRoomModal } from '../components/admin/modals/AdminRoomModal';
import { AdminAmenityModal } from '../components/admin/modals/AdminAmenityModal';
import { AdminBookingModal } from '../components/admin/modals/AdminBookingModal';
import SEO from '../components/SEO';

type Tab = 'overview' | 'bookings' | 'reviews' | 'emails' | 'pricing' | 'branding' | 'home' | 'pages' | 'navigation' | 'rooms' | 'amenities' | 'concierge' | 'ailab' | 'patrons' | 'financials' | 'footer' | 'newsletter' | 'settings';


const Admin: React.FC = () => {
  const { rooms, config, updateConfig, updateRooms, loading } = useSite();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [editingNav, setEditingNav] = useState<NavLink | null>(null);
  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null);
  const [editingAmenity, setEditingAmenity] = useState<{ name: string, detail: AmenityDetail } | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync tab and editing state with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab') as Tab;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }

    const editId = searchParams.get('edit');
    if (editId) {
      const roomToEdit = rooms.find(r => r.id === editId);
      if (roomToEdit) setEditingRoom(roomToEdit);
    }
  }, [searchParams, rooms]);

  const handleTabChange = (newTab: Tab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
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



  const { showToast } = useToast();






  const { generateContent, isAiGenerating } = useAiWriter({
    apiKey: process.env.API_KEY || '',
    brandVoice: config.brand.voice
  });

  const handleAiWriter = async (field: 'description' | 'hero' | 'tagline' | 'about' | 'contact', context: string) => {
    try {
      const textResult = await generateContent(field, context);
      if (!textResult) return;

      if (field === 'description' && editingRoom) {
        setEditingRoom({ ...editingRoom, description: textResult });
      } else if (field === 'tagline') {
        updateConfig({ ...config, brand: { ...config.brand, tagline: textResult } });
      } else if (field === 'about') {
        // This is handled via callbacks in the future if needed, 
        // but for now we'll allow components to use it directly
        return textResult;
      }
      return textResult;
    } catch (e) {
      console.error(e);
    }
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

  const handleSaveAmenity = (originalName?: string) => {
    if (!editingAmenity) return;
    const newDetails = { ...config.amenityDetails };

    // If name changed, delete old one
    if (originalName && originalName !== editingAmenity.name) {
      delete newDetails[originalName];
    }

    newDetails[editingAmenity.name] = editingAmenity.detail;
    updateConfig({ ...config, amenityDetails: newDetails });
    setEditingAmenity(null);
    showToast('Amenity details updated!');
  };

  const handleDeleteAmenity = (name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will remove it from the registry.`)) {
      const newDetails = { ...config.amenityDetails };
      delete newDetails[name];
      updateConfig({ ...config, amenityDetails: newDetails });
      setEditingAmenity(null);
      showToast('Amenity removed from registry.');
    }
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
          {(['overview', 'bookings', 'reviews', 'emails', 'pricing', 'branding', 'home', 'pages', 'navigation', 'rooms', 'amenities', 'concierge', 'ailab', 'patrons', 'financials', 'footer', 'newsletter', 'settings'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
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
            <AdminOverview
              rooms={rooms}
              config={config}
              setActiveTab={setActiveTab}
              setEditingRoom={(room) => setEditingRoom(room)}
              setViewingBooking={setViewingBooking}
            />
          )}
          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <AdminBookings
              onViewBooking={setViewingBooking}
            />
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <AdminReviews />
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <AdminEmails />
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <AdminPricing />
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <AdminBranding
              config={config}
              updateConfig={updateConfig}
              handleAiWriter={handleAiWriter}
              isAiGenerating={isAiGenerating}
            />
          )}

          {/* Amenities Tab */}
          {activeTab === 'amenities' && (
            <AdminAmenities
              config={config}
              onEditAmenity={(name, detail) => setEditingAmenity({ name, detail })}
              onDelete={handleDeleteAmenity}
            />
          )}
          {/* Concierge Tab */}
          {activeTab === 'concierge' && (
            <AdminConcierge
              config={config}
              updateConfig={updateConfig}
            />
          )}

          {/* AI Lab Tab */}
          {activeTab === 'ailab' && (
            <AdminConciergeLab
              config={config}
              updateConfig={updateConfig}
            />
          )}

          {/* Patrons Tab */}
          {activeTab === 'patrons' && (
            <AdminPatrons />
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
            <AdminFinancials />
          )}

          {/* Newsletter Tab */}
          {activeTab === 'newsletter' && (
            <AdminNewsletter
              config={config}
              updateConfig={updateConfig}
            />
          )}

          {/* Home Tab */}
          {activeTab === 'home' && (
            <AdminHome
              config={config}
              updateConfig={updateConfig}
              setEditingHero={setEditingHero}
            />
          )}

          {/* Pages Tab */}
          {activeTab === 'pages' && (
            <AdminPages
              config={config}
              updateConfig={updateConfig}
              handleAiWriter={handleAiWriter}
              isAiGenerating={isAiGenerating}
            />
          )}

          {/* Navigation Tab */}
          {activeTab === 'navigation' && (
            <AdminNavigation
              config={config}
              updateConfig={updateConfig}
              setEditingNav={setEditingNav}
            />
          )}

          {/* Footer Tab */}
          {activeTab === 'footer' && (
            <AdminFooter
              config={config}
              updateConfig={updateConfig}
            />
          )}



          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <AdminSettings
              config={config}
              updateConfig={updateConfig}
            />
          )}

          {activeTab === 'rooms' && (
            <AdminRooms
              onEditRoom={(room) => setEditingRoom(room)}
              onOpenAddRoom={() => setEditingRoom({
                id: Date.now().toString(),
                name: '',
                category: config.categories[0],
                price: 0,
                image: '',
                description: '',
                rating: 5,
                reviewsCount: 0,
                amenities: [],
                size: '',
                guests: '',
                view: ''
              })}
            />
          )}
        </div>
      </main >

      <AdminAmenityModal
        editingAmenity={editingAmenity}
        setEditingAmenity={setEditingAmenity}
        onSave={handleSaveAmenity}
        onDelete={handleDeleteAmenity}
      />

      <AdminBookingModal
        viewingBooking={viewingBooking}
        setViewingBooking={setViewingBooking}
        rooms={rooms}
      />

      <AdminNavModal
        editingNav={editingNav}
        setEditingNav={setEditingNav}
        onSave={handleSaveNav}
      />

      <AdminRoomModal
        editingRoom={editingRoom}
        setEditingRoom={setEditingRoom}
        onSave={handleSaveRoom}
        handleAiWriter={handleAiWriter}
        isAiGenerating={isAiGenerating}
      />

      <AdminHeroModal
        editingHero={editingHero}
        setEditingHero={setEditingHero}
        onSave={handleSaveHero}
      />







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