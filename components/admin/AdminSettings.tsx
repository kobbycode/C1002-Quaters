import React from 'react';
import { SiteConfig } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AdminSettingsProps {
    config: SiteConfig;
    updateConfig: (config: SiteConfig) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ config, updateConfig }) => {
    const { showToast } = useToast();

    const handleExportConfig = () => {
        const dataStr = JSON.stringify(config, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quarters_config_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showToast('Configuration backup exported');
    };

    const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedConfig = JSON.parse(event.target?.result as string);
                updateConfig(importedConfig);
                showToast('Configuration imported successfully', 'success');
            } catch (err) {
                showToast('Invalid configuration file', 'error');
            }
        };
        reader.readAsText(file);
    };

    const handleSeedDatabase = async () => {
        if (confirm('This will upload your current local data (Rooms & Config) to Firebase Firestore. Continue?')) {
            try {
                const { seedDatabase } = await import('../../utils/seedData');
                const success = await seedDatabase(config);
                if (success) showToast('Database seeded successfully!', 'success');
                else showToast('Failed to seed database.', 'error');
            } catch (e: any) {
                console.error(e);
                showToast(`Failed: ${e.message || 'Unknown error'}`, 'error');
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Data Backup Card */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-1.5 h-6 bg-gold rounded-full" />
                            <h3 className="text-2xl font-black font-serif text-charcoal">Data Sovereignty</h3>
                        </div>
                        {/* Database Seeding Button */}
                        <button
                            onClick={handleSeedDatabase}
                            className="mb-6 w-full bg-gold/10 text-gold border border-gold/20 font-black py-4 rounded-xl uppercase tracking-[0.2em] text-[10px] hover:bg-gold hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                            Initialize / Seed Database
                        </button>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            Download a full snapshot of your system configuration. This includes branding, room data, and orders.
                        </p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleExportConfig}
                                className="w-full bg-charcoal text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-gold transition-all flex items-center justify-center gap-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export Master Backup
                            </button>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportConfig}
                                    className="absolute inset-0 opacity-0 cursor-pointer pointer-events-auto"
                                />
                                <button
                                    className="w-full bg-gray-50 text-charcoal font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] border border-gray-100 flex items-center justify-center gap-3"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                                    </svg>
                                    Restore from Backup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Category Management Card */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h2 className="text-2xl font-black font-serif text-charcoal">Room Categories</h2>
                    </div>

                    <div className="space-y-4 mb-8">
                        {config.categories.map((cat, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-primary/30 transition-all">
                                <span className="text-sm font-bold text-charcoal">{cat}</span>
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete the category "${cat}"?`)) {
                                            const newCategories = config.categories.filter(c => c !== cat);
                                            updateConfig({ ...config, categories: newCategories });
                                            showToast(`Category "${cat}" removed`);
                                        }
                                    }}
                                    className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Category"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const input = form.elements.namedItem('newCategory') as HTMLInputElement;
                                const val = input.value.trim();
                                if (val && !config.categories.includes(val)) {
                                    updateConfig({ ...config, categories: [...config.categories, val] });
                                    showToast(`Category "${val}" added`);
                                    input.value = '';
                                } else if (config.categories.includes(val)) {
                                    showToast('Category already exists', 'error');
                                }
                            }}
                            className="flex gap-2"
                        >
                            <input
                                name="newCategory"
                                type="text"
                                placeholder="Add new category..."
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary outline-none transition-all"
                            />
                            <button
                                type="submit"
                                className="bg-charcoal text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
                            >
                                Add
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* System Preferences Card */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-6 bg-charcoal rounded-full" />
                    <h3 className="text-2xl font-black font-serif text-charcoal">System Pulse</h3>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Base Currency</label>
                        <select
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold focus:ring-gold outline-none"
                            value={config.currency || 'GHS'}
                            onChange={e => updateConfig({ ...config, currency: e.target.value })}
                        >
                            <option value="GHS">GHS - Ghanaian Cedi</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold mb-3 block">Timezone Node</label>
                        <select
                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-6 text-sm font-bold focus:ring-gold outline-none"
                            value={config.timezone || 'GMT'}
                            onChange={e => updateConfig({ ...config, timezone: e.target.value })}
                        >
                            <option value="GMT">GMT (Accra)</option>
                            <option value="UTC">UTC</option>
                            <option value="EST">EST (New York)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Maintenance Card */}
            <div className="bg-red-50/30 p-10 rounded-[2.5rem] border border-red-100 shadow-sm col-span-1 md:col-span-2">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                        <h3 className="text-2xl font-black font-serif text-charcoal">Hard Reset / Maintenance</h3>
                    </div>
                    <span className="bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Danger Zone</span>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 max-w-xl">
                        Clear all locally cached state and force a re-synchronization with the central node. This action cannot be undone.
                    </p>
                    <button
                        onClick={() => {
                            window.location.reload();
                            showToast('System cache cleared', 'info');
                        }}
                        className="bg-white text-red-600 border border-red-200 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                        Force Re-sync
                    </button>
                </div>
            </div>
        </div>
    );
};
