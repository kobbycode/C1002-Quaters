
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useNavigate } from 'react-router-dom';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthenticated(true);
            } else {
                setAuthenticated(false);
                navigate('/login');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-charcoal flex items-center justify-center">
                <div className="w-2 h-2 bg-gold rounded-full animate-ping" />
            </div>
        );
    }

    return authenticated ? <>{children}</> : null;
};
