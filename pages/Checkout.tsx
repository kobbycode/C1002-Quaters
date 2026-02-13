
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import SEO from '../components/SEO';
import { formatLuxuryText, formatPrice } from '../utils/formatters';

import { PaystackButton } from 'react-paystack';

const Checkout: React.FC = () => {
  const { rooms, config, addBooking, sendEmail, isRoomAvailable, calculatePrice } = useSite();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || rooms[0]?.id;
  const room = rooms.find(r => r.id === roomId) || rooms[0];

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDateError, setIsDateError] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'paystack'>('paystack');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const nights = useMemo(() => {
    const n = searchParams.get('nights');
    return n ? parseInt(n) : 1;
  }, [searchParams]);

  const dates = useMemo(() => {
    const checkInParam = searchParams.get('checkIn');
    if (!checkInParam) return null;

    const checkIn = new Date(checkInParam);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + nights);

    return {
      checkIn,
      checkOut,
      isoCheckIn: checkIn.toISOString().split('T')[0],
      isoCheckOut: checkOut.toISOString().split('T')[0],
      formattedCheckIn: checkIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      formattedCheckOut: checkOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  }, [searchParams, nights]);



  const pricing = useMemo(() => {
    if (!dates) return {
      total: room.price * nights,
      breakdown: { basePrice: room.price, totalNights: nights, subtotal: room.price * nights, adjustments: [], finalTotal: room.price * nights, averageNightlyRate: room.price }
    };
    const calculation = calculatePrice(room.id, dates.checkIn, dates.checkOut);
    return {
      total: calculation.finalTotal,
      breakdown: calculation
    };
  }, [dates, room, calculatePrice, nights]);

  const totalAmount = pricing.total;

  const handleCashBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dates) return;

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
      paymentReference: reference,
      checkInDate: dates?.formattedCheckIn || 'Flexible',
      checkOutDate: dates?.formattedCheckOut || 'Flexible',
      isoCheckIn: dates?.isoCheckIn || '',
      isoCheckOut: dates?.isoCheckOut || ''
    };

    await addBooking(bookingData);

    // Send Email Notification
    await sendEmail(
      [formData.email, config.footer.email], // Use dynamic config email
      `Booking Confirmed - ${room.name}`,
      `<div>
        <h1>Booking Confirmation</h1>
        <p>Dear ${formData.firstName},</p>
        <p>Thank you for choosing C1002 Quarters. Your reservation for <strong>${room.name}</strong> is confirmed.</p>
        <ul>
          <li><strong>Check-in:</strong> ${dates?.formattedCheckIn || 'Flexible'}</li>
          <li><strong>Duration:</strong> ${nights} Night(s)</li>
          <li><strong>Total:</strong> ${formatPrice(totalAmount, config.currency)}</li>
          <li><strong>Payment Status:</strong> ${status.toUpperCase()} (${method})</li>
        </ul>
        <p>Our concierge will contact you shortly via WhatsApp/Phone to finalize details.</p>
        <p>Akwaaba,<br/>C1002 Quarters Team</p>
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
      `🥂 *New Reservation: C1002 Quarters*\n\nRef: ${room.name}\n👤 ${formData.firstName} ${formData.lastName}\n💰 ${paymentMethod === 'paystack' ? 'PAID' : 'PAY ON ARRIVAL'}\n\nPlease confirm reception! ✨`
    )}`;

    return (
      <div className="pt-40 pb-20 min-h-screen bg-white flex flex-col items-center justify-center text-center px-6 animate-fade-in">
        <div className="bg-[#fdfbf7] p-12 md:p-20 rounded-[3rem] border border-gold/10 shadow-2xl shadow-gold/5 max-w-4xl w-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-bl-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-gold text-white rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-gold/40 animate-success-pop">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>

            <span className="text-gold font-black uppercase tracking-[0.5em] text-[10px] mb-6 block">Akwaaba</span>
            <h1 className="text-4xl md:text-6xl font-black font-serif mb-6 text-charcoal leading-tight">Your Stay is *Confirmed*</h1>
            <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto mb-12 font-light leading-relaxed italic border-l-2 border-gold/30 pl-8">
              "We have sent your formal invitation and receipt to <strong>{formData.email}</strong>. Your luxury experience in Accra begins now."
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16 py-10 border-y border-gray-100/50">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-gold tracking-widest mb-2">Suite</p>
                <p className="text-lg font-black text-charcoal font-serif">{room.name}</p>
              </div>
              <div className="text-center md:border-x border-gray-100/50 px-4">
                <p className="text-[10px] font-black uppercase text-gold tracking-widest mb-2">Dates</p>
                <p className="text-lg font-black text-charcoal font-serif">{dates?.formattedCheckIn || 'Flexible'}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-gold tracking-widest mb-2">Total</p>
                <p className="text-lg font-black text-charcoal font-serif">{formatPrice(totalAmount, config.currency)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-charcoal text-white font-black py-5 px-10 rounded-2xl uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-charcoal/30 hover:bg-gold transition-all flex items-center justify-center gap-3"
              >
                Direct Concierge
              </a>
              <Link to="/" className="flex-1 bg-white text-charcoal border border-gray-100 font-black py-5 px-10 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-gray-50 transition-all flex items-center justify-center">
                Return Home
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-gray-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
          Scroll to explore more
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-background-light pb-20">
      <SEO title="Secure Reservation" description="Finalize your luxury stay at C1002 Quarters." />
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8">
        <div className="mb-10 max-w-[960px] mx-auto text-center">
          <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Secure Reservation</span>
          <h1 className="text-2xl md:text-4xl font-black font-serif mb-4 text-charcoal">Confirm Your Stay</h1>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-4 max-w-xs mx-auto">
            <div className={`bg-gold h-full transition-all duration-500`} style={{ width: paymentMethod === 'paystack' ? '100%' : '85%' }} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-[2] space-y-8 animate-fade-in">
            <section className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
              <h2 className="text-xl md:text-2xl font-black font-serif mb-6 md:mb-10 text-charcoal">Guest Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">First Name</label>
                  <input required type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium outline-none" placeholder="John" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Last Name</label>
                  <input required type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium outline-none" placeholder="Doe" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium outline-none" placeholder="john.doe@example.com" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Phone Number</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium outline-none" placeholder="+233..." />
                </div>
              </div>
            </section>

            <section className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
              <h2 className="text-xl md:text-2xl font-black font-serif mb-6 md:mb-10 text-charcoal">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paystack')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${paymentMethod === 'paystack' ? 'border-gold bg-gold/5' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="font-black text-charcoal mb-1">Pay Now (Card / MoMo)</div>
                  <div className="text-xs text-gray-500">Secure instant payment via Paystack</div>
                  {paymentMethod === 'paystack' && <div className="absolute top-4 right-4 text-gold">✔</div>}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${paymentMethod === 'cash' ? 'border-gold bg-gold/5' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="font-black text-charcoal mb-1">Pay on Arrival</div>
                  <div className="text-xs text-gray-500">Settle your bill when you check in</div>
                  {paymentMethod === 'cash' && <div className="absolute top-4 right-4 text-gold">✔</div>}
                </button>
              </div>

              <div className="mt-12 pt-12 border-t border-gray-50">
                {error && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center mb-6">
                    {error}
                  </div>
                )}

                {paymentMethod === 'paystack' && formData.email && formData.firstName && formData.lastName && formData.phone ? (
                  <div className="relative">
                    {!isRoomAvailable(room.id, dates?.isoCheckIn || '', dates?.isoCheckOut || '') && (
                      <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl border-2 border-dashed border-red-200">
                        <p className="text-red-500 font-black text-xs uppercase tracking-widest px-6 text-center">Dates no longer available</p>
                      </div>
                    )}
                    <PaystackButton
                      {...paystackConfig}
                      text={isProcessing ? "Processing..." : `Pay ${formatPrice(totalAmount, config.currency)}`}
                      className="w-full h-14 md:h-20 bg-primary text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-[#6B006B] transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4"
                      onSuccess={handlePaystackSuccess}
                      onClose={handlePaystackClose}
                    />
                  </div>
                ) : (
                  <button
                    onClick={handleCashBooking}
                    disabled={isProcessing || (paymentMethod === 'paystack' && (!formData.email || !formData.firstName))}
                    className="relative w-full h-14 md:h-20 bg-charcoal text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl shadow-charcoal/30 flex items-center justify-center gap-4 overflow-hidden disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Confirm Reservation"}
                  </button>
                )}

                <p className="mt-6 text-center text-[10px] uppercase font-black tracking-widest text-gray-400">
                  By clicking, you agree to our booking policy and terms of service.
                </p>
              </div>
            </section>
          </div>


          <aside className="flex-1 lg:sticky lg:top-28 h-fit">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
              <div className="aspect-video relative">
                <img src={room.image} className="w-full h-full object-cover" alt={room.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-gold text-[9px] font-black uppercase tracking-[0.2em] mb-1">Your Selection</p>
                  <h3 className="text-white text-xl font-black font-serif">{room.name}</h3>
                </div>
              </div>
              <div className="p-10">
                <div className="grid grid-cols-2 gap-8 py-8 border-b border-gray-50 mb-8">
                  <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Check in</p>
                    <p className="font-bold text-charcoal">{dates?.formattedCheckIn || 'Flexible'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Duration</p>
                    <p className="font-bold text-charcoal">{nights} Night{nights > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-400">Base Rate</span>
                    <span className="text-charcoal">{formatPrice(pricing.breakdown.subtotal, config.currency)}</span>
                  </div>

                  {pricing.breakdown.adjustments.map((adj, i) => (
                    <div key={i} className="flex justify-between text-xs font-medium tracking-widest text-emerald-600">
                      <span>{adj.ruleName}</span>
                      <span>{adj.amount > 0 ? '+' : ''}{formatPrice(adj.amount, config.currency)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-400">Concierge Service</span>
                    <span className="text-primary">Included</span>
                  </div>
                  <div className="flex justify-between items-center pt-8 border-t border-gray-100 font-black font-serif text-3xl">
                    <span className="text-charcoal">Total</span>
                    <span className="text-primary">{formatPrice(totalAmount, config.currency)}</span>
                  </div>
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

