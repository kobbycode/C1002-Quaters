import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { Room, NavLink, HeroSlide, AmenityDetail, Booking } from '../types';
import { GoogleGenAI } from "@google/genai";
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
import SEO from '../components/SEO';

type Tab = 'overview' | 'bookings' | 'branding' | 'home' | 'pages' | 'navigation' | 'rooms' | 'amenities' | 'concierge' | 'footer' | 'newsletter' | 'settings';


const Admin: React.FC = () => {
  const { rooms, config, updateConfig, updateRooms, loading } = useSite();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [editingNav, setEditingNav] = useState<NavLink | null>(null);
  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null);
  const [editingAmenity, setEditingAmenity] = useState<{ name: string, detail: AmenityDetail } | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
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



  // Toast Notification System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({ message: '', type: 'success', visible: false });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };





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


          {/* Home Tab */}
          {activeTab === 'home' && (
            <AdminHome
              config={config}
              updateConfig={updateConfig}
              setEditingHero={setEditingHero}
              showToast={showToast}
            />
          )}

          {/* Pages Tab */}
          {activeTab === 'pages' && (
            <AdminPages
              config={config}
              updateConfig={updateConfig}
              handleAiWriter={handleAiWriter}
              isAiGenerating={isAiGenerating}
              showToast={showToast}
            />
          )}

          {/* Navigation Tab */}
          {activeTab === 'navigation' && (
            <AdminNavigation
              config={config}
              updateConfig={updateConfig}
              setEditingNav={setEditingNav}
              showToast={showToast}
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
              showToast={showToast}
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