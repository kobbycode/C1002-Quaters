import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConfirmationOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info' | 'warning';
}

interface ConfirmationContextType {
    confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const useConfirmation = () => {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error('useConfirmation must be used within a ConfirmationProvider');
    }
    return context.confirm;
};

export const ConfirmationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modalConfig, setModalConfig] = useState<(ConfirmationOptions & { resolve: (value: boolean) => void }) | null>(null);

    const confirm = (options: ConfirmationOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setModalConfig({ ...options, resolve });
        });
    };

    const handleConfirm = () => {
        if (modalConfig) {
            modalConfig.resolve(true);
            setModalConfig(null);
        }
    };

    const handleCancel = () => {
        if (modalConfig) {
            modalConfig.resolve(false);
            setModalConfig(null);
        }
    };

    return (
        <ConfirmationContext.Provider value={{ confirm }}>
            {children}
            {modalConfig && (
                <ConfirmationModal
                    {...modalConfig}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ConfirmationContext.Provider>
    );
};

// Internal Modal Component for consistent styling
interface ConfirmationModalProps extends ConfirmationOptions {
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info',
    onConfirm,
    onCancel
}) => {
    const typeStyles = {
        danger: 'bg-red-500 hover:bg-red-600 shadow-red-200',
        info: 'bg-gold hover:bg-[#C5A059] shadow-gold/20',
        warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-charcoal/60 backdrop-blur-md transition-opacity"
                onClick={onCancel}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 overflow-hidden shadow-2xl animate-scale-in">
                {/* Decorative Element */}
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full pointer-events-none ${type === 'danger' ? 'bg-red-500' : 'bg-gold'}`} />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-1.5 h-6 rounded-full ${type === 'danger' ? 'bg-red-500' : 'bg-gold'}`} />
                        <h3 className="text-2xl font-black font-serif text-charcoal">{title}</h3>
                    </div>

                    <p className="text-gray-500 text-sm leading-relaxed mb-10">
                        {message}
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-gray-50 text-charcoal font-black py-4 rounded-xl uppercase tracking-widest text-[10px] border border-transparent hover:border-gray-200 transition-all"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[10px] shadow-lg transition-all ${typeStyles[type]}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
