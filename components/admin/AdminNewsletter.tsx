import React, { useState, useMemo } from 'react';
import { SiteConfig } from '../../types';
import { useToast } from '../../context/ToastContext';
import { AdminNewsletterModal } from './modals/AdminNewsletterModal';

interface AdminNewsletterProps {
    config: SiteConfig;
    updateConfig: (config: SiteConfig) => void;
}

export const AdminNewsletter: React.FC<AdminNewsletterProps> = ({ config, updateConfig }) => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const subscribers = config.newsletterSubscribers || [];

    const filteredSubscribers = useMemo(() => {
        return subscribers.filter(email =>
            email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subscribers, searchTerm]);

    const handleExportCsv = () => {
        if (subscribers.length === 0) return;

        const csvContent = "Email\n" + subscribers.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Subscriber list exported as CSV', 'success');
    };

    const handleRemoveSubscriber = (email: string) => {
        if (!window.confirm(`Are you sure you want to remove ${email}?`)) return;

        const newSubscribers = subscribers.filter(s => s !== email);
        updateConfig({
            ...config,
            newsletterSubscribers: newSubscribers
        });
        showToast('Subscriber removed from list', 'success');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden gap-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full pointer-events-none" />
                <div className="relative z-10">
                    <h3 className="text-2xl font-black font-serif text-charcoal">Registry of Interest</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Found {subscribers.length} patrons in the circle</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto relative z-10">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Find patron..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex items-center gap-2">
                        {subscribers.length > 0 && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-primary text-white font-black px-6 py-3 rounded-xl hover:bg-[#6B006B] transition-all shadow-lg shadow-primary/10 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                Broadcast
                            </button>
                        )}

                        {subscribers.length > 0 && (
                            <button
                                onClick={handleExportCsv}
                                className="bg-charcoal text-white font-black px-6 py-3 rounded-xl hover:bg-gold transition-all shadow-lg shadow-charcoal/10 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {subscribers.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-gray-100 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-6 grayscale opacity-50">📭</div>
                    <h4 className="text-xl font-black text-gray-300 font-serif">The Silence is Exquisite</h4>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs">No patrons have joined the correspondence circle yet. They will appear here once they register on the site.</p>
                </div>
            ) : filteredSubscribers.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-gray-100 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center">
                    <h4 className="text-xl font-black text-gray-300 font-serif">No Patrons Match Your Search</h4>
                    <button onClick={() => setSearchTerm('')} className="mt-4 text-[10px] font-black uppercase text-gold hover:underline tracking-widest">Clear Search</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSubscribers.map((email, i) => (
                        <div key={i} className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 relative">
                            <div className="w-12 h-12 rounded-2xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-colors">
                                <span className="text-xs font-black">#{subscribers.indexOf(email) + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-charcoal truncate" title={email}>{email}</p>
                                <p className="text-[9px] font-black uppercase text-gray-300 tracking-widest">Active Subscriber</p>
                            </div>
                            <button
                                onClick={() => handleRemoveSubscriber(email)}
                                className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg border border-red-100"
                                title="Remove Patron"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <AdminNewsletterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                config={config}
            />
        </div>
    );
};
