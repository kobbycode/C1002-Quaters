import React from 'react';

const GlobalLoader: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-charcoal flex flex-col items-center justify-center animate-fade-in">
            <div className="flex flex-col items-center gap-6">
                {/* Pulsing Logo Effect */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gold/20 rounded-full animate-ping blur-xl"></div>
                    <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-gold animate-spin relative z-10"></div>

                </div>

                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-white font-serif text-2xl tracking-wider">C1002 Quarters</h2>
                    <p className="text-gold text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                        Rooms Loading...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GlobalLoader;
