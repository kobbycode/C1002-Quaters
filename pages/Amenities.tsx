import React, { useMemo } from 'react';
import { useSite } from '../context/SiteContext';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { AmenityDetail } from '../types';
import { formatLuxuryText } from '../utils/formatters';


const DEFAULT_AMENITY_ICONS: Record<string, React.ReactNode> = {
  '65" Smart TV': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  'WiFi': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>,
  'Office Desk': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  'Nespresso Machine': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  'Rain Shower': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM4 10h16M10 4v16" /></svg>,
  'Butler Service': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  'Private Garden': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>,
};

const Amenities: React.FC = () => {
  const { config } = useSite();

  const categorizedAmenities = useMemo(() => {
    const groups: Record<string, (AmenityDetail & { name: string })[]> = {};
    Object.entries(config.amenityDetails).forEach(([name, details]) => {
      const d = details as AmenityDetail;
      const category = d.category || 'General';
      if (!groups[category]) groups[category] = [];
      groups[category].push({ name, ...d });
    });
    return groups;
  }, [config.amenityDetails]);

  return (
    <div className="pt-24 min-h-screen bg-background-light">
      <SEO
        title="Luxury Amenities"
        description={`Experience the finest luxury amenities at ${config.brand.name}, from 24/7 butler service to high-speed fiber WiFi.`}
      />

      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=2400"
            alt="Luxury Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 text-center px-6">
          <span className="text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">World Class Experience</span>
          <h1 className="text-4xl md:text-6xl font-black font-serif text-white mb-6">Unmatched *Comfort*</h1>
          <p className="text-white/70 text-sm md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Every detail at {config.brand.name} is curated for the modern traveler. From high-tech entertainment to restorative wellness features.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-20">
        <div className="space-y-24">
          {(Object.entries(categorizedAmenities) as [string, (AmenityDetail & { name: string })[]][]).map(([category, items]) => (
            <div key={category} className="animate-fade-in group">
              <div className="flex items-center gap-6 mb-12">
                <h2 className="text-xl md:text-2xl font-black text-charcoal font-serif uppercase tracking-wider">{category}</h2>
                <div className="h-[1px] flex-1 bg-gray-200 group-hover:bg-gold/30 transition-colors" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((amenity, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-gold/10 transition-all duration-500 hover:-translate-y-2 group/card">
                    <div className="w-16 h-16 rounded-2xl bg-cream border border-gold/10 flex items-center justify-center text-gold mb-6 group-hover/card:bg-gold group-hover/card:text-white transition-colors duration-500">
                      {DEFAULT_AMENITY_ICONS[amenity.name] || (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-charcoal mb-3 group-hover/card:text-primary transition-colors">{amenity.name}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                      {formatLuxuryText(amenity.description)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <section className="mt-32 p-10 md:p-20 bg-charcoal rounded-[3rem] relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 blur-[100px] rounded-full" />

          <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-black font-serif text-white mb-8 italic">Ready for the *{config.brand.name}* Experience?</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <Link
                to="/rooms"
                className="bg-primary hover:bg-[#6B006B] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl shadow-primary/40"
              >
                Explore Living Quarters
              </Link>
              <Link
                to="/contact"
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all backdrop-blur-md"
              >
                Inquire Directly
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Amenities;
