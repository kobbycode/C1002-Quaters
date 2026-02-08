import React from 'react';
import { SiteConfig } from '../../types';

interface AdminFooterProps {
    config: SiteConfig;
    updateConfig: (config: SiteConfig) => void;
}

export const AdminFooter: React.FC<AdminFooterProps> = ({ config, updateConfig }) => {
    return (
        <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm animate-fade-in">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-1.5 h-6 bg-charcoal rounded-full" />
                <h3 className="text-2xl font-black font-serif text-charcoal">Global Footer Config</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">About Brand Text</label>
                    <textarea
                        rows={3}
                        value={config.footer.aboutText}
                        onChange={e => updateConfig({ ...config, footer: { ...config.footer, aboutText: e.target.value } })}
                        className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold focus:ring-gold outline-none"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Address Node</label>
                    <input
                        type="text"
                        value={config.footer.address}
                        onChange={e => updateConfig({ ...config, footer: { ...config.footer, address: e.target.value } })}
                        className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold focus:ring-gold outline-none"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Contact Phone</label>
                    <input
                        type="text"
                        value={config.footer.phone}
                        onChange={e => updateConfig({ ...config, footer: { ...config.footer, phone: e.target.value } })}
                        className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold focus:ring-gold outline-none"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Official Email Ledger</label>
                    <input
                        type="email"
                        value={config.footer.email}
                        onChange={e => updateConfig({ ...config, footer: { ...config.footer, email: e.target.value } })}
                        className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold focus:ring-gold outline-none"
                    />
                </div>
            </div>
        </div>
    );
};
