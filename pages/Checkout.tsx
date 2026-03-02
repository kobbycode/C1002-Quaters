
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import BookingStepper from '../components/BookingStepper';
import { formatLuxuryText, formatPrice } from '../utils/formatters';

import { PaystackButton } from 'react-paystack';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { getNames, getCode } from 'country-list';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { PromoCode } from '../types';

// Get sorted country names
const allCountryNames = getNames().sort();

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
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ghana'
  });

  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [phoneCountry, setPhoneCountry] = useState('gh'); // For PhoneInput sync
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [showGuestInputs, setShowGuestInputs] = useState(false);

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

  const [adults, setAdults] = useState<number>(() => {
    const param = searchParams.get('adults');
    return param ? parseInt(param) : 1;
  });

  const [children, setChildren] = useState<number>(() => {
    const param = searchParams.get('children');
    return param ? parseInt(param) : 0;
  });

  const [roomsCount, setRoomsCount] = useState<number>(() => {
    const param = searchParams.get('rooms');
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

    // Calculate Taxes & Fees (8% + 4% = 12%)
    const subtotalBeforeTax = calculation.finalTotal + gymTotal;

    // Apply Promo Discount
    let discount = 0;
    if (appliedPromo) {
      if (appliedPromo.discountType === 'percentage') {
        discount = subtotalBeforeTax * (appliedPromo.value / 100);
      } else {
        discount = appliedPromo.value;
      }
    }

    const taxesAndFees = (subtotalBeforeTax - discount) * 0.12;
    const finalTotal = subtotalBeforeTax - discount + taxesAndFees;

    const adjustments = [...calculation.adjustments];
    if (hasGymAccess) {
      adjustments.push({ ruleName: 'Elite Gym Access', amount: gymTotal });
    }
    if (discount > 0) {
      adjustments.push({ ruleName: `Promo: ${appliedPromo.code}`, amount: -discount });
    }

    return {
      total: finalTotal,
      taxesAndFees,
      discount,
      breakdown: {
        ...calculation,
        adjustments,
        finalTotal
      }
    };
  }, [dates, room, calculatePrice, nights, hasGymAccess, appliedPromo]);

  const handleApplyPromo = () => {
    setPromoError(null);
    if (!promoCode) return;

    const code = config.promoCodes?.find(c => c.code.toUpperCase() === promoCode.toUpperCase() && c.isActive);
    if (code) {
      setAppliedPromo(code);
      setPromoCode('');
    } else {
      setPromoError('INVALID OR EXPIRED CODE');
      setAppliedPromo(null);
    }
  };

  const totalAmount = pricing.total;
  const taxesAndFees = pricing.taxesAndFees;

  const handleCashBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    setError(null);

    // Validate phone before submission
    if (phoneError || !formData.phone) {
      setError("Please provide a valid phone number.");
      setIsProcessing(false);
      return;
    }

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
      guestId: user?.uid,
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
      hasGymAccess,
      guestNames: guestNames.filter(name => name.trim() !== ''),
      promoCode: appliedPromo?.code || null,
      discount: pricing.discount
    };

    await addBooking(bookingData);

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
    const promoInfo = appliedPromo ? `\n🎁 Promo: ${appliedPromo.code} (-${formatPrice(pricing.discount, config.currency)})` : '';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      `🥂 *New Reservation: ${config.brand.name}*\n\nRef: ${room.name}\n👤 ${formData.firstName} ${formData.lastName}${promoInfo}\n💰 ${paymentMethod === 'paystack' ? 'PAID' : 'PAY ON ARRIVAL'}\n\nPlease confirm reception! ✨`
    )}`;

    return (
      <div className="pt-40 pb-20 min-h-screen bg-[#fafafa] flex flex-col items-center animate-fade-in">
        <BookingStepper currentStep={4} />
        <div className="bg-white p-8 md:p-24 rounded-[4rem] border border-gray-100 shadow-2xl shadow-gray-200/50 max-w-[1000px] w-full relative overflow-hidden group mt-12">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-tr-full pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-28 h-28 bg-gold text-white rounded-full flex items-center justify-center mb-12 shadow-2xl shadow-gold/40 animate-success-pop">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>

            <div className="space-y-4 mb-10">
              <span className="text-gold font-black uppercase tracking-[0.6em] text-[10px] block">Reservation Secured</span>
              <h1 className="text-4xl md:text-6xl font-black font-serif text-charcoal leading-tight">
                Obaake, <span className="italic font-normal underline decoration-gold/30 underline-offset-8">{formData.firstName}</span>.
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
      <BookingStepper currentStep={3} />
      <SEO title="Secure Reservation" description={`Finalize your luxury stay at ${config.brand.name}.`} />
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Main Form Section */}
          <div className="flex-[2] w-full space-y-8">
            <div className="bg-white p-8 md:p-14 border border-gray-100 shadow-sm rounded-sm">
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-charcoal tracking-tight uppercase">Guest Information</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Please input in English only.</p>
              </div>

              <form className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal">First Name<span className="text-red-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full border-b border-gray-200 py-3 px-1 focus:border-charcoal outline-none transition-all text-sm font-medium placeholder:text-gray-200"
                      placeholder="JOHN"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal">Last Name<span className="text-red-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full border-b border-gray-200 py-3 px-1 focus:border-charcoal outline-none transition-all text-sm font-medium placeholder:text-gray-200"
                      placeholder="SMITH"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => setShowGuestInputs(!showGuestInputs)}
                      className="text-[11px] font-bold uppercase tracking-widest text-charcoal border-b-2 border-charcoal/10 hover:border-charcoal transition-all"
                    >
                      {showGuestInputs ? 'Hide Guest Names' : 'Add Guest Names'}
                    </button>
                  </div>

                  {showGuestInputs && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      {Array.from({ length: (adults + children) - 1 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Guest {i + 2} Full Name</label>
                          <input
                            type="text"
                            placeholder={`GUEST ${i + 2} NAME`}
                            value={guestNames[i] || ''}
                            onChange={e => {
                              const newNames = [...guestNames];
                              newNames[i] = e.target.value;
                              setGuestNames(newNames);
                            }}
                            className="w-full border-b border-gray-200 py-3 px-1 focus:border-charcoal outline-none transition-all text-sm font-medium placeholder:text-gray-200"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal">Email Address<span className="text-red-500">*</span></label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border-b border-gray-200 py-3 px-1 focus:border-charcoal outline-none transition-all text-sm font-medium placeholder:text-gray-200"
                      placeholder="GUEST@C1002QUARTERS.COM"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal">Phone Number<span className="text-red-500">*</span></label>
                      {phoneError && <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest animate-pulse">{phoneError}</span>}
                    </div>
                    <div className={`phone-input-container border-b transition-colors ${phoneError ? 'border-red-500/50' : 'border-gray-200 focus-within:border-charcoal'}`}>
                      <PhoneInput
                        country={phoneCountry}
                        value={formData.phone}
                        onChange={(value, data: any) => {
                          setFormData({ ...formData, phone: value });

                          // Validate phone number
                          if (value) {
                            try {
                              const isValid = isValidPhoneNumber('+' + value);
                              if (!isValid) {
                                setPhoneError('INVALID PHONE NUMBER');
                              } else {
                                setPhoneError(null);
                              }
                            } catch (e) {
                              setPhoneError('INVALID PHONE NUMBER');
                            }
                          } else {
                            setPhoneError(null);
                          }

                          // Sync country text if it's a known country
                          if (data && data.name) {
                            setFormData(prev => ({ ...prev, country: data.name }));
                            setPhoneCountry(data.countryCode);
                          }
                        }}
                        containerClass="!border-none"
                        inputClass="!w-full !border-none !bg-transparent !py-3 !pl-20 !pr-1 !h-auto !text-sm !font-medium !font-sans placeholder:text-gray-200"
                        buttonClass="!bg-transparent !border-none !p-0 !absolute !left-0 !top-1/2 !-translate-y-1/2 !w-16"
                        dropdownClass="!bg-white !shadow-xl !border-gray-100 !text-sm"
                        placeholder="12345678"
                        autoFormat={true}
                        enableSearch={true}
                        countryCodeEditable={false}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal">Address Line 1<span className="text-red-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={formData.address1}
                      onChange={e => setFormData({ ...formData, address1: e.target.value })}
                      className="w-full border-b border-gray-200 py-3 px-1 focus:border-charcoal outline-none transition-all text-sm font-medium placeholder:text-gray-200"
                      placeholder="ADDRESS LINE 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal">Address Line 2</label>
                    <input
                      type="text"
                      value={formData.address2}
                      onChange={e => setFormData({ ...formData, address2: e.target.value })}
                      className="w-full border-b border-gray-200 py-3 px-1 focus:border-charcoal outline-none transition-all text-sm font-medium placeholder:text-gray-200"
                      placeholder="ADDRESS LINE 2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal">City<span className="text-red-500">*</span></label>
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full border-b border-gray-200 py-3 px-1 focus:border-charcoal outline-none transition-all text-sm font-medium placeholder:text-gray-200"
                      placeholder="CITY"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="w-full border-b border-gray-200 py-3 px-1 focus:border-charcoal outline-none transition-all text-sm font-medium placeholder:text-gray-200"
                      placeholder="STATE"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal">Zip Code</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full border-b border-gray-200 py-3 px-1 focus:border-charcoal outline-none transition-all text-sm font-medium placeholder:text-gray-200"
                      placeholder="ZIP CODE"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-charcoal">Country/Territory<span className="text-red-500">*</span></label>
                  <select
                    value={formData.country}
                    onChange={e => {
                      const countryName = e.target.value;
                      setFormData({ ...formData, country: countryName });
                      // Sync PhoneInput country flag
                      try {
                        const code = getCode(countryName);
                        if (code) setPhoneCountry(code.toLowerCase());
                      } catch (err) { }
                    }}
                    className="w-full border-b border-gray-200 py-3 px-1 focus:border-charcoal outline-none transition-all text-sm font-medium bg-transparent uppercase"
                  >
                    {allCountryNames.map(name => (
                      <option key={name} value={name}>{name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-10 border-t border-gray-100 space-y-8">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-bold text-charcoal uppercase">Payment Method</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paystack')}
                        className={`p-6 border-2 transition-all flex items-center gap-4 ${paymentMethod === 'paystack'
                          ? 'border-charcoal bg-gray-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'paystack' ? 'border-charcoal bg-charcoal' : 'border-gray-200'}`}>
                          {paymentMethod === 'paystack' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Secure Online Payment</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-6 border-2 transition-all flex items-center gap-4 ${paymentMethod === 'cash'
                          ? 'border-charcoal bg-gray-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-charcoal bg-charcoal' : 'border-gray-200'}`}>
                          {paymentMethod === 'cash' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Pay on Arrival</span>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-500 p-4 text-[10px] font-bold uppercase tracking-widest text-center border border-red-100">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-center md:justify-end">
                    {paymentMethod === 'paystack' && formData.email && formData.firstName && formData.lastName && formData.phone && !phoneError ? (
                      <PaystackButton
                        {...paystackConfig}
                        text={isProcessing ? "PROCESSING..." : `CONFIRM & PAY ${formatPrice(totalAmount, config.currency)}`}
                        className="bg-charcoal text-white px-12 py-5 font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-black transition-all shadow-lg cursor-pointer"
                        onSuccess={handlePaystackSuccess}
                        onClose={handlePaystackClose}
                      />
                    ) : (
                      <button
                        onClick={handleCashBooking}
                        disabled={isProcessing}
                        className="bg-charcoal text-white px-12 py-5 font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-black transition-all shadow-lg disabled:opacity-50"
                      >
                        {isProcessing ? "PROCESSING..." : "FINALIZE RESERVATION"}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="flex-1 w-full space-y-6 lg:sticky lg:top-32">
            <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
              <div className="p-8 space-y-8">
                {/* Stay Summary */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{dates.formattedCheckIn}</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    <div className="text-left">
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{dates.formattedCheckOut}</div>
                    </div>
                  </div>
                  <Link to="/rooms" className="text-gray-400 hover:text-charcoal transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </Link>
                </div>

                <div className="text-[11px] font-bold text-charcoal uppercase tracking-[0.2em]">
                  {nights} {nights === 1 ? 'NIGHT' : 'NIGHTS'} | {roomsCount} {roomsCount === 1 ? 'ROOM' : 'ROOMS'}, {adults} {adults === 1 ? 'ADULT' : 'ADULTS'}
                  {children > 0 && `, ${children} ${children === 1 ? 'CHILD' : 'CHILDREN'}`}
                </div>

                {/* Room Card Selection */}
                <div className="space-y-4">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-sm">
                    <img src={room.images?.[0] || room.image} alt={room.name} className="w-full h-full object-cover" />
                  </div>
                  {/* Gym Access Toggle */}
                  <div className="bg-charcoal/5 p-4 rounded-sm mb-6 border border-charcoal/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-charcoal">Elite Gym Access</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Complementary for Elite members, {formatPrice(GYM_DAILY_FEE, config.currency)}/day for guests.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={hasGymAccess}
                          onChange={() => setHasGymAccess(!hasGymAccess)}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-charcoal"></div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-charcoal uppercase tracking-tight">{room.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {room.bedType} • {config.brand.name} BEST FLEXIBLE RATE
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 pt-6 mt-6 border-t border-gray-50">
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                      className="text-[11px] font-bold text-charcoal uppercase tracking-widest flex items-center gap-2"
                    >
                      Nightly Price Breakdown
                      <svg className={`w-3 h-3 transition-transform ${showPriceBreakdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <span className="text-sm font-bold text-charcoal">{formatPrice(room.price * nights, config.currency)}</span>
                  </div>

                  {showPriceBreakdown && (
                    <div className="pl-4 space-y-2 border-l-2 border-gray-100 py-1">
                      {Array.from({ length: nights }).map((_, i) => (
                        <div key={i} className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          <span>Night {i + 1}</span>
                          <span>{formatPrice(room.price, config.currency)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFeeDetails(!showFeeDetails)}
                      className="text-[11px] font-bold text-blue-600 uppercase tracking-widest border-b border-blue-600/20"
                    >
                      Taxes & Fees
                    </button>
                    <span className="text-sm font-bold text-charcoal">{formatPrice(taxesAndFees, config.currency)}</span>
                  </div>

                  {showFeeDetails && (
                    <div className="p-4 bg-gray-50 rounded-sm space-y-2">
                      <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <span>Luxury Tax (8%)</span>
                        <span>{formatPrice(room.price * nights * 0.08, config.currency)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <span>Service Charge (4%)</span>
                        <span>{formatPrice(room.price * nights * 0.04, config.currency)}</span>
                      </div>
                    </div>
                  )}

                  {hasGymAccess && (
                    <div className="flex justify-between text-[11px] font-bold text-charcoal uppercase tracking-widest pt-2">
                      <span>Gym Access Addon</span>
                      <span>{formatPrice(GYM_DAILY_FEE * nights, config.currency)}</span>
                    </div>
                  )}

                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="text-lg font-bold text-charcoal uppercase tracking-tighter">Total Amount</div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-charcoal leading-none">
                          {formatPrice(totalAmount, config.currency)}
                        </div>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Includes all taxes</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="PROMO CODE"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value.toUpperCase())}
                        className={`w-full border ${promoError ? 'border-red-500' : 'border-gray-200'} p-3 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-charcoal transition-colors`}
                      />
                      {promoError && (
                        <p className="absolute -bottom-5 left-0 text-[8px] font-black text-red-500 uppercase tracking-widest">{promoError}</p>
                      )}
                      {appliedPromo && (
                        <p className="absolute -bottom-5 left-0 text-[8px] font-black text-green-600 uppercase tracking-widest">CODE {appliedPromo.code} APPLIED!</p>
                      )}
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoCode}
                      className="bg-charcoal text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="pt-6 flex flex-col items-center gap-4 text-center">
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <p className="text-[9px] uppercase font-black tracking-[0.2em]">Secure Checkout</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-charcoal/5 rounded-sm border border-charcoal/10">
              <p className="text-[10px] text-charcoal/60 font-medium italic text-center">
                Free cancellation up to 24 hours before check-in. No hidden booking fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

