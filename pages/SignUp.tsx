import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isUserAdmin } from '../utils/auth-utils';
import { useSite } from '../context/SiteContext';

const SignUp = () => {
    const { config } = useSite();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Get the return path from location state
    const from = (location.state as any)?.from?.pathname;

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: name
            });

            // Use centralized admin check
            const isAdmin = isUserAdmin(email, config);

            if (from) {
                navigate(from);
            } else if (isAdmin) {
                navigate('/admin');
            } else {
                navigate('/profile');
            }

        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Email is already registered.');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-6 pt-24">
            <div className="w-full max-w-md bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-serif italic text-charcoal mb-2">Join {config.brand.name}</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">Create Your Account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 text-sm font-bold p-4 rounded-xl mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-charcoal font-medium outline-none focus:border-gold transition-colors"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-charcoal font-medium outline-none focus:border-gold transition-colors"
                            placeholder="john@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-charcoal font-medium outline-none focus:border-gold transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-charcoal font-medium outline-none focus:border-gold transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-charcoal text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" state={{ from: (location.state as any)?.from }} className="text-gold font-bold hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
