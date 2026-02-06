
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import SEO from '../components/SEO';

const Checkout: React.FC = () => {
  const { rooms, addBooking } = useSite();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || rooms[0]?.id;
  const room = rooms.find(r => r.id === roomId) || rooms[0];

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const nights = useMemo(() => {
    const n = searchParams.get('nights');
    return n ? parseInt(n) : 1;
  }, [searchParams]);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      addBooking({
        roomId: room.id,
        roomName: room.name,
        guestName: `${formData.firstName} ${formData.lastName}`,
        guestEmail: formData.email,
        totalPrice: room.price * nights,
        nights: nights
      });

      setIsProcessing(false);
      setIsSuccess(true);
      window.scrollTo(0, 0);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="pt-40 pb-20 min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
        <SEO title="Booking Confirmed" description="Your stay at C1002 Quarters is confirmed." />
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-10">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-5xl font-black font-serif mb-6 text-charcoal">Akwaaba Home!</h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto mb-12 font-light">
          Your reservation for the <span className="text-charcoal font-bold">{room.name}</span> has been confirmed. A concierge will reach out via email shortly to arrange your arrival.
        </p>
        <Link to="/" className="bg-charcoal text-white font-black py-5 px-12 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-primary transition-all">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-background-light pb-20">
      <SEO title="Secure Checkout" description="Finalize your luxury stay at C1002 Quarters." />
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8">
        <div className="mb-10 max-w-[960px] mx-auto text-center">
          <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Secure Payments</span>
          <h1 className="text-4xl font-black font-serif mb-4 text-charcoal">Confirm Your Booking</h1>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-4 max-w-xs mx-auto">
            <div className="bg-gold h-full" style={{ width: '85%' }} />
          </div>
          <p className="text-gray-500 text-sm leading-loose">
            Secure your stay in the heart of Accra.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <form onSubmit={handleBooking} className="flex-[2] space-y-8 animate-fade-in">
            <section className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
              <h2 className="text-2xl font-black font-serif mb-10 text-charcoal">Your Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">First Name</label>
                  <input required type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium outline-none" placeholder="John" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Last Name</label>
                  <input required type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium outline-none" placeholder="Doe" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium outline-none" placeholder="john.doe@example.com" />
                </div>
              </div>
            </section>

            <section className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black font-serif text-charcoal">Secure Payment</h2>
                <div className="flex gap-2">
                  <div className="w-10 h-6 bg-gray-100 rounded"></div>
                  <div className="w-10 h-6 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Cardholder Name</label>
                  <input required type="text" value={formData.cardName} onChange={e => setFormData({ ...formData, cardName: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium outline-none" placeholder="FULL NAME ON CARD" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Card Number</label>
                  <input required type="text" value={formData.cardNumber} onChange={e => setFormData({ ...formData, cardNumber: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium outline-none tracking-widest" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Expiry Date</label>
                    <input required type="text" value={formData.expiry} onChange={e => setFormData({ ...formData, expiry: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium outline-none" placeholder="MM / YY" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">CVV</label>
                    <input required type="password" value={formData.cvv} onChange={e => setFormData({ ...formData, cvv: e.target.value })} className="w-full rounded-2xl border-gray-100 bg-gray-50/50 py-5 px-6 focus:ring-primary focus:border-primary text-sm font-medium outline-none" placeholder="***" />
                  </div>
                </div>
                <button
                  disabled={isProcessing}
                  className="relative w-full h-20 bg-primary text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-[#6B006B] transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 overflow-hidden disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Checking details...
                    </>
                  ) : (
                    <>Confirm Booking</>
                  )}
                </button>
              </div>
            </section>
          </form>

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
                    <p className="font-bold text-charcoal">Flexible Check-in</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Duration</p>
                    <p className="font-bold text-charcoal">{nights} Night{nights > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-400">Standard Rate</span>
                    <span className="text-charcoal">GH₵{room.price * nights}.00</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-400">Concierge Service</span>
                    <span className="text-primary">Included</span>
                  </div>
                  <div className="flex justify-between items-center pt-8 border-t border-gray-100 font-black font-serif text-3xl">
                    <span className="text-charcoal">Total</span>
                    <span className="text-primary">GH₵{room.price * nights}.00</span>
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
