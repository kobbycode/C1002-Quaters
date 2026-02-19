import React, { useState, useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import SEO from '../components/SEO';
import { formatLuxuryText } from '../utils/formatters';

const Gym: React.FC = () => {
    const { config } = useSite();
    const { gymPage } = config;
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = gymPage?.heroSlides || [
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=2400",
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=2400",
        "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&q=80&w=2400"
    ];

    useEffect(() => {
        if (!slides.length) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    if (!gymPage) return null;

    return (
        <div className="pt-24 min-h-screen bg-background-light">
            <SEO
                title="Elite Fitness Center"
                description={`Elevate your wellness at ${config.brand.name}. State-of-the-art gym facilities in the heart of Accra.`}
            />

            {/* Hero Section with Carousel */}
            <section className="relative h-[75vh] flex items-center justify-center overflow-hidden">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-[2000ms] ease-out-expo ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                            }`}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `linear-gradient(rgba(16, 25, 34, 0.4) 0%, rgba(16, 25, 34, 0.7) 100%), url("${slide}")`
                            }}
                        />
                    </div>
                ))}

                {/* Carousel Indicators */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`h-1 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-10 bg-gold' : 'w-4 bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl animate-fade-in">
                    <span className="text-gold font-black uppercase tracking-[0.5em] text-xs mb-6 block">{gymPage.heroSubtitle}</span>
                    <h1 className="text-white text-4xl md:text-6xl font-serif mb-8 leading-tight">
                        {formatLuxuryText(gymPage.heroTitle)}
                    </h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-px bg-gold/50"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500/50 blur-[2px]"></div>
                        <div className="w-12 h-px bg-gold/50"></div>
                    </div>
                </div>
            </section>

            {/* Facility Description */}
            <section className="py-24 px-6 md:px-10 lg:px-40 bg-white">
                <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
                    <div className="relative order-2 lg:order-1">
                        <div className="aspect-[4/5] bg-cover bg-center rounded-[3rem] shadow-2xl overflow-hidden group">
                            <img
                                src={gymPage.facilityImage}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                alt="Gym Equipment"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-10 order-1 lg:order-2">
                        <div className="space-y-4">
                            <span className="text-gold font-bold uppercase tracking-[0.4em] text-xs">{gymPage.facilitySubtitle}</span>
                            <h2 className="text-3xl md:text-5xl font-serif leading-tight text-charcoal">
                                {formatLuxuryText(gymPage.facilityTitle)}
                            </h2>
                        </div>
                        <p className="text-gray-500 text-xl leading-relaxed font-light italic">
                            "{gymPage.facilityQuote}"
                        </p>
                        <div className="space-y-6 text-gray-600 leading-relaxed text-lg font-light">
                            <p>{gymPage.facilityDescription1}</p>
                            <p>{gymPage.facilityDescription2}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-10 pt-8 border-t border-gray-100">
                            <div className="space-y-2">
                                <p className="text-2xl font-serif text-emerald-600">24/7</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Exclusive Access</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-serif text-emerald-600">Pro</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Personal Trainers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6 md:px-10 lg:px-40 bg-[#fafafa]">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <span className="text-gold font-bold uppercase tracking-[0.4em] text-xs">Curated Amenities</span>
                        <h2 className="text-3xl md:text-4xl font-serif text-charcoal">Everything You *Need*</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {gymPage.amenities.map((item, i) => (
                            <div key={i} className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 hover:-translate-y-2 transition-all duration-500 group">
                                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                                <h3 className="text-xl font-serif text-charcoal mb-4 italic font-bold">{item.title}</h3>
                                <p className="text-gray-500 font-light leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto space-y-10">
                    <div className="w-px h-20 bg-gradient-to-b from-transparent via-gold/50 to-transparent mx-auto" />
                    <h2 className="text-3xl md:text-5xl font-serif text-charcoal leading-tight">
                        Available as an addon during your *Suite Reservation*
                    </h2>
                    <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px]">Experience Excellence Daily</p>
                </div>
            </section>
        </div>
    );
};

export default Gym;
