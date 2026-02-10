import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { formatPrice } from '../utils/formatters';
import { Room } from '../types';

const Wishlist: React.FC = () => {
  const { rooms, config } = useSite();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('luxe_wishlist');
    if (saved) {
      setWishlistIds(JSON.parse(saved));
    }
    // Artificial delay for premium loading feel
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const wishlistRooms = useMemo(() => {
    return rooms.filter(room => wishlistIds.includes(room.id));
  }, [wishlistIds, rooms]);

  const removeFromWishlist = (id: string) => {
    const newWishlist = wishlistIds.filter(itemId => itemId !== id);
    setWishlistIds(newWishlist);
    localStorage.setItem('luxe_wishlist', JSON.stringify(newWishlist));
    // Dispatch storage event for same-tab Layout.tsx update if needed
    window.dispatchEvent(new Event('storage'));
  };

  if (isLoading) {
    return (
      <div className="pt-40 min-h-screen flex items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gold">Loading your rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-background-light">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-12">
          <div className="animate-fade-in">
            <span className="text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Your Saved Rooms</span>
            <h1 className="text-3xl md:text-5xl font-black font-serif text-charcoal mb-2">My Wishlist</h1>
            <p className="text-gray-400 text-sm font-medium tracking-wide">
              {wishlistRooms.length === 0
                ? "You haven't saved any rooms yet."
                : `You have ${wishlistRooms.length} room${wishlistRooms.length > 1 ? 's' : ''} saved for your next visit.`}
            </p>
          </div>
          {wishlistRooms.length > 0 && (
            <Link to="/rooms" className="text-primary text-xs font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
              Keep Exploring
            </Link>
          )}
        </div>

        {wishlistRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {wishlistRooms.map((room) => (
              <div key={room.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-gray-50 flex flex-col animate-fade-in">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  <button
                    onClick={() => removeFromWishlist(room.id)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all scale-100 hover:scale-110"
                    title="Remove from wishlist"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </button>
                  <div className="absolute top-4 left-4">
                    <span className="bg-charcoal/80 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white border border-white/10">
                      {room.category}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl md:text-2xl font-black font-serif group-hover:text-primary transition-colors leading-tight">
                      {room.name}
                    </h3>
                    <div className="flex items-center text-gold text-xs font-black">
                      ★ {room.rating}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-8 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] border-y border-gray-50 py-4">
                    <span className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      {room.size}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {room.view}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-[9px] uppercase font-black tracking-[0.2em] mb-1">Nightly</p>
                      <p className="text-xl md:text-2xl font-black text-charcoal font-serif">{formatPrice(room.price, config.currency)}</p>
                    </div>
                    <Link to={`/rooms/${room.id}`} className="bg-primary hover:bg-[#6B006B] text-white font-black py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all shadow-lg hover:shadow-primary/30 uppercase tracking-[0.2em] text-xs">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-20 md:p-32 text-center border border-gray-100 shadow-xl shadow-gray-200/50 animate-fade-in">
            <div className="w-32 h-32 bg-cream rounded-full flex items-center justify-center mx-auto mb-10 border border-gold/10">
              <svg className="w-12 h-12 text-gold/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-4xl font-black font-serif mb-4 md:mb-6 text-charcoal">No Saved Rooms Yet</h2>
            <p className="text-gray-400 text-sm md:text-lg mb-8 md:mb-12 max-w-lg mx-auto font-light leading-relaxed">
              Explore our beautiful rooms and save your favorites here to plan your perfect stay.
            </p>
            <Link
              to="/rooms"
              className="inline-flex items-center justify-center bg-charcoal text-white font-black px-6 md:px-12 py-3 md:py-5 rounded-2xl hover:bg-primary transition-all shadow-2xl uppercase tracking-[0.2em] text-xs"
            >
              Discover Our Rooms
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
