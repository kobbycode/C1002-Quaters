
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin');
        } catch (err: any) {
            console.error(err);
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-charcoal flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[2rem] p-10 shadow-2xl animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-serif italic text-charcoal mb-2">C1002 Quarters</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">Admin Portal Access</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 text-sm font-bold p-4 rounded-xl mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email/ID</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-charcoal font-medium outline-none focus:border-gold transition-colors"
                            placeholder="admin@c1002quarters.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Passcode</label>
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
                        className="w-full bg-gold text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Authenticating...' : 'Enter Command Node'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
