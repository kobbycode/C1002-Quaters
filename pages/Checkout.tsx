
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { formatLuxuryText, formatPrice } from '../utils/formatters';

import { PaystackButton } from 'react-paystack';

const Checkout: React.FC = () => {
  const { rooms, config, addBooking, sendEmail, isRoomAvailable, calculatePrice } = useSite();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || rooms[0]?.id;
  const room = rooms.find(r => r.id === roomId) || rooms[0];

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDateError, setIsDateError] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'paystack'>('paystack');
  const [hasGymAccess, setHasGymAccess] = useState(false);

  const GYM_DAILY_FEE = 10;

  const [formData, setFormData] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: ''
  });

  // Initial state from URL with fallbacks
  const [checkIn, setCheckIn] = useState<string>(() => {
    const param = searchParams.get('checkIn');
    if (param) return param.split('T')[0];
    return new Date().toISOString().split('T')[0];
  });

  const [nights, setNights] = useState<number>(() => {
    const param = searchParams.get('nights');
    return param ? parseInt(param) : 1;
  });

  const dates = useMemo(() => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + nights);

    return {
      checkIn: checkInDate,
      checkOut: checkOutDate,
      isoCheckIn: checkInDate.toISOString().split('T')[0],
      isoCheckOut: checkOutDate.toISOString().split('T')[0],
      formattedCheckIn: checkInDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      formattedCheckOut: checkOutDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  }, [checkIn, nights]);



  const pricing = useMemo(() => {
    const calculation = calculatePrice(room.id, dates.checkIn, dates.checkOut);

    // Add Gym Fee if selected
    const gymTotal = hasGymAccess ? (GYM_DAILY_FEE * nights) : 0;
    const finalTotal = calculation.finalTotal + gymTotal;

    const adjustments = [...calculation.adjustments];
    if (hasGymAccess) {
      adjustments.push({ ruleName: 'Elite Gym Access', amount: gymTotal });
    }

    return {
      total: finalTotal,
      breakdown: {
        ...calculation,
        adjustments,
        finalTotal
      }
    };
  }, [dates, room, calculatePrice, nights, hasGymAccess]);

  const totalAmount = pricing.total;

  const handleCashBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    setError(null);

    if (!isRoomAvailable(room.id, dates.isoCheckIn, dates.isoCheckOut)) {
      setError("This room has been booked for these dates just now. Please try different dates or another room.");
      setIsProcessing(false);
      return;
    }

    try {
      await processBooking('cash', 'pending');
    } catch (err) {
      console.error("Booking error:", err);
      setError("We couldn't process your reservation. Please check your connection and try again.");
      setIsProcessing(false);
    }
  };

  const processBooking = async (method: 'cash' | 'paystack', status: 'pending' | 'paid', reference?: string) => {
    const bookingData = {
      roomId: room.id,
      roomName: room.name,
      guestName: `${formData.firstName} ${formData.lastName}`,
      guestEmail: formData.email,
      guestPhone: formData.phone,
      totalPrice: totalAmount,
      nights: nights,
      paymentStatus: status,
      paymentMethod: method,
      paymentReference: reference || '',
      checkInDate: dates?.formattedCheckIn || 'Flexible',
      checkOutDate: dates?.formattedCheckOut || 'Flexible',
      isoCheckIn: dates?.isoCheckIn || '',
      isoCheckOut: dates?.isoCheckOut || '',
      hasGymAccess
    };

    await addBooking(bookingData);

    // Send Email Notification
    await sendEmail(
      [formData.email, config.footer.email], // Use dynamic config email
      `Booking Confirmed - ${room.name}`,
      `<div>
        <h1>Booking Confirmation</h1>
        <p>Dear ${formData.firstName},</p>
        <p>Thank you for choosing {config.brand.name}. Your reservation for <strong>${room.name}</strong> is confirmed.</p>
        <ul>
          <li><strong>Check-in:</strong> ${dates?.formattedCheckIn || 'Flexible'}</li>
          <li><strong>Duration:</strong> ${nights} Night(s)</li>
          <li><strong>Addons:</strong> ${hasGymAccess ? 'Elite Gym Access Included' : 'None'}</li>
          <li><strong>Total:</strong> ${formatPrice(totalAmount, config.currency)}</li>
          <li><strong>Payment Status:</strong> ${status.toUpperCase()} (${method})</li>
        </ul>
        <p>Our concierge will contact you shortly via WhatsApp/Phone to finalize details.</p>
        <p>Akwaaba,<br/>{config.brand.name} Team</p>
      </div>`
    );

    setIsSuccess(true);
    setIsProcessing(false);
    window.scrollTo(0, 0);
  };

  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: formData.email,
    amount: totalAmount * 100, // Paystack expects amount in pesewas
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    currency: config.currency === 'USD' ? 'USD' : 'GHS', // Paystack commonly supports GHS/USD
  };

  const handlePaystackSuccess = (reference: any) => {
    processBooking('paystack', 'paid', reference.reference);
  };

  const handlePaystackClose = () => {
    setError("Payment was cancelled.");
    setIsProcessing(false);
  };

  if (isSuccess) {
    const whatsappNumber = config.footer.phone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      `🥂 *New Reservation: ${config.brand.name}*\n\nRef: ${room.name}\n👤 ${formData.firstName} ${formData.lastName}\n💰 ${paymentMethod === 'paystack' ? 'PAID' : 'PAY ON ARRIVAL'}\n\nPlease confirm reception! ✨`
    )}`;

    return (
      <div className="pt-40 pb-20 min-h-screen bg-[#fafafa] flex flex-col items-center justify-center text-center px-4 md:px-6 animate-fade-in">
        <div className="bg-white p-8 md:p-24 rounded-[4rem] border border-gray-100 shadow-2xl shadow-gray-200/50 max-w-[1000px] w-full relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-tr-full pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-28 h-28 bg-gold text-white rounded-full flex items-center justify-center mb-12 shadow-2xl shadow-gold/40 animate-success-pop">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>

            <div className="space-y-4 mb-10">
              <span className="text-gold font-black uppercase tracking-[0.6em] text-[10px] block">Reservation Secured</span>
              <h1 className="text-5xl md:text-7xl font-black font-serif text-charcoal leading-tight">
                Akwaaba, <span className="italic font-normal underline decoration-gold/30 underline-offset-8">{formData.firstName}</span>.
              </h1>
            </div>

            <p className="text-gray-500 text-sm md:text-xl max-w-2xl mx-auto mb-16 font-medium leading-relaxed italic border-l-4 border-gold/20 pl-10 text-left">
              "We've sent a formal invitation and digital receipt to <strong className="text-charcoal font-black">{formData.email}</strong>. Your luxury experience in Accra is being prepared by our concierge team."
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full mb-20 py-12 border-y border-gray-100/50">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <p className="text-[10px] font-black uppercase text-gold tracking-widest mb-3">Suite Selection</p>
                <p className="text-2xl font-black text-charcoal font-serif italic">{room.name}</p>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left md:border-x border-gray-100/50 px-10">
                <p className="text-[10px] font-black uppercase text-gold tracking-widest mb-3">Arrival Date</p>
                <p className="text-2xl font-black text-charcoal font-serif italic">{dates?.formattedCheckIn || 'Flexible'}</p>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <p className="text-[10px] font-black uppercase text-gold tracking-widest mb-3">Total Investment</p>
                <p className="text-2xl font-black text-primary font-serif italic">{formatPrice(totalAmount, config.currency)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 w-full max-w-xl">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-[1.5] bg-charcoal text-white font-black py-6 px-10 rounded-3xl uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-charcoal/30 hover:bg-primary hover:scale-105 transition-all flex items-center justify-center gap-4"
              >
                <span>Direct Concierge</span>
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </a>
              <Link to="/" className="flex-1 bg-white text-charcoal border-2 border-gray-50 font-black py-6 px-10 rounded-3xl uppercase tracking-[0.3em] text-[11px] hover:bg-gray-50 hover:border-gray-100 hover:scale-105 transition-all flex items-center justify-center">
                Home
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-6">
          <div className="w-px h-20 bg-gradient-to-b from-gold/0 via-gold/50 to-gold/0" />
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse italic">
            "Every Detail Attended"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-[#fafafa] pb-20">
      <SEO title="Secure Reservation" description={`Finalize your luxury stay at ${config.brand.name}.`} />
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-8 relative">
        {/* Back Button */}
        <Link
          to={`/rooms/${roomId}`}
          className="absolute left-4 md:left-10 top-8 group flex items-center gap-3 text-gray-400 hover:text-gold transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-full border border-gray-100 bg-white flex items-center justify-center group-hover:border-gold/30 group-hover:shadow-lg group-hover:shadow-gold/10 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Back to Suite</span>
        </Link>

        {/* Re-designed Header & Stepper */}
        <div className="mb-12 max-w-[800px] mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-3 bg-white px-5 py-2 rounded-full border border-gray-100 shadow-sm animate-fade-in">
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Secure Verification</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-serif text-charcoal leading-tight animate-slide-up">
            Confirm Your <span className="italic font-normal">Quarters</span>
          </h1>

          <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center text-[10px] font-black">1</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-charcoal">Details</span>
            </div>
            <div className="w-12 h-px bg-gray-200" />
            <div className="flex items-center gap-3 opacity-40">
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center text-[10px] font-black">2</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-[2] w-full space-y-10 animate-fade-in-slow">
            {/* Stay Details Section */}
            <section className="bg-white p-6 md:p-14 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/40">
              <div className="flex items-center gap-4 mb-10 md:mb-14">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-charcoal/30">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black font-serif text-charcoal">Stay Details</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Arrival & Duration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold ml-2">Preferred Arrival</label>
                  <div className="relative group">
                    <input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full h-16 md:h-18 px-6 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold text-charcoal"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-focus-within:text-primary transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold ml-2">Duration of Stay</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setNights(Math.max(1, nights - 1))}
                      className="w-16 h-16 md:h-18 rounded-2xl bg-gray-50/50 border-2 border-transparent hover:border-gray-200 flex items-center justify-center text-charcoal transition-all active:scale-90"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                    </button>
                    <div className="flex-1 h-16 md:h-18 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center">
                      <span className="text-xl font-black font-serif text-charcoal mr-2">{nights}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{nights === 1 ? 'Night' : 'Nights'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNights(nights + 1)}
                      className="w-16 h-16 md:h-18 rounded-2xl bg-gray-50/50 border-2 border-transparent hover:border-gray-200 flex items-center justify-center text-charcoal transition-all active:scale-90"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-emerald-50/30 rounded-2xl border border-emerald-100 flex items-center gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-emerald-700 text-xs font-medium leading-relaxed italic">
                  Departure scheduled for <strong className="font-black underline decoration-emerald-200 underline-offset-4">{dates.formattedCheckOut}</strong>. Pricing has been updated automatically for your {nights} night stay.
                </p>
              </div>
            </section>

            {/* Guest Details Section */}
            <section className="bg-white p-6 md:p-14 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="flex items-center gap-4 mb-10 md:mb-14">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-charcoal/30">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black font-serif text-charcoal">Guest Details</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Identification & Contact</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold pl-1">First Name</label>
                  <div className="relative group/field">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within/field:text-primary transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <input required type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 pl-14 pr-6 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm font-semibold outline-none" placeholder="First Name" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold pl-1">Last Name</label>
                  <div className="relative group/field">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within/field:text-primary transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <input required type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 pl-14 pr-6 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm font-semibold outline-none" placeholder="Last Name" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold pl-1">Email Address</label>
                  <div className="relative group/field">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within/field:text-primary transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 pl-14 pr-6 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm font-semibold outline-none" placeholder="email@example.com" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold pl-1">Phone Number</label>
                  <div className="relative group/field">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within/field:text-primary transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 pl-14 pr-6 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm font-semibold outline-none" placeholder="+233..." />
                  </div>
                </div>
              </div>

              {/* Enhance Your Stay Section */}
              <div className="mt-14 pt-14 border-t border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-black font-serif text-charcoal">Enhance Your Stay</h3>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Exclusive Addons</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setHasGymAccess(!hasGymAccess)}
                  className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group/addon ${hasGymAccess
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : 'border-gray-50 bg-gray-50/30 hover:border-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${hasGymAccess ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-charcoal/30'}`}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 10v4m0-4h2m-2 4h2m10-4v4m0-4h-2m2 4h-2m-10 2h8m-12-4v8m0-8h2m-2 8h2m16-8v8m0-8h-2m2 8h-2" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-black text-charcoal text-base font-serif italic">Elite Gym Access</div>
                      <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Stay active in our world-class facility • {formatPrice(GYM_DAILY_FEE, config.currency)}/day</div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${hasGymAccess ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200'}`}>
                    {hasGymAccess && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </button>
              </div>
            </section>

            {/* Redesigned Payment Method Selection */}
            <section className="bg-white p-6 md:p-14 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/40">
              <div className="flex items-center gap-4 mb-10 md:mb-14">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-charcoal/30">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black font-serif text-charcoal">Payment Method</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Transaction Preference</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paystack')}
                  className={`group p-8 rounded-[2rem] border-2 transition-all relative overflow-hidden text-left ${paymentMethod === 'paystack'
                    ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5'
                    : 'border-gray-50 bg-gray-50/30 hover:border-gray-200'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${paymentMethod === 'paystack' ? 'bg-primary text-white' : 'bg-white text-charcoal/30 group-hover:text-charcoal'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                  </div>
                  <div className="font-black text-charcoal text-lg mb-1 font-serif">Secure Pay Online</div>
                  <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">Cards, MoMo, Apple Pay</div>
                  {paymentMethod === 'paystack' && (
                    <div className="absolute top-6 right-6">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white scale-110 animate-success-pop">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`group p-8 rounded-[2rem] border-2 transition-all relative overflow-hidden text-left ${paymentMethod === 'cash'
                    ? 'border-charcoal bg-charcoal text-white shadow-xl shadow-charcoal/10'
                    : 'border-gray-50 bg-gray-50/30 hover:border-gray-200'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${paymentMethod === 'cash' ? 'bg-white/10 text-white' : 'bg-white text-charcoal/30 group-hover:text-charcoal'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <div className={`font-black text-lg mb-1 font-serif ${paymentMethod === 'cash' ? 'text-white' : 'text-charcoal'}`}>Pay on Arrival</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest leading-relaxed ${paymentMethod === 'cash' ? 'text-white/60' : 'text-gray-500'}`}>Check-in Settlement</div>
                  {paymentMethod === 'cash' && (
                    <div className="absolute top-6 right-6">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-charcoal scale-110 animate-success-pop">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                  )}
                </button>
              </div>

              <div className="mt-14 pt-14 border-t border-gray-100 flex flex-col items-center">
                {error && (
                  <div className="w-full bg-red-50 text-red-500 p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center mb-8 border border-red-100 animate-shake">
                    {error}
                  </div>
                )}

                <div className="w-full max-w-sm">
                  {paymentMethod === 'paystack' && formData.email && formData.firstName && formData.lastName && formData.phone ? (
                    <div className="relative group">
                      {!isRoomAvailable(room.id, dates?.isoCheckIn || '', dates?.isoCheckOut || '') && (
                        <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-md flex items-center justify-center rounded-3xl border-2 border-dashed border-red-200">
                          <p className="text-red-500 font-extrabold text-[10px] uppercase tracking-[0.3em] px-8 text-center leading-relaxed">Selected dates have just been reserved</p>
                        </div>
                      )}
                      <PaystackButton
                        {...paystackConfig}
                        text={isProcessing ? "Opening Secure Gateway..." : `Confirm & Pay ${formatPrice(totalAmount, config.currency)}`}
                        className="w-full h-18 md:h-22 bg-primary text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-charcoal hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 cursor-pointer"
                        onSuccess={handlePaystackSuccess}
                        onClose={handlePaystackClose}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={handleCashBooking}
                      disabled={isProcessing || (paymentMethod === 'paystack' && (!formData.email || !formData.firstName))}
                      className="w-full h-18 md:h-22 bg-charcoal text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-primary hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-charcoal/30 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                    >
                      {isProcessing ? "Securing Quarters..." : "Finalize Reservation"}
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover/btn:bg-white/20 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                    </button>
                  )}
                </div>

                <div className="mt-8 flex items-center gap-2 text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <p className="text-[9px] uppercase font-black tracking-[0.3em]">Encrypted 256-bit Secure Checkout</p>
                </div>
              </div>
            </section>
          </div>


          <aside className="flex-1 lg:sticky lg:top-28 w-full">
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden group/aside">
              <div className="aspect-[16/10] relative overflow-hidden">
                <img src={room.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover/aside:scale-110" alt={room.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="h-px w-4 bg-gold/50" />
                    <p className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Selected Quarter</p>
                  </div>
                  <h3 className="text-white text-2xl md:text-3xl font-black font-serif italic leading-tight">{room.name}</h3>
                </div>
              </div>

              <div className="p-8 md:p-10 space-y-8">
                <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                  <div className="space-y-1">
                    <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Arrival</p>
                    <p className="font-serif italic text-charcoal font-bold">{dates?.formattedCheckIn || 'Flexible'}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Duration</p>
                    <p className="font-serif italic text-charcoal font-bold">{nights} Night{nights > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Base Experience</span>
                    <span className="text-charcoal">{formatPrice(pricing.breakdown.subtotal, config.currency)}</span>
                  </div>

                  {pricing.breakdown.adjustments.map((adj, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] font-bold tracking-widest text-emerald-600 animate-fade-in">
                      <span className="uppercase">{adj.ruleName}</span>
                      <span>{adj.amount > 0 ? '+' : ''}{formatPrice(adj.amount, config.currency)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Concierge Service</span>
                    <span className="text-primary italic">Complimentary</span>
                  </div>

                  <div className="pt-8 mt-8 border-t-2 border-dashed border-gray-100">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Investment</p>
                        <p className="text-primary text-4xl font-black font-serif italic">{formatPrice(totalAmount, config.currency)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-charcoal/5 p-4 rounded-xl flex items-center gap-4 border border-charcoal/5">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gold shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-charcoal/60 leading-relaxed">
                    Cancellation protection included for up to 48h before check-in.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

