
import React, { useState } from 'react';
import { useSite } from '../context/SiteContext';
import { formatLuxuryText } from '../utils/formatters';

const Contact: React.FC = () => {
  const { config } = useSite();
  const { contactPage } = config;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const whatsappNumber = config.footer.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello%20C1002%20Quarters%2C%20Akwaaba!%20I'm%20visiting%20the%20contact%20page%20and%20would%20like%20to%20speak%20with%20a%20concierge.`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  return (
    <div className="pt-24 min-h-screen bg-background-light">
      <div className="w-full h-[450px] relative bg-gray-100 overflow-hidden border-b border-gray-100">
        <iframe
          title="C1002 Quarters Location"
          src={contactPage.mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale-[20%] opacity-90 hover:grayscale-0 transition-all duration-700"
        ></iframe>

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-100 max-w-sm text-center transform -translate-y-8 animate-fade-in pointer-events-auto">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-black text-xl mb-1 font-serif">{config.brand.name}</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{config.footer.address}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <div className="mb-10">
              <span className="text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Visit Us</span>
              <h1 className="text-5xl font-black font-serif mb-6 leading-tight text-charcoal">
                {formatLuxuryText(contactPage.heroTitle)}
              </h1>
              <p className="text-gray-600 text-lg mb-10 font-light leading-relaxed">
                {contactPage.heroDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-12">
              <div className="group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">Our Location</p>
                </div>
                <p className="text-xl font-bold text-charcoal pl-12 group-hover:text-primary transition-colors">{config.footer.address}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-gray-100 pt-10 pl-12">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-3">Concierge 24/7</p>
                    <a href={`tel:${config.footer.phone.replace(/\s/g, '')}`} className="text-xl font-black text-primary hover:text-blue-600 transition-colors flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {config.footer.phone}
                    </a>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit flex items-center gap-3 bg-[#25D366]/10 text-[#25D366] px-5 py-3 rounded-xl font-black uppercase tracking-[0.1em] text-[10px] hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.134.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    WhatsApp Chat
                  </a>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-3">Reservations</p>
                  <p className="text-lg font-black text-charcoal hover:text-gold transition-colors cursor-pointer">{config.footer.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-50 relative overflow-hidden flex flex-col group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700"></div>

            {!isSubmitted ? (
              <>
                <div className="mb-10 relative z-10">
                  <h3 className="text-3xl font-black font-serif mb-3 text-charcoal">Akwaaba!</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Planning a stay or hosting an event? Share your details and our guest services team will reach out within one business day.
                  </p>
                </div>
                <form className="space-y-6 flex-1 relative z-10" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="relative">
                      <input required type="text" className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium placeholder:text-gray-300 transition-all outline-none" placeholder="Full Name" />
                    </div>
                    <div className="relative">
                      <input required type="email" className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium placeholder:text-gray-300 transition-all outline-none" placeholder="Email Address" />
                    </div>
                    <div className="relative">
                      <textarea required rows={4} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium placeholder:text-gray-300 transition-all resize-none outline-none" placeholder="How can we assist your stay?" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative w-full bg-charcoal hover:bg-primary text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-charcoal/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group/btn"
                  >
                    <div className={`flex items-center justify-center gap-3 transition-all duration-300`}>
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sending Request...</span>
                        </>
                      ) : (
                        <span>Send Inquiry</span>
                      )}
                    </div>
                  </button>
                  <p className="text-[10px] text-center text-gray-300 uppercase tracking-widest font-bold">Secure & Confidential</p>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in py-12 relative z-10">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-4xl font-black font-serif mb-4 text-charcoal">Akwaaba!</h2>
                <p className="text-gray-400 text-sm mb-12 max-w-xs mx-auto leading-relaxed">
                  Your message has been received with warmth. Our team will contact you shortly to ensure your requirements are met.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-primary text-white font-black py-5 px-12 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/30 transition-all hover:bg-blue-600"
                >
                  Return to Form
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
