
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import SEO from '../components/SEO';
import { formatLuxuryText } from '../utils/formatters';

const RoomDetailSkeleton: React.FC = () => (
  <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-6 animate-pulse">
    <div className="h-4 w-48 bg-gray-200 rounded mb-8" />
    <div className="h-[500px] w-full bg-gray-200 rounded-3xl mb-12" />
    <div className="flex flex-col lg:flex-row gap-16">
      <div className="flex-1">
        <div className="h-8 w-2/3 bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-5/6 bg-gray-100 rounded" />
        </div>
      </div>
      <aside className="w-full lg:w-[420px]">
        <div className="h-[400px] bg-gray-200 rounded-[2.5rem]" />
      </aside>
    </div>
  </div>
);

interface CalendarProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onSelect: (start: Date | null, end: Date | null) => void;
}

const Calendar: React.FC<CalendarProps> = ({ checkIn, checkOut, onSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    const selected = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) return;
    if (!checkIn || (checkIn && checkOut)) {
      onSelect(selected, null);
    } else if (checkIn && !checkOut) {
      if (selected <= checkIn) {
        onSelect(selected, null);
      } else {
        onSelect(checkIn, selected);
      }
    }
  };

  const isSelected = (day: number) => {
    const d = new Date(year, month, day);
    return (checkIn?.getTime() === d.getTime()) || (checkOut?.getTime() === d.getTime());
  };

  const isInRange = (day: number) => {
    if (!checkIn || !checkOut) return false;
    const d = new Date(year, month, day);
    return d > checkIn && d < checkOut;
  };

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} className="h-10" />);
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = date < today;
    days.push(
      <button
        key={d}
        onClick={() => handleDateClick(d)}
        disabled={isPast}
        className={`h-10 w-full flex items-center justify-center rounded-lg text-xs font-bold transition-all relative
          ${isPast ? 'text-gray-200 cursor-not-allowed' : 'text-charcoal hover:bg-gray-100'}
          ${isSelected(d) ? 'bg-gold !text-white shadow-lg z-10' : ''}
          ${isInRange(d) ? 'bg-gold/10 !text-gold rounded-none' : ''}
        `}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="p-4 bg-white select-none">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors" aria-label="Previous Month">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h4 className="font-black text-sm uppercase tracking-widest text-charcoal">{monthName} {year}</h4>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors" aria-label="Next Month">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="h-8 flex items-center justify-center text-[10px] font-black text-gray-300 uppercase tracking-tighter">{d}</div>
        ))}
        {days}
      </div>
    </div>
  );
};

const DEFAULT_AMENITY_ICONS: Record<string, React.ReactNode> = {
  '65" Smart TV': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  'WiFi': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>,
  'Office Desk': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  'Nespresso Machine': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  'Rain Shower': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387.477a6 6 0 01-3.86-.517" /></svg>,
};

const RoomDetail: React.FC = () => {
  const { rooms, config, loading } = useSite();
  const { id } = useParams<{ id: string }>();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [checkIn, setCheckIn] = useState<Date | null>(new Date());
  const [checkOut, setCheckOut] = useState<Date | null>(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));

  const room = rooms.find((r) => r.id === id);

  useEffect(() => {
    const saved = localStorage.getItem('luxe_wishlist');
    if (saved && id) {
      const wishlist = JSON.parse(saved);
      setIsWishlisted(wishlist.includes(id));
    }
  }, [id]);

  const toggleWishlist = () => {
    if (!id) return;
    const saved = localStorage.getItem('luxe_wishlist');
    let wishlist = saved ? JSON.parse(saved) : [];
    if (isWishlisted) wishlist = wishlist.filter((itemId: string) => itemId !== id);
    else wishlist.push(id);
    localStorage.setItem('luxe_wishlist', JSON.stringify(wishlist));
    setIsWishlisted(!isWishlisted);
    window.dispatchEvent(new Event('storage'));
  };

  const handleShare = async () => {
    if (!room) return;
    const shareData = {
      title: `C1002 Quarters ${room.name}`,
      text: `Experience unmatched Ghanaian luxury at C1002 Quarters in Accra. Check out the ${room.name}.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) { console.debug('Error sharing:', err); }
  };

  const whatsappNumber = config.footer.phone.replace(/\D/g, '');
  const whatsappUrl = room
    ? `https://wa.me/${whatsappNumber}?text=Hello%20C1002%20Quarters%2C%20I'm%20interested%20in%20booking%20the%20${encodeURIComponent(room.name)}.%20Can%20you%20help%20me%20with%20my%20reservation%3F`
    : `https://wa.me/${whatsappNumber}`;

  const galleryImages: string[] = useMemo(() => {
    if (!room) return [];
    // Use room.images if available, otherwise use default gallery images
    if (room.images && room.images.length > 0) {
      return room.images;
    }
    // Fallback to default gallery with room.image as first image
    // Always ensure we have at least the main image
    const defaultImages = [
      room.image,
      `https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=2000&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2000&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2000&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2000&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2000&auto=format&fit=crop`,
    ];
    return defaultImages.filter(Boolean); // Remove any undefined/null values
  }, [room]);

  const handleNext = useCallback(() => {
    if (galleryImages.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  }, [galleryImages.length]);

  const handlePrev = useCallback(() => {
    if (galleryImages.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsGalleryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isGalleryOpen]);

  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = 'hidden';
      // Reset to first image when opening gallery
      setCurrentIndex(0);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isGalleryOpen]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  }, [checkIn, checkOut]);

  const totalPrice = room ? room.price * nights : 0;
  const formatDate = (date: Date | null) => date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date) : 'Select Date';

  const categorizedAmenities: Record<string, string[]> = useMemo(() => {
    if (!room) return {};
    const groups: Record<string, string[]> = {};
    room.amenities.forEach((item) => {
      const detail = config.amenityDetails[item];
      const category = detail?.category || 'General';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    return groups;
  }, [room, config.amenityDetails]);

  const roomSchema = useMemo(() => {
    if (!room) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": room.name,
      "image": room.image,
      "description": room.description,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "GHS",
        "price": room.price,
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": room.rating,
        "reviewCount": room.reviewsCount
      }
    };
  }, [room]);

  if (!room) return <div className="pt-24 flex items-center justify-center min-h-[60vh] flex-col gap-4"><h2 className="text-3xl font-serif">Room not found.</h2><Link to="/rooms" className="text-primary font-bold hover:underline">Return to our rooms</Link></div>;

  return (
    <div className="pt-24 min-h-screen bg-background-light">
      <SEO
        title={room.name}
        description={room.description}
        image={room.image}
        type="hotel"
        schema={roomSchema}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-6">
        <div className="flex items-center gap-3 mb-8 text-xs font-bold uppercase tracking-widest text-gray-400">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <Link to="/rooms" className="hover:text-primary transition-colors">Rooms</Link>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="text-charcoal">{room.name}</span>
        </div>

        {/* Carousel */}
        <div className="relative mb-16 select-none group/gallery">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl shadow-2xl bg-charcoal">
            <div
              className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {galleryImages.map((src, idx) => (
                <div
                  key={idx}
                  className="relative h-full w-full shrink-0 cursor-zoom-in"
                  onClick={() => setIsGalleryOpen(true)}
                >
                  <img
                    src={src}
                    alt={`${room.name} interior detail view ${idx + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-scale duration-[2000ms] hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              ))}
            </div>

            {galleryImages.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 md:pl-6 opacity-0 group-hover/gallery:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-charcoal transition-all shadow-xl"
                    aria-label="Previous Image"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 md:pr-6 opacity-0 group-hover/gallery:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-charcoal transition-all shadow-xl"
                    aria-label="Next Image"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </>
            )}

            <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 flex items-center justify-between pointer-events-none">
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 md:gap-4 bg-black/30 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/10">
                  <span className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest">{currentIndex + 1} / {galleryImages.length}</span>
                  <span className="w-px h-3 bg-white/20"></span>
                  <span className="text-gold text-[9px] md:text-[10px] font-black uppercase tracking-widest">Gallery</span>
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setIsGalleryOpen(true); }}
                className="pointer-events-auto bg-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-charcoal text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-white transition-all shadow-2xl ml-auto"
              >
                {galleryImages.length > 1 ? 'Expand View' : 'View Image'}
              </button>
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-6 flex justify-center gap-3 overflow-x-auto no-scrollbar pb-2">
              {galleryImages.map((src, idx) => (
                <button
                  onClick={() => setCurrentIndex(idx)}
                  key={idx}
                  className={`relative h-20 aspect-video rounded-xl overflow-hidden shrink-0 transition-all duration-300 border-2 ${currentIndex === idx ? 'border-gold scale-105 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'
                    }`}
                  aria-label={`View Image ${idx + 1}`}
                >
                  <img src={src} alt="Room thumbnail" className="w-full h-full object-cover" loading="lazy" />
                  {currentIndex === idx && (
                    <div className="absolute inset-0 bg-gold/10" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            <div className="mb-12 border-b border-gray-100 pb-12">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-gold font-black text-[10px] uppercase tracking-[0.3em] border border-gold/30 px-3 py-1 rounded-full">{room.category}</span>
                    {room.isElite && <span className="bg-primary/10 text-primary font-black text-[10px] uppercase tracking-[0.3em] px-3 py-1 rounded-full">Luxury Room</span>}
                  </div>
                  <h1 className="text-5xl font-black font-serif text-charcoal mb-4">{room.name}</h1>
                  <div className="flex items-center gap-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2"><svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>{room.size}</span>
                    <span className="flex items-center gap-2"><svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>{room.guests}</span>
                    <span className="flex items-center gap-2"><svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{room.view}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-gold text-2xl font-bold mb-1">★★★★★</div>
                  <span className="text-sm font-black uppercase tracking-widest text-charcoal">{room.rating} <span className="text-gray-400 font-bold ml-1">/ {room.reviewsCount} Reviews</span></span>
                </div>
              </div>
              <p className="text-xl text-gray-500 leading-relaxed font-light italic">
                "{formatLuxuryText(room.description)}"
              </p>
            </div>

            <div className="mb-12">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-gold font-black uppercase tracking-[0.4em] text-[10px]">Great Comfort</span>
                <h3 className="text-3xl font-black font-serif text-charcoal">Room Features & Extras</h3>
              </div>

              <div className="space-y-16">
                {Object.entries(categorizedAmenities).map(([category, items]) => (
                  <div key={category} className="animate-fade-in group/category">
                    <div className="flex items-center gap-6 mb-10">
                      <h4 className="text-sm font-black text-charcoal uppercase tracking-[0.2em] whitespace-nowrap">{category}</h4>
                      <div className="h-[1px] flex-1 bg-gray-100 group-hover/category:bg-gold/30 transition-colors" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      {items.map((item, i) => {
                        const detail = config.amenityDetails[item];
                        return (
                          <div key={i} className="flex gap-6 group/item">
                            <div className="w-16 h-16 shrink-0 rounded-[1.25rem] bg-cream border border-gold/10 flex items-center justify-center text-gold transition-all duration-500 group-hover/item:bg-gold group-hover/item:text-white group-hover/item:shadow-xl group-hover/item:shadow-gold/20 group-hover/item:-translate-y-1">
                              {DEFAULT_AMENITY_ICONS[item] || (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex flex-col justify-center">
                              <p className="font-bold text-charcoal text-base mb-1 group-hover/item:text-primary transition-colors">{item}</p>
                              <p className="text-gray-400 text-xs leading-relaxed font-medium">
                                {detail?.description || 'Exclusive feature included with your suite reservation.'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
              <h3 className="text-2xl font-black font-serif mb-10">Guest Reviews</h3>
              <div className="flex flex-wrap gap-x-20 gap-y-12 items-center">
                <div className="flex flex-col items-center">
                  <p className="text-7xl font-black font-serif text-charcoal mb-2">{room.rating}</p>
                  <div className="text-gold mb-3 text-xl">★★★★★</div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black">Overall Rating</p>
                </div>
                <div className="flex-1 min-w-[300px] space-y-5">
                  {[94, 4, 1, 1, 0].map((p, i) => (
                    <div key={i} className="flex items-center gap-6">
                      <span className="text-[10px] font-black text-gray-300 w-4">{5 - i}</span>
                      <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${p}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-gray-300 w-10 text-right">{p}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="w-full lg:w-[420px]">
            <div className="sticky top-28 p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/60 overflow-hidden">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-1">Nightly rate</p>
                  <span className="text-4xl font-black text-charcoal font-serif">GH₵{room.price}</span>
                  <span className="text-gray-400 font-bold ml-1 text-sm">/ night</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 relative">
                <div className="grid grid-cols-2 border border-gray-100 rounded-2xl overflow-hidden shadow-sm relative z-20">
                  <button onClick={() => setShowCalendar(!showCalendar)} className="p-5 border-r border-gray-100 bg-white hover:bg-gray-50 transition-colors text-left">
                    <label className="text-[9px] uppercase font-black text-gold block mb-2 tracking-[0.2em] pointer-events-none">Check In</label>
                    <span className="text-sm font-black text-charcoal">{formatDate(checkIn)}</span>
                  </button>
                  <button onClick={() => setShowCalendar(!showCalendar)} className="p-5 bg-white hover:bg-gray-50 transition-colors text-left">
                    <label className="text-[9px] uppercase font-black text-gold block mb-2 tracking-[0.2em] pointer-events-none">Check Out</label>
                    <span className="text-sm font-black text-charcoal">{formatDate(checkOut)}</span>
                  </button>
                </div>
                {showCalendar && (
                  <div className="absolute top-[105%] left-0 right-0 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 animate-fade-in overflow-hidden">
                    <Calendar checkIn={checkIn} checkOut={checkOut} onSelect={(start, end) => { setCheckIn(start); setCheckOut(end); if (start && end) setShowCalendar(false); }} />
                    <div className="p-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/50">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{nights} Nights Selected</span>
                      <button onClick={() => setShowCalendar(false)} className="text-[10px] font-black text-primary uppercase tracking-widest">Apply Dates</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-8 border-t border-gray-100 mb-8">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-gray-400">GH₵{room.price} x {nights} night{nights !== 1 ? 's' : ''}</span>
                  <span className="text-charcoal">GH₵{totalPrice}.00</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-gray-400">Resort & Service fee</span>
                  <span className="text-charcoal">GH₵0.00</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                  <span className="text-charcoal font-black font-serif text-2xl">Total</span>
                  <span className="text-primary font-black font-serif text-2xl">GH₵{totalPrice}.00</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link to={`/checkout?room=${room.id}`} className="w-full flex items-center justify-center bg-primary hover:bg-[#6B006B] text-white font-black py-6 rounded-2xl shadow-xl shadow-primary/30 transition-all uppercase tracking-[0.3em] text-[10px]">Confirm Booking</Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-6 rounded-2xl bg-charcoal text-white font-black hover:bg-charcoal/90 transition-all uppercase tracking-[0.3em] text-[10px] shadow-xl"
                >
                  <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.134.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat with Concierge
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={toggleWishlist} className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all font-black uppercase tracking-[0.2em] text-[10px] ${isWishlisted ? 'border-gold text-gold bg-gold/5' : 'border-gray-100 text-gray-400 hover:border-gold hover:text-gold'}`}>
                    <svg className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    {isWishlisted ? 'Saved' : 'Save'}
                  </button>
                  <button onClick={handleShare} className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-gray-100 text-gray-400 hover:border-gold hover:text-gold transition-all font-black uppercase tracking-[0.2em] text-[10px]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    {isCopied ? 'Copied!' : 'Share'}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] bg-charcoal/98 backdrop-blur-xl flex flex-col animate-fade-in">
          <div className="h-24 w-full px-10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-10">
              <h2 className="text-white text-xl font-serif italic hidden md:block">{room.name}</h2>
              <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em]">{currentIndex + 1} <span className="text-white/30 mx-2">/</span> {galleryImages.length}</div>
            </div>
            <button onClick={() => setIsGalleryOpen(false)} className="group flex items-center gap-4 text-white hover:text-gold transition-all font-black uppercase tracking-[0.3em] text-[10px]">Close Gallery
              <div className="w-14 h-14 rounded-full border border-white/10 group-hover:border-gold/50 flex items-center justify-center transition-all bg-white/5 group-hover:bg-gold/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
            </button>
          </div>
          <div className="flex-1 relative flex items-center justify-center px-6 md:px-24 overflow-hidden">
            <button onClick={handlePrev} className="absolute left-6 md:left-12 z-20 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 transition-all shadow-2xl backdrop-blur-md" aria-label="Previous Image"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg></button>
            <div className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto overflow-hidden">
              <div
                className="flex h-full w-full transition-transform duration-500 ease out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {galleryImages.map((src, idx) => (
                  <div key={idx} className="h-full w-full shrink-0 flex items-center justify-center p-4">
                    <img src={src} alt={`${room.name} full view ${idx + 1}`} className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleNext} className="absolute right-6 md:right-12 z-20 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 transition-all shadow-2xl backdrop-blur-md" aria-label="Next Image"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg></button>
          </div>
          <div className="h-40 w-full bg-black/40 border-t border-white/5 flex items-center justify-center p-6 gap-5 overflow-x-auto shrink-0 no-scrollbar">
            {galleryImages.map((src, idx) => (
              <button key={idx} onClick={() => setCurrentIndex(idx)} className={`relative shrink-0 h-20 md:h-24 aspect-video rounded-xl overflow-hidden transition-all duration-500 border-2 ${currentIndex === idx ? 'border-gold scale-110 shadow-2xl opacity-100' : 'border-transparent opacity-30 hover:opacity-60 grayscale hover:grayscale-0'}`} aria-label={`Go to image ${idx + 1}`}>
                <img src={src} className="w-full h-full object-cover" alt="Preview" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default RoomDetail;
