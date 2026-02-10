import React, { useState } from 'react';
import { SiteConfig } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { useAiWriter } from '../../../hooks/useAiWriter';

interface AdminNewsletterModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: SiteConfig;
}

export const AdminNewsletterModal: React.FC<AdminNewsletterModalProps> = ({
    isOpen,
    onClose,
    config
}) => {
    const { showToast } = useToast();
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    const { generateContent, isAiGenerating } = useAiWriter({
        apiKey: process.env.API_KEY || '',
        brandVoice: config.brand.voice
    });

    if (!isOpen) return null;

    const handleAiDraft = async () => {
        try {
            const draft = await generateContent('about', `Draft a luxury hotel newsletter with the following subject or theme: ${subject || 'General update'}. Focus on elegance, Ghanaian hospitality, and exclusive quarters.`);
            if (draft) setContent(draft);
            showToast('AI draft generated!', 'success');
        } catch (err) {
            showToast('AI drafting failed', 'error');
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        // Simulating broadcast
        setTimeout(() => {
            showToast(`Newsletter broadcasted to ${config.newsletterSubscribers?.length || 0} patrons`, 'success');
            setIsSending(false);
            onClose();
            setSubject('');
            setContent('');
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-scale-in max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-2xl font-serif font-black text-charcoal">Broadcast Correspondence</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gold mt-1">Messaging {config.newsletterSubscribers?.length || 0} Patrons</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-charcoal transition-colors p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSend} className="p-10 space-y-8 overflow-y-auto no-scrollbar">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Subject Line</label>
                            <input
                                required
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="w-full bg-gray-50 border-transparent rounded-2xl p-6 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                                placeholder="e.g. An Evening of Unmatched Ghanaian Luxury..."
                            />
                        </div>

                        <div className="relative">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Content Body</label>
                                <button
                                    type="button"
                                    onClick={handleAiDraft}
                                    disabled={isAiGenerating}
                                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-[#6B006B] transition-colors disabled:opacity-50"
                                >
                                    {isAiGenerating ? (
                                        <>
                                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            AI Drafting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            Generate with AI
                                        </>
                                    )}
                                </button>
                            </div>
                            <textarea
                                required
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="w-full bg-gray-50 border-transparent rounded-2xl p-6 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all min-h-[300px] resize-none leading-relaxed"
                                placeholder="Compose your luxury update here..."
                            />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 transition-all"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="flex-1 py-5 bg-charcoal text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-xl shadow-charcoal/20 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isSending ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Broadcasting...
                                </>
                            ) : (
                                <>
                                    <span>Send Broadcast</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
