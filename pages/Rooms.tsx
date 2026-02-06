import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import SEO from '../components/SEO';
import { formatLuxuryText } from '../utils/formatters';

const RoomSkeleton: React.FC = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col animate-pulse">
    <div className="aspect-[16/10] bg-gray-200" />
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

const Rooms: React.FC = () => {
  const { rooms, config } = useSite();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(1500);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

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
        guestMatch = parseInt(room.guests) >= 3 || room.category === 'Villa' || room.category === 'Presidential';
      } else if (guestParam === '1 Adult') {
        guestMatch = true;
      } else if (guestParam === '2 Adults') {
        guestMatch = parseInt(room.guests) >= 2;
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
            <h1 className="text-2xl md:text-4xl font-black leading-tight tracking-tight font-serif mb-2 text-charcoal">Our Rooms</h1>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl">
              Enjoy your stay in one of our {rooms.length} beautiful rooms and suites.
            </p>
          </div>
          {(selectedCategories.length > 0 || selectedAmenities.length > 0 || priceRange < 1500) && (
            <button
              onClick={clearFilters}
              className="text-primary text-sm font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24 flex flex-col gap-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <h3 className="text-charcoal text-[10px] font-black mb-4 uppercase tracking-[0.2em] text-gold">Room Categories</h3>
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
                        {selectedCategories.includes(cat) && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <span className="text-sm font-bold">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-charcoal text-[10px] font-black uppercase tracking-[0.2em] text-gold">Max Price</h3>
                  <span className="text-primary font-black text-sm">GH₵{priceRange}</span>
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
                <h3 className="text-charcoal text-[10px] font-black mb-4 uppercase tracking-[0.2em] text-gold">Amenities</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => <RoomSkeleton key={i} />)}
              </div>
            ) : filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredRooms.map((room) => (
                  <div key={room.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col relative">
                    <button
                      onClick={(e) => toggleWishlist(room.id, e)}
                      className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center transition-all hover:scale-110 group/wish"
                    >
                      <svg className={`w-5 h-5 transition-colors ${wishlist.includes(room.id) ? 'text-gold' : 'text-gray-300 group-hover/wish:text-gold'}`} fill={wishlist.includes(room.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </button>

                    <div className="aspect-[16/10] relative overflow-hidden">
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {room.isBestSeller && (
                          <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-primary shadow-sm">Popular Choice</div>
                        )}
                        {room.isElite && (
                          <div className="bg-primary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm">Top Pick</div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-1">{room.category}</p>
                          <h3 className="text-xl md:text-2xl font-black font-serif group-hover:text-primary transition-colors">{room.name}</h3>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center text-gold text-sm font-black">
                            ★ {room.rating}
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold">{room.reviewsCount} Reviews</p>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm mb-6 line-clamp-2 font-light leading-relaxed">
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
                          <p className="text-gray-400 text-[9px] uppercase font-black tracking-[0.2em]">Nightly rate</p>
                          <p className="text-2xl md:text-3xl font-black text-charcoal font-serif">GH₵{room.price}<span className="text-sm font-normal text-gray-400">.00</span></p>
                        </div>
                        <Link to={`/checkout?room=${room.id}`} className="bg-primary hover:bg-[#6B006B] text-white font-black py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all shadow-lg hover:shadow-primary/30 uppercase tracking-[0.15em] text-xs">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 shadow-sm animate-fade-in">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-black font-serif mb-4">No Rooms Match Your Criteria</h2>
                <button
                  onClick={clearFilters}
                  className="bg-charcoal text-white font-black px-6 md:px-10 py-3 md:py-4 rounded-xl hover:bg-primary transition-all uppercase tracking-widest text-xs"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
