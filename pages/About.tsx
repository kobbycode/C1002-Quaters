
import React, { useMemo } from 'react';
import { useSite } from '../context/SiteContext';
import SEO from '../components/SEO';
import { formatLuxuryText } from '../utils/formatters';

const About: React.FC = () => {
  const { config } = useSite();
  const { aboutPage } = config;

  const aboutSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": config.brand.name,
    "description": aboutPage.heroSubtitle,
    "url": window.location.origin + "/#/about",
    "logo": aboutPage.heroImage,
    "foundingDate": "1957",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Accra",
      "addressRegion": "Greater Accra",
      "addressCountry": "GH"
    }
  }), [config, aboutPage]);

  return (
    <div className="pt-24 min-h-screen bg-background-light">
      <SEO
        title="Our Story"
        description={`${config.brand.name} heritage and story. Discover how we've been defining Ghanaian luxury.`}
        schema={aboutSchema}
      />

      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: `linear-gradient(rgba(16, 25, 34, 0.6) 0%, rgba(16, 25, 34, 0.8) 100%), url("${aboutPage.heroImage}")`,
          }}
        />
        <div className="relative z-10 text-center px-6 max-w-4xl animate-fade-in">
          <span className="text-gold font-black uppercase tracking-[0.4em] text-xs mb-6 block">{aboutPage.heroSubtitle}</span>
          <h1 className="text-white text-5xl md:text-7xl font-serif mb-8 leading-tight">
            {formatLuxuryText(aboutPage.heroTitle)}
          </h1>
          <div className="w-24 h-px bg-gold/50 mx-auto"></div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-10 lg:px-40 bg-white">
        <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[4/5] bg-cover bg-center rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundImage: `url("${aboutPage.heritageImage}")` }} />
          </div>
          <div className="flex flex-col gap-8 order-1 lg:order-2">
            <span className="text-gold font-bold uppercase tracking-[0.4em] text-xs">Our Story</span>
            <h2 className="text-5xl md:text-6xl font-serif leading-tight text-charcoal">
              {formatLuxuryText(aboutPage.heritageTitle)}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed font-light">
              {aboutPage.heritageDescription1}
            </p>
            <p className="text-gray-600 text-lg leading-relaxed font-light">
              {aboutPage.heritageDescription2}
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div>
                <p className="text-4xl font-serif text-gold mb-1">{config.foundingYear}</p>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Founded in Accra</p>
              </div>
              <div>
                <p className="text-4xl font-serif text-gold mb-1">5★</p>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Ghanaian Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-10 lg:px-40 bg-cream">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <span className="text-gold font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Our Values</span>
          <h2 className="text-4xl md:text-5xl font-serif text-charcoal">
            {formatLuxuryText("The Pillars of *C1002*")}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {aboutPage.pillars.map((pillar, i) => (
            <div key={i} className="bg-white p-12 rounded-3xl border border-gray-100">
              <h3 className="text-2xl font-serif mb-4 text-charcoal">{pillar.title}</h3>
              <p className="text-gray-500 font-light">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
