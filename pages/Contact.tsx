import React, { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { formatLuxuryText } from '../utils/formatters';
import CustomMap from '../components/Map';

const Contact: React.FC = () => {
  const { config } = useSite();
  const { contactPage } = config;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const whatsappNumber = config.footer.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello%20${encodeURIComponent(config.brand.name)}%2C%20Obaake!%20I'm%20visiting%20the%20contact%20page%20and%20would%20like%20to%20speak%20with%20a%20concierge.`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  return (
    <div className="pt-20 min-h-screen bg-[#FDFCFB]">
      {/* Hero Section with Immersive Background */}
      <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-transparent to-[#FDFCFB] z-10" />
          <CustomMap
            center={[contactPage.coordinates?.lat || 5.626, contactPage.coordinates?.lng || -0.106]}
            title={config.brand.name}
            address={config.footer.address}
            className="h-full w-full opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
          />
        </div>

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto animate-slide-up-fade">
          <span className="inline-block text-gold font-black uppercase tracking-[0.6em] text-[10px] mb-6 px-4 py-1 border border-gold/20 rounded-full backdrop-blur-sm bg-white/10">
            Destination Accra
          </span>
          <h1 className="text-4xl md:text-7xl font-black font-serif mb-8 leading-tight text-charcoal tracking-tight">
            {formatLuxuryText(contactPage.heroTitle)}
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto italic">
            "{contactPage.heroDescription}"
          </p>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-6 -mt-24 pb-32 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Contact Details Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Location Card */}
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl border border-white/50 group hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500 shadow-inner">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-1">Our Residence</p>
                  <h3 className="text-xl font-black text-charcoal">The Landmark</h3>
                </div>
              </div>
              <p className="text-2xl font-serif text-charcoal/90 leading-snug mb-8">
                {config.footer.address}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.footer.address + ", Accra, Ghana")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-primary hover:text-gold transition-colors group/link"
              >
                <span>Find Us on Maps</span>
                <svg className="w-4 h-4 transform group-hover/link:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Concierge Card */}
              <div className="bg-charcoal p-8 rounded-[2rem] shadow-xl text-white group hover:bg-[#1A252E] transition-all">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold/60 mb-4 text-center">Concierge 24/7</p>
                <div className="text-center mb-6">
                  <a href={`tel:${config.footer.phone.replace(/\s/g, '')}`} className="text-xl font-black hover:text-gold transition-colors block mb-2">
                    {config.footer.phone}
                  </a>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all"
                >
                  <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.134.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  Quick Message
                </a>
              </div>

              {/* Reservations Card */}
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-4">Direct Inquiry</p>
                <div className="mb-6 w-full overflow-hidden">
                  <a href={`mailto:${config.footer.email}`} className="text-[11px] md:text-sm font-black text-charcoal hover:text-primary transition-colors block break-all">
                    {config.footer.email}
                  </a>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl border border-gray-50 relative overflow-hidden h-full flex flex-col justify-center">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-bl-full transform translate-x-32 -translate-y-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-tr-full transform -translate-x-24 translate-y-24" />

              {!isSubmitted ? (
                <div className="relative z-10">
                  <div className="mb-12">
                    <h2 className="text-3xl md:text-5xl font-black font-serif mb-6 text-charcoal">
                      Obaake!
                    </h2>
                    <p className="text-gray-500 text-base md:text-lg font-light leading-relaxed max-w-md">
                      Entrust us with your details. Our guest experience curators will design a response tailored to your unique requirements.
                    </p>
                  </div>

                  <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="relative group">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gold mb-2 block ml-1 opacity-0 group-focus-within:opacity-100 transition-opacity">Your Name</label>
                        <input
                          required
                          type="text"
                          className="w-full bg-gray-50/50 border-b-2 border-gray-100 py-4 px-1 focus:border-primary text-base font-serif transition-all outline-none bg-transparent placeholder:text-gray-300 placeholder:font-serif"
                          placeholder="What is your name?"
                        />
                      </div>
                      <div className="relative group">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gold mb-2 block ml-1 opacity-0 group-focus-within:opacity-100 transition-opacity">Email Address</label>
                        <input
                          required
                          type="email"
                          className="w-full bg-gray-50/50 border-b-2 border-gray-100 py-4 px-1 focus:border-primary text-base font-serif transition-all outline-none bg-transparent placeholder:text-gray-300 placeholder:font-serif"
                          placeholder="Where can we write to you?"
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gold mb-2 block ml-1 opacity-0 group-focus-within:opacity-100 transition-opacity">Message</label>
                      <textarea
                        required
                        rows={5}
                        className="w-full bg-gray-50/50 border-b-2 border-gray-100 py-4 px-1 focus:border-primary text-base font-serif transition-all outline-none bg-transparent placeholder:text-gray-300 placeholder:font-serif resize-none"
                        placeholder="Tell us about your plans..."
                      />
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group/btn relative w-full md:w-auto min-w-[280px] bg-charcoal hover:bg-primary text-white font-black py-6 px-12 rounded-2xl uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-charcoal/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-4 mt-4"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Submitting Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <span>Initiate Connection</span>
                            <svg className="w-4 h-4 transform group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in py-12 relative z-10">
                  <div className="w-24 h-24 bg-gold/10 text-gold rounded-full flex items-center justify-center mb-10 shadow-inner">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black font-serif mb-6 text-charcoal tracking-tight">Obaake!</h2>
                  <p className="text-gray-500 text-lg md:text-xl font-light mb-12 max-w-sm mx-auto leading-relaxed italic">
                    Your request has been ceremoniously received. We look forward to connecting with you.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:text-gold transition-colors border-b-2 border-primary/20 pb-2"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
