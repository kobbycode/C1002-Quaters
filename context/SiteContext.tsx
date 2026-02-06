
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, SiteConfig, Booking } from '../types';
import { ROOMS as INITIAL_ROOMS } from '../constants';

interface SiteContextType {
  rooms: Room[];
  config: SiteConfig;
  updateRooms: (rooms: Room[]) => void;
  updateConfig: (config: SiteConfig) => void;
  addSubscriber: (email: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'date'>) => void;
}

const DEFAULT_CONFIG: SiteConfig = {
  brand: {
    name: "C1002 Quarters",
    tagline: "Accra's Best Place to Stay",
    primaryColor: "#137fec",
    accentColor: "#C5A059",
    voice: "Regal & Sophisticated",
    socials: {
      instagram: "@c1002quarters",
      linkedin: "c1002-quarters-accra"
    }
  },
  navLinks: [
    { id: '1', label: 'About', path: '/about' },
    { id: '2', label: 'Rooms', path: '/rooms' },
    { id: '3', label: 'Contact', path: '/contact' }
  ],
  footer: {
    aboutText: "Modern comfort in the heart of Accra. Experience the Landmark of Distinction.",
    address: "No. 12 Spintex Road, Accra, Ghana",
    phone: "+233 (0) 55 123 4567",
    email: "reservations@c1002quarters.com.gh"
  },
  categories: ['Deluxe', 'Executive', 'Presidential', 'Villa'],
  amenityDetails: {
    '65" Smart TV': { icon: 'tv', description: '4K resolution with pre-installed streaming services.', category: 'Entertainment & Tech' },
    'WiFi': { icon: 'wifi', description: 'High-speed fiber connectivity throughout the suite.', category: 'Entertainment & Tech' },
    'Office Desk': { icon: 'desk', description: 'Ergonomic workspace with integrated power outlets.', category: 'Entertainment & Tech' },
    'Nespresso Machine': { icon: 'coffee', description: 'Complimentary premium capsules replenished daily.', category: 'Comfort & Refreshment' },
    'Rain Shower': { icon: 'shower', description: 'Oversized rainfall fixture with adjustable pressure.', category: 'Bath & Refreshment' },
    'Butler Service': { icon: 'user', description: 'Personal attendant available 24/7 for all needs.', category: 'Service & Elite' },
    'Private Garden': { icon: 'leaf', description: 'Personal botanic space for meditation.', category: 'Comfort & Refreshment' }
  },
  newsletterSubscribers: [],
  heroSlides: [
    {
      id: '1',
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2400",
      subtitle: "Welcome to C1002",
      title: "Experience *the best of Accra*",
      description: "Great comfort in the heart of Ghana's capital. Where modern style meets tradition."
    },
    {
      id: '2',
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=2400",
      subtitle: "Coastal Style",
      title: "Feel *the history of Ghana*",
      description: "Enjoy your stay with us as we celebrate our rich Ghanaian heritage."
    }
  ],
  aboutPage: {
    heroTitle: "Accra's Landmark \n *of Distinction*",
    heroSubtitle: "The C1002 Quarters Story",
    heroImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2400",
    heritageTitle: "A Top Spot Since *1957*",
    heritageDescription1: "Founded in the year of Ghana's independence, C1002 Quarters began with a goal to create a world class place that honors the culture of Accra.",
    heritageDescription2: "Located in the heart of the city's Spintex district, we provide an experience that welcomes everyone, where every guest is treated as a friend.",
    heritageImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200",
    pillars: [
      { title: "True Akwaaba", description: "The warmest welcome in West Africa ensuring every stay is personal and memorable." },
      { title: "Accra Modern", description: "A blend of contemporary design with traditional Ghanaian craftsmanship." },
      { title: "Global Standards", description: "World class amenities and service protocols curated for the global traveler." }
    ]
  },
  contactPage: {
    heroTitle: "Connect With *Us*",
    heroDescription: "Experience the heart of Accra. Located in the quiet area of Okpoi Gonno, our place is perfect for both work and rest.",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15882.493649520443!2d-0.11681326442008882!3d5.622557404456953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf851356e9f1a7%3A0x6f9984999999999!2sOkpoi%20Gonno%2C%20Accra!5e0!3m2!1sen!2sgh!4v1715622000000!5m2!1sen!2sgh"
  },
  conciergePrompt: "You are the Elite Concierge for C1002 Quarters, a luxury hotel in Okpoi Gonno, Spintex Road, Accra. Be sophisticated, warm, and helpful. Use Ghanaian expressions like 'Akwaaba'. If asked for recommendations, use Google Maps grounding to find high-end spots near Spintex. Always provide links if available.",
  bookings: []
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('site_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [config, setConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('site_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('site_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('site_config', JSON.stringify(config));
  }, [config]);

  const updateRooms = (newRooms: Room[]) => setRooms(newRooms);
  const updateConfig = (newConfig: SiteConfig) => setConfig(newConfig);

  const addSubscriber = (email: string) => {
    if (!config.newsletterSubscribers.includes(email)) {
      setConfig(prev => ({
        ...prev,
        newsletterSubscribers: [...prev.newsletterSubscribers, email]
      }));
    }
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'date'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `BK-${Date.now()}`,
      date: new Date().toISOString()
    };
    setConfig(prev => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings]
    }));
  };

  return (
    <SiteContext.Provider value={{ rooms, config, updateRooms, updateConfig, addSubscriber, addBooking }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used within a SiteProvider');
  return context;
};
