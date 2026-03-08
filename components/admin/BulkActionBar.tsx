import React from 'react';

interface BulkActionBarProps {
    selectedCount: number;
    actions: {
        label: string;
        icon: React.ReactNode;
        onClick: () => void;
        variant?: 'danger' | 'primary' | 'success';
    }[];
    onClear: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, actions, onClear }) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="bg-charcoal text-white px-8 py-4 rounded-[2rem] shadow-2xl shadow-charcoal/40 flex items-center gap-8 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-4 pr-8 border-r border-white/10">
                    <span className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center font-black text-sm">
                        {selectedCount}
                    </span>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Selected</p>
                        <p className="text-xs font-bold">Items</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {actions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.onClick}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${action.variant === 'danger'
                                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                                    : action.variant === 'success'
                                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'
                                        : 'bg-white/5 text-gray-300 hover:bg-white hover:text-charcoal'
                                }`}
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    ))}
                </div>

                <div className="pl-4 border-l border-white/10">
                    <button
                        onClick={onClear}
                        className="p-2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                        title="Deselect All"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
