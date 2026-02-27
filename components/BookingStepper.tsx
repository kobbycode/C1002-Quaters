import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface StepperProps {
    currentStep: number;
    onSearchClick?: () => void;
}

const steps = [
    { id: 1, label: 'SEARCH' },
    { id: 2, label: 'MAKE SELECTION' },
    { id: 3, label: 'GUEST INFORMATION' },
    { id: 4, label: 'CONFIRMATION' },
];

const BookingStepper: React.FC<StepperProps> = ({ currentStep, onSearchClick }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleStepClick = (stepId: number) => {
        // Rules:
        // 1. Can click to go back (stepId < currentStep) or stays on current step (same logic)
        // 2. Can't click to go next (stepId > currentStep)
        if (stepId > currentStep) return;

        if (stepId === 1) {
            if (location.pathname === '/rooms') {
                onSearchClick?.();
            } else {
                navigate('/rooms?openFilter=true');
            }
        } else if (stepId === 2) {
            navigate('/rooms');
        } else if (stepId === 3) {
            // If we are at Step 3 or 4, we can navigate back to checkout form if needed
            // but usually Step 3 means we are already on Checkout.
            // Navigation to checkout requires room selection, so we rely on existing navigation
            if (location.pathname !== '/checkout') {
                // This case shouldn't happen much based on 'backward only' rule,
                // but if it does, navigating to /checkout might fail without search params.
                // For now, let's keep it simple.
                navigate('/checkout' + location.search);
            }
        }
    };

    return (
        <div className="w-full bg-[#f3f3f3] py-8 mb-12 animate-fade-in border-b border-gray-200/50">
            <div className="max-w-[1400px] mx-auto px-4 md:px-10">
                <div className="flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-6">
                    {steps.map((step) => {
                        const isActive = step.id <= currentStep;
                        const isCurrent = step.id === currentStep;
                        const isNavigable = step.id <= currentStep && step.id !== 4; // Can't manually navigate to confirmation

                        return (
                            <div
                                key={step.id}
                                onClick={() => handleStepClick(step.id)}
                                className={`flex items-center gap-3 md:gap-4 transition-all duration-300 ${isNavigable ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'
                                    } ${step.id > currentStep ? 'grayscale' : ''}`}
                            >
                                <div
                                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-black transition-all duration-500 ${isActive
                                            ? 'bg-charcoal text-white shadow-lg shadow-charcoal/20'
                                            : 'border-2 border-charcoal/30 text-charcoal/40 bg-white'
                                        } ${isCurrent ? 'ring-4 ring-gold/20' : ''}`}
                                >
                                    {step.id}
                                </div>
                                <span
                                    className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? 'text-charcoal' : 'text-charcoal/40'
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BookingStepper;
