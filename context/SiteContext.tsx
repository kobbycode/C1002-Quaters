
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Room, SiteConfig, Booking } from '../types';
import { ROOMS as INITIAL_ROOMS } from '../constants';
import GlobalLoader from '../components/GlobalLoader';

interface SiteContextType {
  rooms: Room[];
  config: SiteConfig;
  loading: boolean;
  updateRooms: (rooms: Room[]) => void;
  updateConfig: (config: SiteConfig) => void;
  addSubscriber: (email: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'date'>) => void;
}

const DEFAULT_CONFIG: SiteConfig = {
  brand: {
    name: "C1002 Quarters",
    tagline: "Accra's Best Place to Stay",
    primaryColor: "#8B008B",
    accentColor: "#8B008B",
    voice: "Regal & Sophisticated",
    socials: {
      instagram: "@c1002quarters",
      linkedin: "c1002-quarters-accra"
    }
  },
  navLinks: [
    { id: '1', label: 'About', path: '/about' },
    { id: '2', label: 'Rooms', path: '/rooms' },
    { id: '3', label: 'Amenities', path: '/amenities' },
    { id: '4', label: 'Contact', path: '/contact' }
  ],
  footer: {
    aboutText: "Modern comfort in the heart of Accra. Experience the Landmark of Distinction.",
    address: "Market High Street, 33, GZ-121-1024",
    phone: "+233243177596",
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
  // Initialize with defaults so UI renders immediately (stale-while-revalidate strategy)
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // Firestore Subscriptions
  useEffect(() => {
    let roomsLoaded = false;
    let configLoaded = false;

    // 1. Subscribe to Rooms
    const unsubscribeRooms = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      const roomData = snapshot.docs.map(doc => doc.data() as Room);
      // Only update if we actually have data (prevents clearing defaults if DB is empty)
      if (roomData.length > 0) {
        setRooms(roomData);
      }
      roomsLoaded = true;
      if (configLoaded) setLoading(false);
    }, (error) => {
      console.error("Error listening to rooms:", error);
      roomsLoaded = true;
      if (configLoaded) setLoading(false);
    });

    // 2. Subscribe to Settings/Config
    const unsubscribeConfig = onSnapshot(doc(db, 'settings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data() as SiteConfig);
      }
      configLoaded = true;
      if (roomsLoaded) setLoading(false);
    }, (error) => {
      console.error("Error listening to config:", error);
      configLoaded = true;
      if (roomsLoaded) setLoading(false);
    });

    return () => {
      unsubscribeRooms();
      unsubscribeConfig();
    };
  }, []);

  // Write Functions
  const updateRooms = async (newRooms: Room[]) => {
    // Optimistic update
    setRooms(newRooms);

    // Write each room to Firestore
    try {
      const batch = writeBatch(db);
      newRooms.forEach(room => {
        const ref = doc(db, 'rooms', room.id);
        batch.set(ref, room);
      });
      await batch.commit();
    } catch (err) {
      console.error("Failed to sync rooms:", err);
      // Revert/Fetch logic could go here, but listener usually handles correction associated errors
    }
  };

  const updateConfig = async (newConfig: SiteConfig) => {
    // Optimistic update
    setConfig(newConfig);

    // Write to Firestore
    try {
      await setDoc(doc(db, 'settings', 'config'), newConfig);
    } catch (err) {
      console.error("Failed to sync config:", err);
    }
  };

  const addSubscriber = async (email: string) => {
    if (!config.newsletterSubscribers.includes(email)) {
      // Optimistic update not strictly necessary if listener is fast, but good for UI
      // However, for arrayUnion, best to let Firestore handle the unique generic add
      try {
        await updateDoc(doc(db, 'settings', 'config'), {
          newsletterSubscribers: arrayUnion(email)
        });
      } catch (err) {
        console.error("Failed to add subscriber:", err);
      }
    }
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'date'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `BK-${Date.now()}`,
      date: new Date().toISOString()
    };

    // Note: In a real app, bookings might be a subcollection. 
    // Here we are keeping the existing structure where bookings are part of the 'config' object array.
    try {
      await updateDoc(doc(db, 'settings', 'config'), {
        bookings: arrayUnion(newBooking)
      });
    } catch (err) {
      console.error("Failed to add booking:", err);
    }
  };

  return (
    <SiteContext.Provider value={{ rooms, config, loading, updateRooms, updateConfig, addSubscriber, addBooking }}>
      {loading ? <GlobalLoader /> : children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used within a SiteProvider');
  return context;
};
