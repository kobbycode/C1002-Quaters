
export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[]; // Array of images for gallery view
  rating: number;
  reviewsCount: number;
  size: string;
  guests: string;
  view: string;
  amenities: string[];
  category: string;
  isBestSeller?: boolean;
  isElite?: boolean;
  maintenanceCost?: number; // Monthly maintenance cost
  operationalOverhead?: number; // % of price (e.g. 0.1 for 10%)
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
    coordinates?: { lat: number; lng: number };
  };
  gymPage: {
    heroSlides: string[];
    heroTitle: string;
    heroSubtitle: string;
    facilityTitle: string;
    facilitySubtitle: string;
    facilityQuote: string;
    facilityDescription1: string;
    facilityDescription2: string;
    facilityImage: string;
    amenities: { title: string; desc: string; icon: string }[];
  };
  homeExperience: {
    title: string;
    description: string;
    icon: string;
  }[];
  homePulse: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    pillars: { title: string; description: string }[];
  };
  foundingYear: string;
  conciergePrompt: string;
  currency?: string;
  timezone?: string;
  aiKnowledgeBase?: { question: string; answer: string; category?: string }[];
  aiLabInstructions?: string;
  pricingRules?: PricingRule[];
  adminEmails?: string[];

  // bookings: Booking[]; // Deprecated, moved to root collection
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  totalPrice: number;
  nights: number;
  date: string; // Booking creation date
  checkInDate: string;
  checkOutDate: string;
  isoCheckIn: string; // YYYY-MM-DD
  isoCheckOut: string; // YYYY-MM-DD
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'cash' | 'paystack';
  paymentReference?: string;
  emailSent?: boolean;
  hasGymAccess?: boolean;
  adminNotes?: string;
  status?: 'pending' | 'arrived' | 'checked-out' | 'cancelled';
}

export interface Review {
  id: string;
  roomId: string;
  roomName: string;
  guestName: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO string
  status: 'pending' | 'approved' | 'rejected';
  images?: string[];
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'seasonal' | 'weekend' | 'long-stay' | 'last-minute' | 'custom';
  adjustmentType: 'percentage' | 'fixed_amount';
  value: number; // e.g., 10 for +10% or -10 for -10%
  startDate?: string;
  endDate?: string;
  daysOfWeek?: number[]; // 0=Sun, 6=Sat
  minNights?: number;
  roomCategories?: string[]; // 'all' or specific IDs
  isActive: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
  enabled: boolean;
}

export interface EmailLog {
  id: string;
  to: string;
  template: string;
  subject: string;
  sentAt: string;
  status: 'pending' | 'sent' | 'failed';
  bookingId?: string;
  error?: string;
}

export interface ScheduledEmail {
  id: string;
  bookingId: string;
  templateId: string;
  scheduledFor: string; // ISO date
  sent: boolean;
  sentAt?: string;
}

