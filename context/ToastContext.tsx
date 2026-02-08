import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
    message: string;
    type: ToastType;
    visible: boolean;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
    hideToast: () => void;
    toast: ToastState;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<ToastState>({
        message: '',
        type: 'success',
        visible: false
    });

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, visible: false }));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => {
            hideToast();
        }, 3000);
    }, [hideToast]);

    return (
        <ToastContext.Provider value={{ showToast, hideToast, toast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
