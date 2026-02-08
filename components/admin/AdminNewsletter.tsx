import React from 'react';
import { SiteConfig } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AdminNewsletterProps {
    config: SiteConfig;
}

export const AdminNewsletter: React.FC<AdminNewsletterProps> = ({ config }) => {
    const { showToast } = useToast();
    const subscribers = config.newsletterSubscribers || [];

    const handleCopyAll = () => {
        if (subscribers.length === 0) return;
        navigator.clipboard.writeText(subscribers.join(', '));
        showToast('All email addresses copied to clipboard', 'success');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full pointer-events-none" />
                <div className="relative z-10">
                    <h3 className="text-2xl font-black font-serif text-charcoal">Registry of Interest</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Found {subscribers.length} patrons in the circle</p>
                </div>
                {subscribers.length > 0 && (
                    <button
                        onClick={handleCopyAll}
                        className="relative z-10 bg-charcoal text-white font-black px-8 py-4 rounded-xl hover:bg-gold transition-all shadow-xl shadow-charcoal/10 uppercase tracking-widest text-[10px] flex items-center gap-3"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Export Audience
                    </button>
                )}
            </div>

            {subscribers.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-gray-100 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-6 grayscale opacity-50">📭</div>
                    <h4 className="text-xl font-black text-gray-300 font-serif">The Silence is Exquisite</h4>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs">No patrons have joined the correspondence circle yet. They will appear here once they register on the site.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {subscribers.map((email, i) => (
                        <div key={i} className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-colors">
                                <span className="text-xs font-black">#{i + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-charcoal truncate">{email}</p>
                                <p className="text-[9px] font-black uppercase text-gray-300 tracking-widest">Active Subscriber</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
