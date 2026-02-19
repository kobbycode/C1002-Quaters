import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import SEO from '../components/SEO';
import { formatLuxuryText, formatPrice } from '../utils/formatters';

const Home: React.FC = () => {
  const { config, rooms } = useSite();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = config.heroSlides;
  const featuredSuites = useMemo(() => rooms.slice(0, 3), [rooms]);

  const today = new Date().toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [booking, setBooking] = useState({
    checkIn: today,
    checkOut: threeDaysLater,
    guests: '2 Adults'
  });

  const nextSlide = useCallback(() => {
    if (isTransitioning || slides.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || slides.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/rooms?checkIn=${booking.checkIn}&checkOut=${booking.checkOut}&guests=${booking.guests}`);
  };

  const homeSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": config.brand.name,
    "description": "Premium luxury hotel and suites located in Accra. Experience the finest Ghanaian hospitality.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config.footer.address,
      "addressLocality": "Accra",
      "addressRegion": "Greater Accra",
      "addressCountry": "GH"
    },
    "telephone": config.footer.phone,
    "starRating": {
      "@type": "Rating",
      "ratingValue": "5"
    },
    "url": window.location.origin
  }), [config]);

  return (
    <div className="flex flex-col bg-[#FDFDFD]">
      <SEO
        title={`${config.brand.name} | Luxury Suites in Accra`}
        description={`${config.brand.name} - ${config.brand.tagline}. Premium suites and authentic Ghanaian luxury.`}
        type="hotel"
        schema={homeSchema}
      />

      {/* Hero Section */}
      <section
        className="relative h-[85vh] md:h-[90vh] min-h-[600px] md:min-h-[700px] w-full flex bg-charcoal overflow-hidden"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          (e.currentTarget as any).touchStartX = touch.clientX;
        }}
        onTouchEnd={(e) => {
          const touchStartX = (e.currentTarget as any).touchStartX;
          const touchEndX = e.changedTouches[0].clientX;
          const diff = touchStartX - touchEndX;

          if (Math.abs(diff) > 50) { // Threshold for swipe
            if (diff > 0) nextSlide();
            else prevSlide();
          }
        }}
      >
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentSlide
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-110 pointer-events-none'
                }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%), url("${slide.image}")`,
                }}
              />

              <div className="relative h-full w-full flex flex-col items-center justify-center text-center px-6 z-10">
                <div className={`max-w-5xl transition-all duration-1000 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
                    <div className="h-px w-8 md:w-12 bg-white/50" />
                    <span className="text-white font-black uppercase tracking-[0.4em] text-[11px] md:text-xs">
                      {slide.subtitle}
                    </span>
                    <div className="h-px w-8 md:w-12 bg-white/50" />
                  </div>
                  <h1 className="text-white text-4xl md:text-6xl lg:text-8xl font-serif mb-6 md:mb-8 leading-[1.05] drop-shadow-2xl">
                    {formatLuxuryText(slide.title)}
                  </h1>
                  <p className="text-white/80 text-[13px] md:text-lg lg:text-xl font-light mb-8 md:mb-12 tracking-wide max-w-2xl mx-auto leading-relaxed italic opacity-90">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                    <Link
                      to="/rooms"
                      className="h-12 md:h-16 px-8 md:px-12 flex items-center rounded-lg bg-white text-charcoal font-black text-[11px] hover:bg-gold hover:text-white transition-all shadow-2xl uppercase tracking-[0.2em] active:scale-95 relative z-20"
                    >
                      Browse Rooms
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 px-10 hidden lg:flex justify-between pointer-events-none">
            <button onClick={prevSlide} className="w-16 h-16 rounded-full border border-white/10 bg-black/5 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-charcoal transition-all pointer-events-auto group" aria-label="Previous Slide">
              <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextSlide} className="w-16 h-16 rounded-full border border-white/10 bg-black/5 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-charcoal transition-all pointer-events-auto group" aria-label="Next Slide">
              <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}


      </section>

      {/* Booking Bar - Integrated */}
      <div className="relative z-30 -translate-y-1/2 px-4 md:px-10 lg:px-40">
        <form onSubmit={handleSearch} className="bg-white rounded-[2rem] md:rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] p-4 md:p-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 md:gap-4 w-full max-w-7xl mx-auto border border-gray-50/50 backdrop-blur-sm bg-white/95">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
            <div className="px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50/50 sm:bg-transparent hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-gold mb-1 md:mb-2 flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Arrival
              </p>
              <input type="date" value={booking.checkIn} onChange={(e) => setBooking({ ...booking, checkIn: e.target.value })} className="w-full border-none p-0 bg-transparent focus:ring-0 font-bold text-charcoal text-sm" aria-label="Check-in Date" />
            </div>
            <div className="px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50/50 sm:bg-transparent hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 sm:border-l sm:border-gray-100">
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-gold mb-1 md:mb-2 flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Departure
              </p>
              <input type="date" value={booking.checkOut} onChange={(e) => setBooking({ ...booking, checkOut: e.target.value })} className="w-full border-none p-0 bg-transparent focus:ring-0 font-bold text-charcoal text-sm" aria-label="Check-out Date" />
            </div>
            <div className="px-5 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50/50 sm:bg-transparent hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 md:border-l md:border-gray-100 sm:col-span-2 md:col-span-1">
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-gold mb-1 md:mb-2 flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Guests
              </p>
              <select value={booking.guests} onChange={(e) => setBooking({ ...booking, guests: e.target.value })} className="w-full border-none p-0 bg-transparent focus:ring-0 font-bold text-charcoal text-sm appearance-none" aria-label="Number of Guests">
                <option>2 Adults</option>
                <option>1 Adult</option>
                <option>Large Group</option>
              </select>
            </div>
          </div>
          <button type="submit" className="lg:w-auto h-14 md:h-16 lg:h-20 px-8 md:px-12 rounded-xl bg-charcoal text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-gold transition-all touch-active active:scale-95 border border-white/5">
            Book Room
          </button>
        </form>
      </div>

      {/* Featured Collection Section */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-40 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-12 md:mb-20 animate-fade-in">
            <div className="max-w-2xl">
              <span className="text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-3 md:mb-4 block">Featured Rooms</span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-charcoal leading-[1.1]">
                {formatLuxuryText("Suites of *Style*")}
              </h2>
            </div>
            <Link to="/rooms" className="group flex items-center gap-3 md:gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-charcoal hover:text-gold transition-colors">
              View All
              <div className="w-8 md:w-12 h-px bg-charcoal group-hover:w-16 md:group-hover:w-20 group-hover:bg-gold transition-all" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredSuites.map((room, i) => (
              <div key={room.id} className={`group animate-fade-in transition-all duration-700`} style={{ animationDelay: `${i * 200}ms` }}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] mb-8 shadow-xl group-hover:shadow-2xl transition-all">
                  <img src={room.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={room.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-10 left-10 right-10 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-white text-sm font-light mb-6 leading-relaxed line-clamp-3 italic">"{room.description}"</p>
                    <Link to={`/rooms/${room.id}`} className="bg-white text-charcoal px-6 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-[11px] font-black uppercase tracking-widest hover:bg-gold hover:text-white transition-colors">View Room</Link>
                  </div>
                  <div className="absolute top-8 left-8">
                    <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-charcoal shadow-lg border border-white/20">
                      {room.category}
                    </span>
                  </div>
                </div>
                <div className="px-2">
                  <div className="flex justify-between items-start mb-3">
                    <Link to={`/rooms/${room.id}`} className="block group/title">
                      <h3 className="text-lg md:text-xl font-black font-serif text-charcoal group-hover/title:text-gold transition-colors">{room.name}</h3>
                    </Link>
                    <p className="text-lg md:text-xl font-bold text-gold font-serif">{formatPrice(room.price, config.currency)}</p>
                  </div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{room.size} — {room.view}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};
export default Home;
