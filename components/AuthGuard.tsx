import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthGuard: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
    children,
    requireAdmin = false
}) => {
    const { user, loading, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-charcoal flex items-center justify-center">
                <div className="w-2 h-2 bg-gold rounded-full animate-ping" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && !isAdmin) {
        // Logged in but not an admin, send to profile
        return <Navigate to="/profile" replace />;
    }

    return <>{children}</>;
};
