
export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviewsCount: number;
  size: string;
  guests: string;
  view: string;
  amenities: string[];
  category: string;
  isBestSeller?: boolean;
  isElite?: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  totalPrice: number;
  nights: number;
  date: string;
}

export interface NavLink {
  id: string;
  label: string;
  path: string;
}

export interface FooterConfig {
  aboutText: string;
  address: string;
  phone: string;
  email: string;
}

export interface AmenityDetail {
  icon: string;
  description: string;
  category: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  subtitle: string;
  title: string;
  description: string;
}

export interface SiteConfig {
  brand: {
    name: string;
    tagline: string;
    primaryColor: string;
    accentColor: string;
    voice: string;
    socials: {
      instagram: string;
      linkedin: string;
    };
  };
  navLinks: NavLink[];
  footer: FooterConfig;
  categories: string[];
  amenityDetails: Record<string, AmenityDetail>;
  newsletterSubscribers: string[];
  heroSlides: HeroSlide[];
  aboutPage: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    heritageTitle: string;
    heritageDescription1: string;
    heritageDescription2: string;
    heritageImage: string;
    pillars: { title: string; description: string }[];
  };
  contactPage: {
    mapEmbedUrl: string;
    heroTitle: string;
    heroDescription: string;
  };
  conciergePrompt: string;
  bookings: Booking[];
}
