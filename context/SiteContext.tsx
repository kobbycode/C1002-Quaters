
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, arrayUnion, writeBatch, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Room, SiteConfig, Booking, Review, PricingRule, Notification, Activity } from '../types';
import { EmailService } from '../utils/email-service';
import { PricingEngine } from '../utils/pricing-engine';
import { ROOMS as INITIAL_ROOMS } from '../constants';
import GlobalLoader from '../components/GlobalLoader';


interface SiteContextType {
  rooms: Room[];
  config: SiteConfig;
  bookings: Booking[];
  reviews: Review[];
  notifications: Notification[];
  activities: Activity[];
  loading: boolean;
  isGalleryActive: boolean;
  setIsGalleryActive: (active: boolean) => void;
  updateRooms: (rooms: Room[]) => void;
  updateRoom: (id: string, data: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  updateConfig: (config: SiteConfig) => void;
  addSubscriber: (email: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'date'>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  isRoomAvailable: (roomId: string, checkIn: string, checkOut: string) => boolean;
  updateBooking: (id: string, data: Partial<Booking>) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'date' | 'status'>) => Promise<void>;
  updateReview: (id: string, data: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  // New helpers
  logActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;

  sendEmail: (to: string[], subject: string, html: string) => Promise<void>;
  calculatePrice: (roomId: string, checkIn: Date, checkOut: Date) => ReturnType<typeof PricingEngine.calculatePrice>;
  addPricingRule: (rule: Omit<PricingRule, 'id'>) => void;
  deletePricingRule: (id: string) => void;
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
    { id: '5', label: 'Gym', path: '/gym' },
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
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15882.493649520443!2d-0.11681326442008882!3d5.622557404456953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf851356e9f1a7%3A0x6f9984999999999!2sOkpoi%20Gonno%2C%20Accra!5e0!3m2!1sen!2sgh!4v1715622000000!5m2!1sen!2sgh",
    coordinates: { lat: 5.626, lng: -0.106 }
  },
  gymPage: {
    heroSlides: [
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=2400",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=2400",
      "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&q=80&w=2400"
    ],
    heroTitle: "Elevate Your *Vitality*",
    heroSubtitle: "The Wellness Quarter",
    facilityTitle: "Designed for *Peak Performance*",
    facilitySubtitle: "The Facility",
    facilityQuote: "At C1002 Quarters, we believe physical excellence is a cornerstone of the luxury experience.",
    facilityDescription1: "Our Elite Fitness Center is curated for the global traveler who refuses to compromise on their wellness routine. Featuring a bespoke collection of Technogym™ equipment and Peloton™ cycles, every machine is positioned to offer views of our tranquil private gardens.",
    facilityDescription2: "Whether you seek a high-intensity cardio session or a mindful yoga flow, our climate-controlled environment provides the perfect backdrop for your transformation.",
    facilityImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200",
    amenities: [
      { title: "Smart Cardio", desc: "Integrated streaming and performance tracking on all cardio machines.", icon: "🏃" },
      { title: "Free Weights", desc: "Extensive range of premium dumbbells and Olympic lifting stations.", icon: "🏋️" },
      { title: "Private Yoga", desc: "Dedicated quiet space for stretching and guided meditation.", icon: "🧘" },
      { title: "Filtered Water", desc: "Artisanal alkaline water stations and chilled towels provided.", icon: "💧" },
      { title: "Digital Coaching", desc: "Interactive touchscreens with pre-loaded luxury workout routines.", icon: "📱" },
      { title: "Garden View", desc: "Floor-to-ceiling glass walls overlooking our lush botanic spaces.", icon: "🌿" }
    ]
  },
  homeExperience: [
    {
      title: "Butler Service",
      description: "Your own personal helper to make sure you have everything you need.",
      icon: "👔"
    },
    {
      title: "Great Food",
      description: "Enjoy traditional Ghanaian food made with fresh local ingredients.",
      icon: "🥘"
    },
    {
      title: "Quiet Spot",
      description: "Private gardens where you can relax and get away from the busy city.",
      icon: "🌿"
    }
  ],
  homePulse: {
    title: "The Accra *Style*",
    subtitle: "The Neighbourhood",
    description: "Perfectly placed in the nice area of Spintex, C1002 Quarters is your home in Ghana's busy capital.",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2400",
    pillars: [
      { title: "Artisanal Shopping", description: "Moments from the finest textile and craft markets of Spintex." },
      { title: "Coastal Proximity", description: "A short, luxury chauffeur drive to the golden sands of Labadi Beach." }
    ]
  },
  foundingYear: "1957",
  conciergePrompt: "You are the Elite Concierge for C1002 Quarters, a luxury hotel in Okpoi Gonno, Spintex Road, Accra. Be sophisticated, warm, and helpful. Use Ghanaian expressions like 'Akwaaba'. If asked for recommendations, use Google Maps grounding to find high-end spots near Spintex. Always provide links if available.",
  adminEmails: ['admin@c1002quarters.com', 'reservations@c1002quarters.com.gh']
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with defaults so UI renders immediately (stale-while-revalidate strategy)
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGalleryActive, setIsGalleryActive] = useState(false);

  // Firestore Subscriptions
  useEffect(() => {
    let roomsLoaded = false;
    let configLoaded = false;
    let bookingsLoaded = false;
    let reviewsLoaded = false;
    let notificationsLoaded = false;
    let activitiesLoaded = false;

    // 1. Subscribe to Rooms
    const unsubscribeRooms = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      const roomData = snapshot.docs.map(doc => doc.data() as Room);
      if (roomData.length > 0) setRooms(roomData);
      roomsLoaded = true;
      if (configLoaded && bookingsLoaded && reviewsLoaded) setLoading(false);
    }, (error) => console.error("Error listening to rooms:", error));

    // 2. Subscribe to Settings/Config
    const unsubscribeConfig = onSnapshot(doc(db, 'settings', 'config'), (docSnap) => {
      if (docSnap.exists()) {
        // Merge Firestore config with defaults to preserve fields like heroSlides
        const firestoreConfig = docSnap.data() as SiteConfig;

        // Smarter merge for navLinks to ensure structural links like 'Gym' appear
        const mergedNavLinks = [...DEFAULT_CONFIG.navLinks];
        firestoreConfig.navLinks?.forEach(fLink => {
          const index = mergedNavLinks.findIndex(dLink => dLink.path === fLink.path);
          if (index > -1) {
            // Update fields but preserve default structure
            mergedNavLinks[index] = { ...mergedNavLinks[index], ...fLink };
          } else {
            mergedNavLinks.push(fLink);
          }
        });

        // Re-index all IDs to prevent React duplicate key errors from DB/Code collisions
        const finalNavLinks = mergedNavLinks.map((link, idx) => ({
          ...link,
          id: String(idx + 1)
        }));

        const mergedConfig = {
          ...DEFAULT_CONFIG,
          ...firestoreConfig,
          navLinks: finalNavLinks
        };

        setConfig(mergedConfig);
      }
      configLoaded = true;
      if (roomsLoaded && bookingsLoaded && reviewsLoaded) setLoading(false);
    }, (error) => console.error("Error listening to config:", error));

    // 3. Subscribe to Bookings
    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(bookingData);
      bookingsLoaded = true;
      if (roomsLoaded && configLoaded && reviewsLoaded) setLoading(false);
    }, (error) => console.error("Error listening to bookings:", error));

    // 4. Subscribe to Reviews
    const unsubscribeReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const reviewData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(reviewData);
      reviewsLoaded = true;
      if (roomsLoaded && configLoaded && bookingsLoaded && notificationsLoaded && activitiesLoaded) setLoading(false);
    }, (error) => console.error("Error listening to reviews:", error));

    // 5. Subscribe to Notifications
    const unsubscribeNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const notifData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(notifData);
      notificationsLoaded = true;
      if (roomsLoaded && configLoaded && bookingsLoaded && reviewsLoaded && activitiesLoaded) setLoading(false);
    }, (error) => console.error("Error listening to notifications:", error));

    // 6. Subscribe to Activities (Limit to recent ones)
    const unsubscribeActivities = onSnapshot(collection(db, 'activities'), (snapshot) => {
      const actData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setActivities(actData);
      activitiesLoaded = true;
      if (roomsLoaded && configLoaded && bookingsLoaded && reviewsLoaded && notificationsLoaded) setLoading(false);
    }, (error) => console.error("Error listening to activities:", error));

    return () => {
      unsubscribeRooms();
      unsubscribeConfig();
      unsubscribeBookings();
      unsubscribeReviews();
      unsubscribeNotifications();
      unsubscribeActivities();
    };
  }, []);

  const updateRooms = async (newRooms: Room[]) => {
    setRooms(newRooms);
    try {
      const batch = writeBatch(db);
      newRooms.forEach(room => {
        const ref = doc(db, 'rooms', room.id);
        batch.set(ref, room);
      });
      await batch.commit();
    } catch (err) { console.error("Failed to sync rooms:", err); }
  };

  const updateRoom = async (id: string, data: Partial<Room>) => {
    try {
      await updateDoc(doc(db, 'rooms', id), data);
      await logActivity({
        type: 'admin',
        action: 'Room Updated',
        details: `Updated room: ${data.name || id}`,
        metadata: { roomId: id, updates: data }
      });
    } catch (err) { console.error("Failed to update room:", err); }
  };

  const deleteRoom = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'rooms', id));
    } catch (err) { console.error("Failed to delete room:", err); }
  };

  const updateConfig = async (newConfig: SiteConfig) => {
    setConfig(newConfig);
    try {
      await setDoc(doc(db, 'settings', 'config'), newConfig);
      await logActivity({
        type: 'admin',
        action: 'Site Settings Updated',
        details: `Global configuration updated by admin`,
      });
    } catch (err) { console.error("Failed to sync config:", err); }
  };

  const addSubscriber = async (email: string) => {
    if (!config.newsletterSubscribers.includes(email)) {
      try {
        await updateDoc(doc(db, 'settings', 'config'), { newsletterSubscribers: arrayUnion(email) });
      } catch (err) { console.error("Failed to add subscriber:", err); }
    }
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'date'>) => {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        date: new Date().toISOString()
      });

      // Log activity and send notification
      await logActivity({
        type: 'booking',
        action: 'New Room Reservation',
        details: `${bookingData.guestName} booked ${bookingData.roomName}`,
        metadata: { roomId: bookingData.roomId, totalPrice: bookingData.totalPrice }
      });

      if (bookingData.guestId) {
        await addNotification({
          userId: bookingData.guestId,
          title: 'Booking Confirmed!',
          message: `Akwaaba, ${bookingData.guestName.split(' ')[0]}! Your reservation for ${bookingData.roomName} is confirmed for ${bookingData.checkInDate}.`,
          type: 'booking',
          link: '/profile'
        });
      }

      // Send confirmation email
      try {
        const fullBooking: Booking = {
          id: docRef.id,
          ...bookingData,
          date: new Date().toISOString(),
          // Default values if missing
          paymentStatus: bookingData.paymentStatus || 'pending',
          paymentMethod: bookingData.paymentMethod || 'cash'
        } as Booking;

        await EmailService.sendBookingConfirmation(fullBooking, config);
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }
    } catch (err) {
      console.error("Failed to add booking:", err);
      throw err;
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (err) {
      console.error("Failed to delete booking:", err);
      throw err;
    }
  };

  const updateBooking = async (id: string, data: Partial<Booking>) => {
    try {
      await updateDoc(doc(db, 'bookings', id), data);

      // Check if payment was just completed and send receipt
      const booking = bookings.find(b => b.id === id);
      if (booking && booking.paymentStatus !== 'paid' && data.paymentStatus === 'paid') {
        try {
          const updatedBooking = { ...booking, ...data };
          await EmailService.sendPaymentReceipt(updatedBooking, config);

          await logActivity({
            type: 'payment',
            action: 'Payment Confirmed',
            details: `Payment of ${updatedBooking.totalPrice} for ${updatedBooking.roomName} confirmed.`,
            metadata: { bookingId: id, reference: updatedBooking.paymentReference }
          });
        } catch (emailErr) {
          console.error("Failed to send payment receipt:", emailErr);
        }
      }
    } catch (err) {
      console.error("Failed to update booking:", err);
      throw err;
    }
  };
  const addReview = async (reviewData: Omit<Review, 'id' | 'date' | 'status'>) => {
    try {
      await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        date: new Date().toISOString(),
        status: 'pending'
      });
    } catch (err) {
      console.error("Failed to add review:", err);
      throw err;
    }
  };

  const updateReview = async (id: string, data: Partial<Review>) => {
    try {
      await updateDoc(doc(db, 'reviews', id), data);
    } catch (err) {
      console.error("Failed to update review:", err);
      throw err;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (err) {
      console.error("Failed to delete review:", err);
      throw err;
    }
  };

  const isRoomAvailable = (roomId: string, checkIn: string, checkOut: string) => {
    return !bookings
      .filter(b => b.roomId === roomId)
      .some(b => {
        // Fallback for older bookings that don't have isoCheckIn/isoCheckOut
        const bStart = b.isoCheckIn || (b.checkInDate ? new Date(b.checkInDate).toISOString().split('T')[0] : null);
        const bEnd = b.isoCheckOut || (b.checkOutDate ? new Date(b.checkOutDate).toISOString().split('T')[0] : null);

        if (!bStart || !bEnd || bStart === 'Invalid Date' || bEnd === 'Invalid Date') return false;

        // Overlap logic: (StartA < EndB) && (EndA > StartB)
        return checkIn < bEnd && checkOut > bStart;
      });
  };

  const sendEmail = async (to: string[], subject: string, html: string) => {
    // This is a helper if components want to send ad-hoc emails via the service
    // In reality, most emails are triggered via addBooking/updateBooking using EmailService directly
    await addDoc(collection(db, 'mail'), {
      to,
      message: {
        subject,
        html,
        text: html.replace(/<[^>]*>?/gm, '') // Basic text fallback
      },
      createdAt: Timestamp.now()
    });
  };

  const calculatePrice = (roomId: string, checkIn: Date, checkOut: Date) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) throw new Error('Room not found');
    return PricingEngine.calculatePrice(room, checkIn, checkOut, config.pricingRules || []);
  };

  const addPricingRule = (rule: Omit<PricingRule, 'id'>) => {
    const newRule: PricingRule = { ...rule, id: Math.random().toString(36).substr(2, 9) };
    const currentRules = config.pricingRules || [];
    updateConfig({ ...config, pricingRules: [...currentRules, newRule] });
  };

  const deletePricingRule = (id: string) => {
    const currentRules = config.pricingRules || [];
    updateConfig({ ...config, pricingRules: currentRules.filter(r => r.id !== id) });
  };

  const logActivity = async (activityData: Omit<Activity, 'id' | 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'activities'), {
        ...activityData,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  };

  const addNotification = async (notifData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notifData,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to add notification:", err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  return (
    <SiteContext.Provider value={{
      rooms,
      config,
      bookings,
      reviews,
      notifications,
      activities,
      loading,
      isGalleryActive,
      setIsGalleryActive,
      updateRooms,
      updateRoom,
      deleteRoom,
      updateConfig,
      addSubscriber,
      addBooking,
      deleteBooking,
      isRoomAvailable,
      updateBooking,
      addReview,
      updateReview,
      deleteReview,
      sendEmail,
      calculatePrice,
      addPricingRule,
      deletePricingRule,
      logActivity,
      markNotificationRead,
      addNotification
    }}>
      {loading ? <GlobalLoader /> : children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used within a SiteProvider');
  return context;
};
