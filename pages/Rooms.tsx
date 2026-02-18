import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import SEO from '../components/SEO';
import { formatLuxuryText, formatPrice } from '../utils/formatters';
import { Room } from '../types';

const RoomSkeleton: React.FC = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col animate-pulse">
    <div className="aspect-[4/5] md:aspect-[16/10] bg-gray-200" />
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-2 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-3/4 bg-gray-200 rounded" />
        </div>
        <div className="w-12 h-10 bg-gray-200 rounded" />
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-5/6 bg-gray-200 rounded" />
      </div>
      <div className="h-10 w-full bg-gray-100 rounded-lg mb-8" />
      <div className="mt-auto flex items-center justify-between pt-4">
        <div className="space-y-2">
          <div className="h-2 w-12 bg-gray-100 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-12 w-32 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);

const RoomCard: React.FC<{ room: Room; wishlist: string[]; onToggleWishlist: (id: string, e: React.MouseEvent) => void; onOpenGallery: (room: Room, index: number) => void }> = ({ room, wishlist, onToggleWishlist, onOpenGallery }) => {
  const { config } = useSite();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const roomImages = useMemo(() => {
    if (room.images && room.images.length > 0) {
      return room.images;
    }
    return [room.image];
  }, [room]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length);
  };

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col relative">
      <button
        onClick={(e) => onToggleWishlist(room.id, e)}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center transition-all hover:scale-110 group/wish"
      >
        <svg className={`w-5 h-5 transition-colors ${wishlist.includes(room.id) ? 'text-gold' : 'text-gray-300 group-hover/wish:text-gold'}`} fill={wishlist.includes(room.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <div className="aspect-[4/5] md:aspect-[16/10] relative overflow-hidden group/image cursor-pointer" onClick={() => onOpenGallery(room, currentImageIndex)}>
        <div className="flex h-full w-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
          {roomImages.map((src, idx) => (
            <div key={idx} className="w-full h-full shrink-0">
              <img
                src={src}
                alt={`${room.name} view ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
            </div>
          ))}
        </div>

        {roomImages.length > 1 && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(e); }}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-charcoal transition-all shadow-lg"
                aria-label="Previous Image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(e); }}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-charcoal transition-all shadow-lg"
                aria-label="Next Image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity">
              <span className="text-white text-[10px] font-black uppercase tracking-wider">Click to expand</span>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity">
              {roomImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${currentImageIndex === idx ? 'bg-white w-6' : 'bg-white/50'}`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
            <div className="absolute top-2 left-2 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full">
              <span className="text-white text-[10px] font-black uppercase tracking-wider">{currentImageIndex + 1} / {roomImages.length}</span>
            </div>
          </>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {room.isBestSeller && (
            <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider text-primary shadow-sm">Popular Choice</div>
          )}
          {room.isElite && (
            <div className="bg-primary px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-sm">Top Pick</div>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[10px] md:text-[11px] font-black text-gold uppercase tracking-[0.2em] mb-1">{room.category}</p>
            <Link to={`/rooms/${room.id}`} className="block group-Title">
              <h3 className="text-lg md:text-2xl font-black font-serif group-hover:text-primary transition-colors">{room.name}</h3>
            </Link>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center text-gold text-xs md:text-sm font-black">
              ★ {room.rating}
            </div>
            <p className="text-[10px] md:text-[11px] text-gray-400 font-bold">{room.reviewsCount} Reviews</p>
          </div>
        </div>
        <p className="text-gray-400 md:text-gray-500 text-xs md:text-sm mb-6 line-clamp-2 font-light leading-relaxed">
          {formatLuxuryText(room.description)}
        </p>

        <div className="flex items-center gap-6 mb-8 text-[11px] text-gray-400 font-black uppercase tracking-widest border-y border-gray-50 py-3">
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            {room.size}
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {room.guests}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <p className="text-gray-400 text-[10px] md:text-[11px] uppercase font-black tracking-[0.2em]">Nightly rate</p>
            <p className="text-xl md:text-3xl font-black text-charcoal font-serif">{formatPrice(room.price, config.currency)}</p>
          </div>
          <Link to={`/checkout?room=${room.id}`} className="bg-primary hover:bg-[#6B006B] text-white font-black py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all shadow-lg hover:shadow-primary/30 uppercase tracking-[0.15em] text-[11px] md:text-xs">
            Book Room
          </Link>
        </div>
      </div>
    </div>
  );
};

const Rooms: React.FC = () => {
  const { rooms, config } = useSite();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(3000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const allAmenities = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach(room => room.amenities.forEach(a => set.add(a)));
    return Array.from(set).sort();
  }, [rooms]);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategories([category]);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    const saved = localStorage.getItem('luxe_wishlist');
    if (saved) setWishlist(JSON.parse(saved));
    return () => clearTimeout(timer);
  }, []);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newWishlist = wishlist.includes(id)
      ? wishlist.filter(item => item !== id)
      : [...wishlist, id];
    setWishlist(newWishlist);
    localStorage.setItem('luxe_wishlist', JSON.stringify(newWishlist));
    window.dispatchEvent(new Event('storage'));
  };

  const filteredRooms = useMemo(() => {
    const guestParam = searchParams.get('guests');

    return rooms.filter(room => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(room.category);
      const priceMatch = room.price <= priceRange;
      const amenitiesMatch = selectedAmenities.every(amenity =>
        room.amenities.includes(amenity)
      );

      let guestMatch = true;
      if (guestParam === 'Family') {
        guestMatch = room.guests >= 3 || room.category === 'Villa' || room.category === 'Presidential';
      } else if (guestParam === '1 Adult') {
        guestMatch = true;
      } else if (guestParam === '2 Adults') {
        guestMatch = room.guests >= 2;
      }

      return categoryMatch && priceMatch && amenitiesMatch && guestMatch;
    });
  }, [selectedCategories, priceRange, selectedAmenities, searchParams, rooms]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange(1500);
    setSelectedAmenities([]);
  };

  const handleOpenGallery = (room: Room, index: number) => {
    setSelectedRoom(room);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const handleCloseGallery = () => {
    setGalleryOpen(false);
    setSelectedRoom(null);
  };

  const galleryImages = useMemo(() => {
    if (!selectedRoom) return [];
    if (selectedRoom.images && selectedRoom.images.length > 0) {
      return selectedRoom.images;
    }
    return [selectedRoom.image];
  }, [selectedRoom]);

  const handleGalleryNext = () => {
    if (galleryImages.length === 0) return;
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handleGalleryPrev = () => {
    if (galleryImages.length === 0) return;
    setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  useEffect(() => {
    if (!galleryOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseGallery();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryOpen, galleryImages.length]);

  useEffect(() => {
    if (galleryOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [galleryOpen]);

  return (
    <div className="pt-24 min-h-screen bg-background-light">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <Link to="/" className="text-gray-500 text-sm font-medium hover:text-primary transition-colors">Home</Link>
          <span className="text-gray-500 text-sm">/</span>
          <span className="text-charcoal text-sm font-medium">Our Rooms</span>
        </div>

        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight font-serif mb-3 text-charcoal">The Collection</h1>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl font-medium">
              Explore our curated selection of {rooms.length} avant-garde suites and private estates.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {(selectedCategories.length > 0 || selectedAmenities.length > 0 || priceRange < 3000) && (
              <button
                onClick={clearFilters}
                className="text-primary text-[11px] font-black uppercase tracking-[0.2em] hover:text-charcoal transition-colors border-b-2 border-primary/20 pb-0.5"
              >
                Reset All
              </button>
            )}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-charcoal text-white px-5 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Refine Search
            </button>
          </div>
        </div>

        {/* Active Filter Chips - Mobile/Desktop */}
        {(selectedCategories.length > 0 || selectedAmenities.length > 0 || priceRange < 3000) && (
          <div className="flex flex-wrap gap-2 mb-8 animate-fade-in">
            {selectedCategories.map(cat => (
              <button key={cat} onClick={() => toggleCategory(cat)} className="flex items-center gap-2 bg-primary/5 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10 hover:bg-primary/10 transition-all">
                {cat} <span className="text-lg leading-none">×</span>
              </button>
            ))}
            {selectedAmenities.map(amenity => (
              <button key={amenity} onClick={() => toggleAmenity(amenity)} className="flex items-center gap-2 bg-gold/5 text-gold px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-gold/10 hover:bg-gold/10 transition-all">
                {amenity} <span className="text-lg leading-none">×</span>
              </button>
            ))}
            {priceRange < 3000 && (
              <button onClick={() => setPriceRange(3000)} className="flex items-center gap-2 bg-charcoal/5 text-charcoal px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-charcoal/10 hover:bg-charcoal/10 transition-all">
                Under {formatPrice(priceRange, config.currency)} <span className="text-lg leading-none">×</span>
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-28 flex flex-col gap-10 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40">
              <div>
                <h3 className="text-charcoal text-[11px] font-black mb-4 uppercase tracking-[0.2em] text-gold">Room Categories</h3>
                <div className="flex flex-col gap-2">
                  {config.categories.map((cat) => (
                    <label
                      key={cat}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all border ${selectedCategories.includes(cat)
                        ? 'bg-primary/5 border-primary/20 text-primary'
                        : 'bg-transparent border-transparent text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? 'bg-primary border-primary' : 'border-gray-300'
                        }`}>
                        {selectedCategories.includes(cat) && <span className="text-white text-[11px]">✓</span>}
                      </div>
                      <span className="text-sm font-bold">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-charcoal text-[11px] font-black uppercase tracking-[0.2em] text-gold">Max Price</h3>
                  <span className="text-primary font-black text-sm">{formatPrice(priceRange, config.currency)}</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="3000"
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-charcoal text-[11px] font-black mb-4 uppercase tracking-[0.2em] text-gold">Amenities</h3>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {allAmenities.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary transition-all"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                      />
                      <span className={`text-sm transition-colors ${selectedAmenities.includes(amenity) ? 'text-primary font-bold' : 'text-gray-500 group-hover:text-charcoal'
                        }`}>
                        {amenity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[1, 2, 3, 4].map(i => <RoomSkeleton key={i} />)}
              </div>
            ) : filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    wishlist={wishlist}
                    onToggleWishlist={toggleWishlist}
                    onOpenGallery={handleOpenGallery}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] py-24 px-10 text-center border border-gray-100 shadow-2xl shadow-gray-200/40 animate-fade-in max-w-2xl mx-auto w-full">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
                  <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-black font-serif mb-4 text-charcoal tracking-tight">No Discoveries Found</h2>
                <p className="text-gray-400 font-medium mb-10 max-w-sm mx-auto">Try refining your selection criteria to find the perfect suite for your experience.</p>
                <button
                  onClick={clearFilters}
                  className="bg-charcoal text-white font-black px-12 py-5 rounded-2xl hover:bg-primary transition-all uppercase tracking-[0.2em] text-[11px] shadow-xl hover:shadow-primary/30"
                >
                  Reset all criteria
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-[2.5rem] shadow-2xl animate-slide-up flex flex-col p-8 overflow-hidden">
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8 shrink-0" />

            <div className="flex justify-between items-center mb-8 shrink-0">
              <h3 className="text-2xl font-black font-serif text-charcoal tracking-tight">Refine Selection</h3>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-charcoal hover:bg-gray-100 transition-all">×</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-12 pb-10">
              <div>
                <h3 className="text-gold text-[10px] font-black mb-6 uppercase tracking-[0.4em]">Suite Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {config.categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-3 rounded-xl font-bold text-xs transition-all border text-left ${selectedCategories.includes(cat)
                        ? 'bg-primary/5 border-primary/20 text-primary shadow-sm'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gold/20'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">Max Investment</h3>
                  <span className="text-primary font-black text-xs">{formatPrice(priceRange, config.currency)}</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="3000"
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <h3 className="text-gold text-[10px] font-black mb-6 uppercase tracking-[0.4em]">Premium Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {allAmenities.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-3 rounded-xl font-bold text-[10px] transition-all border text-left flex items-center gap-2 ${selectedAmenities.includes(amenity)
                        ? 'bg-gold/5 border-gold/20 text-gold shadow-sm'
                        : 'bg-white border-gray-100 text-gray-400'
                        }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${selectedAmenities.includes(amenity) ? 'bg-gold' : 'bg-gray-100'}`} />
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full bg-charcoal text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[11px]"
              >
                Apply Discoveries
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Gallery Modal */}
      {galleryOpen && selectedRoom && (
        <div className="fixed inset-0 z-[9999] backdrop-blur-3xl flex flex-col animate-fade-in" style={{ backgroundColor: 'rgba(255, 255, 255, 0.99)' }}>
          <div className="h-40 md:h-28 w-full px-6 md:px-10 flex items-end md:items-center justify-between shrink-0 border-b border-gray-100 pb-8 md:pb-0">
            <button
              onClick={handleCloseGallery}
              className="flex items-center gap-3 text-charcoal/40 hover:text-primary transition-all group"
            >
              <div className="w-8 h-8 rounded-full border border-charcoal/10 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Back</span>
            </button>

            <div className="hidden md:flex flex-col items-center">
              <h2 className="text-lg font-serif italic text-charcoal">{selectedRoom.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-px w-4 bg-gold/30" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">{galleryIndex + 1} / {galleryImages.length}</span>
                <span className="h-px w-4 bg-gold/30" />
              </div>
            </div>

            <button
              onClick={handleCloseGallery}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-charcoal/10 flex items-center justify-center hover:bg-gray-50 transition-all text-charcoal/40 hover:text-charcoal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center px-4 md:px-12 lg:px-24 overflow-hidden">
            <button
              onClick={handleGalleryPrev}
              className="absolute left-4 md:left-12 z-20 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border transition-all shadow-2xl backdrop-blur-md bg-white/10 border-white/20 text-charcoal hover:bg-white hover:scale-110 active:scale-95"
              aria-label="Previous Image"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto overflow-hidden">
              <div
                className="flex h-full w-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${galleryIndex * 100}%)` }}
              >
                {galleryImages.map((src, idx) => (
                  <div key={idx} className="h-full w-full shrink-0 flex items-center justify-center p-4">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={src}
                        alt={`${selectedRoom.name} full view ${idx + 1}`}
                        className="max-w-full max-h-[65vh] md:max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGalleryNext}
              className="absolute right-4 md:right-12 z-20 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border transition-all shadow-2xl backdrop-blur-md bg-white/10 border-white/20 text-charcoal hover:bg-white hover:scale-110 active:scale-95"
              aria-label="Next Image"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {galleryImages.length > 1 && (
            <div className="h-32 md:h-40 w-full border-t border-gray-100 flex items-center justify-center p-4 md:p-6 gap-3 md:gap-5 overflow-x-auto shrink-0 no-scrollbar bg-white/95 backdrop-blur-md">
              {galleryImages.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setGalleryIndex(idx)}
                  className={`relative shrink-0 h-16 md:h-20 lg:h-24 aspect-video rounded-xl overflow-hidden transition-all duration-500 border-2 ${galleryIndex === idx
                    ? 'border-primary scale-105 shadow-xl opacity-100'
                    : 'border-transparent opacity-30 hover:opacity-60 grayscale hover:grayscale-0'
                    }`}
                  aria-label={`Go to image ${idx + 1}`}
                >
                  <img src={src} className="w-full h-full object-cover" alt="Preview" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )
      }

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Rooms;
