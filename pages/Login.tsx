import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isUserAdmin } from '../utils/auth-utils';
import { useSite } from '../context/SiteContext';

const Login = () => {
    const { config } = useSite();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Get the return path from location state, default to specific role dashboards
    const from = (location.state as any)?.from?.pathname;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);

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
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-6 pt-24">
            <div className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-2xl animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-serif italic text-charcoal mb-2">Welcome Back</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">Member Access</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 text-sm font-bold p-4 rounded-xl mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gold text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400 font-medium">
                        New to {config.brand.name}?{' '}
                        <Link to="/signup" state={{ from: (location.state as any)?.from }} className="text-gold font-bold hover:underline">
                            Create an Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
