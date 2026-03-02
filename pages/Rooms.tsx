import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import SEO from '../components/SEO';
import { formatLuxuryText, formatPrice } from '../utils/formatters';
import { Room } from '../types';
import BookingStepper from '../components/BookingStepper';

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

const RoomCard: React.FC<{
  room: Room;
  wishlist: string[];
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
  onOpenGallery: (room: Room, index: number) => void;
  isAvailable?: boolean;
  selectedDates?: { checkIn: string; nights: number };
  viewMode?: 'grid' | 'list';
  discount?: number;
}> = ({ room, wishlist, onToggleWishlist, onOpenGallery, isAvailable = true, selectedDates, viewMode = 'list', discount = 0 }) => {
  const { config, getRoomMetrics } = useSite();
  const [searchParams] = useSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const metrics = useMemo(() => getRoomMetrics(room.id), [room.id, getRoomMetrics]);

  const roomImages = useMemo(() => {
    const gallery = room.images || [];
    const combined = [room.image, ...gallery.filter(img => img !== room.image)];
    return combined.filter(Boolean);
  }, [room.image, room.images]);

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (roomImages.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % roomImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [roomImages.length, isPaused]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % roomImages.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length);
  };

  const discountedPrice = discount > 0 ? room.price * (1 - discount) : room.price;

  if (viewMode === 'grid') {
    return (
      <div className="group bg-white border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col relative animate-fade-in">
        <div
          className="w-full aspect-[16/10] relative overflow-hidden group/image cursor-pointer"
          onClick={() => onOpenGallery(room, currentImageIndex)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex h-full w-full transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
            {roomImages.map((src, idx) => (
              <div key={idx} className="w-full h-full shrink-0">
                <img src={src} alt={`${room.name} ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {roomImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); handlePrev(e); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover/image:opacity-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleNext(e); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover/image:opacity-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>
        <div className="p-8 flex flex-col flex-1">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-[10px] ${i < Math.floor(metrics.averageRating) ? 'text-gold' : 'text-gray-200'}`}>★</span>
            ))}
            <span className="text-[9px] font-black text-charcoal/40 uppercase ml-2 tracking-widest">{metrics.reviewCount} Reviews</span>
          </div>
          {room.roomCode && <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-1">CODE: {room.roomCode}</span>}
          <Link to={`/rooms/${room.id}`}>
            <h3 className="text-xl font-black text-charcoal uppercase tracking-tighter hover:text-gold transition-colors font-serif mb-3 leading-tight">{room.name}</h3>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[9px] font-black uppercase tracking-widest text-charcoal/40 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              {room.bedType || '1 King'}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-charcoal/40 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              {room.guests.split(' ')[0]} Guests
            </span>
          </div>
          <div className="mt-auto pt-6 border-t border-gray-50 flex items-end justify-between">
            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Price / Night</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-charcoal font-serif">{formatPrice(discountedPrice, config.currency)}</span>
                {discount > 0 && <span className="text-xs text-gray-400 line-through">{formatPrice(room.price, config.currency)}</span>}
              </div>
            </div>
            <Link
              to={isAvailable ? `/checkout?room=${room.id}&checkIn=${selectedDates?.checkIn}&nights=${selectedDates?.nights}` : '#'}
              className={`px-6 lg:px-10 py-3 lg:py-4 rounded-sm font-black uppercase tracking-widest text-[9px] lg:text-[11px] transition-all shadow-lg ${isAvailable ? 'bg-charcoal text-white hover:bg-gold' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              {isAvailable ? 'Book' : 'Full'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row relative mb-12 min-h-[460px] animate-fade-in">
      {/* Column 1: Carousel Image */}
      <div
        className="w-full md:w-[350px] lg:w-[450px] xl:w-[550px] shrink-0 relative overflow-hidden group/image cursor-pointer"
        onClick={() => onOpenGallery(room, currentImageIndex)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex h-full w-full transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
          {roomImages.map((src, idx) => (
            <div key={idx} className="w-full h-full shrink-0 aspect-[4/3] md:aspect-auto">
              <img
                src={src}
                alt={`${room.name} view ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {roomImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(e); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover/image:opacity-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(e); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all opacity-0 group-hover/image:opacity-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
      </div>

      {/* Column 2: Room Info */}
      <div className="flex-1 p-8 md:p-12 lg:p-16 xl:p-20 flex flex-col justify-center border-r border-gray-100">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-xs ${i < Math.floor(metrics.averageRating) ? 'text-gold' : 'text-gray-200'}`}>★</span>
          ))}
          <span className="text-[10px] font-black text-charcoal/40 uppercase ml-2 tracking-widest">
            {metrics.reviewCount} Reviews
          </span>
        </div>
        {room.roomCode && (
          <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-1 block">
            CODE: {room.roomCode}
          </span>
        )}
        <Link to={`/rooms/${room.id}`} className="block mb-4">
          <h3 className="text-2xl md:text-3xl lg:text-5xl font-black text-charcoal uppercase tracking-tighter hover:text-gold transition-colors font-serif">
            {room.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-lg line-clamp-3">
          {room.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          <div className="flex flex-col items-center gap-2 group/icon">
            <div className="w-10 h-10 flex items-center justify-center text-gray-400 group-hover/icon:text-gold transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 group-hover/icon:text-charcoal transition-colors">
              {room.bedType || '1 King Bed'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 group/icon">
            <div className="w-10 h-10 flex items-center justify-center text-gray-400 group-hover/icon:text-gold transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 group-hover/icon:text-charcoal transition-colors">
              {room.floor || 'Ground'} Floor
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 group/icon">
            <div className="w-10 h-10 flex items-center justify-center text-gray-400 group-hover/icon:text-gold transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 group-hover/icon:text-charcoal transition-colors">
              {room.guests.split(' ')[0]} Guests
            </span>
          </div>
        </div>
        <Link to={`/rooms/${room.id}`} className="mt-8 text-[10px] lg:text-[12px] font-black uppercase tracking-[0.2em] text-gold hover:text-charcoal transition-colors flex items-center gap-2 group/link">
          View Room Details
          <svg className="w-3 h-3 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>

      {/* Column 3: Price & Actions */}
      <div className="w-full md:w-[280px] lg:w-[380px] xl:w-[450px] shrink-0 p-8 md:p-12 lg:p-16 xl:p-20 flex flex-col items-center justify-center text-center bg-gray-50/30">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">From</span>
        <div className="flex flex-col items-center mb-1">
          {discount > 0 && (
            <span className="text-sm font-black text-gray-300 line-through mb-1">
              {formatPrice(room.price, config.currency)}
            </span>
          )}
          <span className="text-4xl md:text-5xl lg:text-7xl font-black text-charcoal font-serif tracking-tighter">
            {formatPrice(discountedPrice, config.currency)}
          </span>
          <span className="text-[10px] lg:text-[12px] font-black text-gray-400 uppercase tracking-widest mt-1">/ Night</span>
        </div>
        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-8 mt-2 line-clamp-2 px-4 leading-relaxed">
          INCLUDES {formatPrice(40, config.currency)} FEES, EXCLUDES TAXES
          <div className="text-gold mt-1">+ Free Reward</div>
        </div>

        <Link
          to={isAvailable ? `/checkout?room=${room.id}&checkIn=${selectedDates?.checkIn}&nights=${selectedDates?.nights}${searchParams.toString().replace(/checkIn=[^&]*&?/, '').replace(/nights=[^&]*&?/, '') ? `&${searchParams.toString().replace(/checkIn=[^&]*&?/, '').replace(/nights=[^&]*&?/, '')}` : ''}` : '#'}
          onClick={(e) => !isAvailable && e.preventDefault()}
          className={`w-full py-5 lg:py-8 rounded-sm font-black uppercase tracking-[0.2em] text-[10px] lg:text-[13px] transition-all shadow-xl flex items-center justify-center ${isAvailable
            ? 'bg-charcoal text-white hover:bg-gold active:scale-95'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed grayscale'
            }`}
        >
          {isAvailable ? 'View Offers' : 'Currently Reserved'}
        </Link>
      </div>
    </div>
  );
};

const Rooms: React.FC = () => {
  const { rooms, config, isGalleryActive, setIsGalleryActive, isRoomAvailable } = useSite();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Advanced Features State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [promoInput, setPromoInput] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'OFFER15') {
      setDiscount(0.15);
      alert('Promo code applied! 15% discount activated.');
    } else if (code === 'WELCOME') {
      setDiscount(0.1);
      alert('Promo code applied! 10% discount activated.');
    } else {
      setDiscount(0);
      alert('Invalid promo code.');
    }
  };
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(3000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [checkIn, setCheckIn] = useState<string>(() => {
    const param = searchParams.get('checkIn');
    if (param) return param.split('T')[0];
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    if (searchParams.get('openFilter') === 'true') {
      setIsFilterDrawerOpen(true);
      // Clean up the URL parameter but keep others
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openFilter');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [nights, setNights] = useState<number>(() => {
    const param = searchParams.get('nights');
    return param ? parseInt(param) : 1;
  });

  const isoCheckOut = useMemo(() => {
    const date = new Date(checkIn);
    date.setDate(date.getDate() + nights);
    return date.toISOString().split('T')[0];
  }, [checkIn, nights]);

  const [adults, setAdults] = useState<number>(() => {
    const param = searchParams.get('adults');
    return param ? parseInt(param) : 1;
  });

  const [children, setChildren] = useState<number>(() => {
    const param = searchParams.get('children');
    return param ? parseInt(param) : 0;
  });

  const [roomsCount, setRoomsCount] = useState<number>(() => {
    const param = searchParams.get('rooms');
    return param ? parseInt(param) : 1;
  });

  // Sync state with URL
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('checkIn', checkIn);
    newParams.set('nights', nights.toString());
    newParams.set('adults', adults.toString());
    newParams.set('children', children.toString());
    newParams.set('rooms', roomsCount.toString());
    setSearchParams(newParams, { replace: true });
  }, [checkIn, nights, adults, children, roomsCount]);

  const allAmenities = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach(room => room.amenities.forEach(a => {
      // Only add if it exists in the registry
      if (config.amenityDetails[a]) {
        set.add(a);
      }
    }));
    return Array.from(set).sort();
  }, [rooms, config.amenityDetails]);

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

      const guestCapacity = parseInt(room.guests) || 0;
      const guestMatch = guestCapacity >= (adults + children);

      return categoryMatch && priceMatch && amenitiesMatch && guestMatch;
    });
  }, [selectedCategories, priceRange, selectedAmenities, adults, children, rooms]);

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
    setPriceRange(3000);
    setSelectedAmenities([]);
    setCheckIn(new Date().toISOString().split('T')[0]);
    setNights(1);
  };

  const handleOpenGallery = (room: Room, index: number) => {
    setSelectedRoom(room);
    setGalleryIndex(index);
    setGalleryOpen(true);
    setIsGalleryActive(true);
  };

  const handleCloseGallery = () => {
    setGalleryOpen(false);
    setSelectedRoom(null);
    setIsGalleryActive(false);
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
      document.body.setAttribute('data-gallery-open', 'true');
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-gallery-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-gallery-open');
    };
  }, [galleryOpen]);

  return (
    <div className="pt-24 min-h-screen bg-background-light overflow-x-hidden">
      <div className="hidden md:block">
        <BookingStepper currentStep={2} onSearchClick={() => setIsFilterDrawerOpen(true)} />
      </div>

      {/* Booking Info Header */}
      <div className="bg-white border-b border-gray-100 mb-6">
        {/* Mobile View - Matches Reference Image */}
        <div className="md:hidden">
          <div className="px-6 py-5 border-t border-b border-gray-100 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-black text-charcoal tracking-wider uppercase flex-1 min-w-0">
              <span className="truncate">{new Date(checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
              <svg className="w-3 h-3 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <span className="truncate">{new Date(isoCheckOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
            </div>
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="p-2 -mr-2 text-charcoal hover:text-gold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-5 flex flex-wrap items-center gap-y-4 text-[11px] font-black text-charcoal tracking-wider uppercase border-b border-gray-100">
            <div className="flex items-center gap-2 pr-4 border-r border-gray-100 shrink-0">
              <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>{nights} {nights === 1 ? 'NIGHT' : 'NIGHTS'}</span>
            </div>
            <div className="flex items-center gap-3 pl-4">
              <svg className="w-5 h-5 text-charcoal shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="leading-tight">{roomsCount} {roomsCount === 1 ? 'ROOM' : 'ROOMS'}, {adults} {adults === 1 ? 'ADULT' : 'ADULTS'}, {children} {children === 1 ? 'CHILD' : 'CHILDREN'}</span>
            </div>
          </div>
        </div>

        {/* Desktop View - Kept for consistency */}
        <div className="hidden md:block">
          <div className="max-w-[1450px] mx-auto px-10 lg:px-16 py-4 lg:py-8 flex items-center justify-between gap-6 lg:gap-12 text-[10px] lg:text-[13px] font-black uppercase tracking-[0.2em] text-gray-500">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <span className="font-bold text-charcoal">{new Date(checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</span>
                <svg className="w-3 h-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                <span className="font-bold text-charcoal">{new Date(isoCheckOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-gold">🌙</span>
                <span className="text-charcoal">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div
                onClick={() => setIsFilterDrawerOpen(true)}
                className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 px-3 py-2 -mx-3 rounded-lg transition-all"
              >
                <span className="font-bold text-charcoal">{roomsCount === 1 ? '1 Room' : `${roomsCount} Rooms`}, {adults + children} {adults + children === 1 ? 'Guest' : 'Guests'}</span>
                <svg className="w-3.5 h-3.5 text-gold group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Promo Code</span>
              <div className="flex items-center border-b border-gray-200">
                <input
                  type="text"
                  placeholder="PROMO CODE"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                  className="py-1 px-2 outline-none focus:border-gold transition-colors text-[10px] w-40 placeholder:text-gray-300 bg-transparent"
                />
                <button
                  onClick={handleApplyPromo}
                  className="text-charcoal hover:text-gold transition-colors ml-2 font-black"
                >
                  APPLY
                </button>
              </div>
              {discount > 0 && <span className="text-[9px] text-green-600 font-black">-{discount * 100}% OFF</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1450px] mx-auto px-6 md:px-10 py-8">

        {/* Filter / View Toggle Bar */}
        <div className="flex items-center justify-between mb-8 pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-4 lg:px-10 py-2 lg:py-5 border border-charcoal text-charcoal text-[10px] lg:text-[13px] font-black uppercase tracking-wider hover:bg-charcoal hover:text-white transition-all active:scale-95 group"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              FILTER ROOMS
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 border transition-colors bg-white ${viewMode === 'grid' ? 'border-charcoal text-charcoal' : 'border-gray-100 text-charcoal/30 hover:border-gold'}`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" /></svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 border transition-colors bg-white ${viewMode === 'list' ? 'border-charcoal text-charcoal' : 'border-gray-100 text-charcoal/30 hover:border-gold'}`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" /></svg>
            </button>
          </div>
        </div>

        {/* Horizontal Category Navigation */}
        <div className="border-b border-gray-100 flex items-center gap-8 lg:gap-16 mb-12 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategories([])}
            className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${selectedCategories.length === 0 ? 'text-charcoal border-b-2 border-gold -mb-[2px]' : 'text-gray-400 hover:text-charcoal'}`}
          >
            All
          </button>
          {config.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`pb-4 text-[11px] lg:text-[14px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${selectedCategories.includes(cat) ? 'text-charcoal border-b-2 border-gold -mb-[2px]' : 'text-gray-400 hover:text-charcoal'}`}
            >
              {cat}
            </button>
          ))}
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

        <div className="w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-10">
              {[1, 2, 3, 4].map(i => <RoomSkeleton key={i} />)}
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className={`grid gap-12 lg:gap-14 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  wishlist={wishlist}
                  onToggleWishlist={toggleWishlist}
                  onOpenGallery={handleOpenGallery}
                  isAvailable={isRoomAvailable(room.id, checkIn, isoCheckOut)}
                  selectedDates={{ checkIn, nights }}
                  viewMode={viewMode}
                  discount={discount}
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

      {/* Advanced Filter Sidebar */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[100] animate-fade-in flex justify-end">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm transition-opacity duration-500" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-white shadow-[-20px_0_50px_-12px_rgba(0,0,0,0.2)] animate-slide-in-right flex flex-col overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-black font-serif text-charcoal tracking-tight">Refine Experience</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Found {filteredRooms.length} Suites</p>
              </div>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-charcoal hover:bg-gray-100 hover:rotate-90 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12">
              {/* Dates & Schedule */}
              <div>
                <h3 className="text-gold text-[10px] font-black mb-6 uppercase tracking-[0.4em]">Stay Schedule</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 group hover:border-gold/30 transition-all">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Arrival Date</label>
                    <input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm font-black text-charcoal cursor-pointer"
                    />
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 group hover:border-gold/30 transition-all">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Number of Nights</label>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setNights(Math.max(1, nights - 1))}
                        className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-charcoal hover:text-gold transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                      </button>
                      <span className="text-sm font-black text-charcoal">{nights}</span>
                      <button
                        onClick={() => setNights(nights + 1)}
                        className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-charcoal hover:text-gold transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Distribution */}
              <div>
                <h3 className="text-gold text-[10px] font-black mb-6 uppercase tracking-[0.4em]">Guest Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-[10px] font-black text-charcoal uppercase tracking-widest">Adults</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Ages 13+</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gold transition-colors">-</button>
                      <span className="text-xs font-black text-charcoal">{adults}</span>
                      <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gold transition-colors">+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-[10px] font-black text-charcoal uppercase tracking-widest">Children</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Ages 0-12</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gold transition-colors">-</button>
                      <span className="text-xs font-black text-charcoal">{children}</span>
                      <button onClick={() => setChildren(children + 1)} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gold transition-colors">+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-[10px] font-black text-charcoal uppercase tracking-widest">Rooms</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <button onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gold transition-colors">-</button>
                      <span className="text-xs font-black text-charcoal">{roomsCount}</span>
                      <button onClick={() => setRoomsCount(roomsCount + 1)} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gold transition-colors">+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suites Categories */}
              <div>
                <h3 className="text-gold text-[10px] font-black mb-6 uppercase tracking-[0.4em]">Suite Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {config.categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border text-center ${selectedCategories.includes(cat)
                        ? 'bg-charcoal border-charcoal text-white shadow-lg'
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gold/30'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">Investment Level</h3>
                  <span className="text-charcoal font-black text-xs">Max {formatPrice(priceRange, config.currency)}</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="3000"
                  step="50"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <div className="flex justify-between mt-2 text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                  <span>Minimum</span>
                  <span>Premium</span>
                </div>
              </div>

              {/* Premium Amenities */}
              <div>
                <h3 className="text-gold text-[10px] font-black mb-6 uppercase tracking-[0.4em]">Curated Amenities</h3>
                <div className="space-y-3">
                  {allAmenities.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`w-full px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border flex items-center justify-between ${selectedAmenities.includes(amenity)
                        ? 'bg-gold/5 border-gold/30 text-charcoal'
                        : 'bg-white border-gray-50 text-gray-300 hover:border-gold/10'
                        }`}
                    >
                      <span>{amenity}</span>
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedAmenities.includes(amenity) ? 'bg-gold scale-150' : 'bg-gray-100'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="p-8 border-t border-gray-100 bg-gray-50/50 space-y-4 shrink-0">
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full bg-charcoal text-white font-black py-5 rounded-xl shadow-xl hover:bg-gold transition-all uppercase tracking-[0.3em] text-[11px] active:scale-95"
              >
                Apply Selections
              </button>
              <button
                onClick={clearFilters}
                className="w-full text-gray-400 font-bold py-2 text-[10px] uppercase tracking-widest hover:text-charcoal transition-colors"
              >
                Reset All Criteria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Gallery Modal */}
      {galleryOpen && selectedRoom && createPortal(
        <div className="fixed inset-0 z-[10000] backdrop-blur-3xl flex flex-col animate-fade-in" style={{ backgroundColor: 'rgba(255, 255, 255, 0.99)' }}>
          {/* Compact Header for Mobile */}
          <div className="h-20 md:h-28 w-full px-4 md:px-10 flex items-center justify-between shrink-0 border-b border-gray-100">
            <button
              onClick={handleCloseGallery}
              className="flex items-center gap-2 md:gap-3 text-charcoal/40 hover:text-primary transition-all group"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-charcoal/10 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </div>
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">Back</span>
            </button>

            <div className="flex flex-col items-center">
              <h2 className="text-sm md:text-lg font-serif italic text-charcoal truncate max-w-[150px] md:max-w-none">{selectedRoom.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-px w-3 md:w-4 bg-gold/30" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gold">{galleryIndex + 1} / {galleryImages.length}</span>
                <span className="h-px w-3 md:w-4 bg-gold/30" />
              </div>
            </div>

            <button
              onClick={handleCloseGallery}
              className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-charcoal/10 flex items-center justify-center hover:bg-gray-50 transition-all text-charcoal/40 hover:text-charcoal"
            >
              <svg className="w-5 h-5 md:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <button
              onClick={handleGalleryPrev}
              className="absolute left-4 md:left-12 z-20 w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center border transition-all shadow-xl backdrop-blur-md bg-white/10 border-white/20 text-charcoal hover:bg-white hover:scale-110 active:scale-95"
              aria-label="Previous Image"
            >
              <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto overflow-hidden">
              <div
                className="flex h-full w-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${galleryIndex * 100}%)` }}
              >
                {galleryImages.map((src, idx) => (
                  <div key={idx} className="h-full w-full shrink-0 flex items-center justify-center p-4 md:p-8">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={src}
                        alt={`${selectedRoom.name} full view ${idx + 1}`}
                        className="max-w-full max-h-full md:max-h-[75vh] object-contain rounded-xl md:rounded-2xl shadow-2xl transition-all duration-700"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGalleryNext}
              className="absolute right-4 md:right-12 z-20 w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center border transition-all shadow-xl backdrop-blur-md bg-white/10 border-white/20 text-charcoal hover:bg-white hover:scale-110 active:scale-95"
              aria-label="Next Image"
            >
              <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Desktop Only Overlay */}
            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-12 z-30 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-2xl p-8 rounded-[2rem] border border-gray-100 shadow-2xl max-w-md pointer-events-auto transform transition-all duration-700 animate-slide-up">
                <p className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-3">{selectedRoom.category}</p>
                <h3 className="text-4xl font-black font-serif text-charcoal mb-4 leading-tight">{selectedRoom.name}</h3>
                <p className="text-gray-500 text-sm font-medium mb-6 leading-relaxed italic">
                  {selectedRoom.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {selectedRoom.amenities
                    .filter(a => config.amenityDetails[a]) // Filter valid amenities
                    .slice(0, 4).map(a => (
                      <span key={a} className="bg-background-light px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider text-charcoal/50 border border-gray-100">
                        {a}
                      </span>
                    ))}
                  {selectedRoom.amenities.filter(a => config.amenityDetails[a]).length > 4 && <span className="text-[10px] text-gray-300 font-bold self-center">+{selectedRoom.amenities.filter(a => config.amenityDetails[a]).length - 4}</span>}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div>
                    <p className="text-gold text-[9px] font-black uppercase tracking-widest mb-1">Reservation</p>
                    <p className="text-2xl font-black font-serif text-charcoal">{formatPrice(selectedRoom.price, config.currency)}</p>
                  </div>
                  <Link
                    to={`/checkout?room=${selectedRoom.id}${searchParams.toString() ? `&${searchParams.toString()}` : ''}`}
                    className="bg-primary text-white px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#6B006B] transition-all shadow-lg shadow-primary/20 active:scale-95"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Only Info Section - Below Image */}
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-5 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gold text-[8px] font-black uppercase tracking-[0.3em] mb-0.5">{selectedRoom.category}</p>
                <h3 className="text-xl font-black font-serif text-charcoal">{selectedRoom.name}</h3>
              </div>
              <div className="text-right">
                <p className="text-gold text-[8px] font-black uppercase tracking-widest mb-0.5">Rate</p>
                <p className="text-lg font-black font-serif text-charcoal">{formatPrice(selectedRoom.price, config.currency)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {selectedRoom.amenities
                .filter(a => config.amenityDetails[a])
                .slice(0, 3).map(a => (
                  <span key={a} className="bg-background-light px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider text-charcoal/50 border border-gray-100">
                    {a}
                  </span>
                ))}
              {selectedRoom.amenities.filter(a => config.amenityDetails[a]).length > 3 && <span className="text-[10px] text-gray-300 font-bold self-center">+{selectedRoom.amenities.filter(a => config.amenityDetails[a]).length - 3}</span>}
            </div>

            <Link
              to={`/checkout?room=${selectedRoom.id}${searchParams.toString() ? `&${searchParams.toString()}` : ''}`}
              className="block w-full bg-primary text-white text-center py-4 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-[0.98] transition-transform shadow-lg shadow-primary/10"
            >
              Check Out Now
            </Link>
          </div>

          {galleryImages.length > 1 && (
            <div className="h-32 md:h-40 w-full border-t border-gray-100 flex items-center justify-start md:justify-center p-4 md:p-6 gap-3 md:gap-5 overflow-x-auto shrink-0 no-scrollbar bg-white/95 backdrop-blur-md">
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
        </div>,
        document.body
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Rooms;
