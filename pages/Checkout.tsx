
import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import SEO from '../components/SEO';

const Checkout: React.FC = () => {
  const { rooms, config, addBooking } = useSite();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || rooms[0]?.id;
  const room = rooms.find(r => r.id === roomId) || rooms[0];

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate booking confirmation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      await addBooking({
        roomId: room.id,
        roomName: room.name,
        guestName: `${formData.firstName} ${formData.lastName}`,
        guestEmail: formData.email,
        totalPrice: room.price * nights,
        nights: nights
      });

      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Booking error:", err);
      setError("We couldn't process your reservation. Please check your connection and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    const whatsappNumber = config.footer.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      `Hello C1002 Quarters Concierge! 🥂\n\nI just requested a reservation for the *${room.name}*.\n\n👤 *Guest:* ${formData.firstName} ${formData.lastName}\n📱 *Phone:* ${formData.phone}\n📧 *Email:* ${formData.email}\n🗓️ *Stay:* ${nights} Night${nights > 1 ? 's' : ''}\n\nLooking forward to finalizing my stay! ✨`
    )}`;

    return (
      <div className="pt-40 pb-20 min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
        <SEO title="Reservation Confirmed" description="Your stay at C1002 Quarters is confirmed." />
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-10">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-3xl md:text-5xl font-black font-serif mb-4 md:mb-6 text-charcoal">Akwaaba Home!</h1>
        <p className="text-gray-400 text-sm md:text-lg max-w-md mx-auto mb-8 md:mb-12 font-light">
          Your reservation for the <span className="text-charcoal font-bold">{room.name}</span> has been received. A concierge will reach out via email shortly to arrange your arrival.
        </p>

        <div className="flex flex-col gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white font-black py-4 px-10 rounded-2xl uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-green-700 transition-all flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.134.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Text Concierge
          </a>
          <Link to="/" className="text-gray-400 font-black py-4 px-10 rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:text-primary transition-all">
            Return Home
          </Link>
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
            <div className="bg-gold h-full" style={{ width: '85%' }} />
          </div>
          <p className="text-gray-500 text-sm leading-loose">
            No credit card required. Our concierge will follow up to finalize the billing.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <form onSubmit={handleBooking} className="flex-[2] space-y-8 animate-fade-in">
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

              <div className="mt-12 pt-12 border-t border-gray-50">
                {error && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center mb-6">
                    {error}
                  </div>
                )}
                <button
                  disabled={isProcessing}
                  className="relative w-full h-14 md:h-20 bg-primary text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-[#6B006B] transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 overflow-hidden disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Scheduling Stay...
                    </>
                  ) : (
                    <>Confirm Reservation</>
                  )}
                </button>
                <p className="mt-6 text-center text-[10px] uppercase font-black tracking-widest text-gray-400">
                  By clicking, you agree to our booking policy and terms of service.
                </p>
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
                    <p className="font-bold text-charcoal">Flexible</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Duration</p>
                    <p className="font-bold text-charcoal">{nights} Night{nights > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-400">Total Rate</span>
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

