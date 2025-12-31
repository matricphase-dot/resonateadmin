'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [email, setEmail] = useState('resonate.admin8153@protonmail.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const loginDirect = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/direct-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                window.location.href = '/admin/dashboard';
            } else {
                const data = await res.json();
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error - check connection');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 p-4 font-sans">
            <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-red-200 p-10">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4">
                        🚨 EMERGENCY LOGIN
                    </h1>
                    <p className="text-xl font-bold text-gray-800 tracking-tight">Direct Admin Access</p>
                    <p className="text-sm text-gray-500 mt-2 font-medium">0% SMTP DEPENDENCY • 100% ACCESS</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500 focus:border-transparent text-lg font-mono transition-all"
                            placeholder="resonate.admin8153@protonmail.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Secret Key</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500 focus:border-transparent text-lg font-mono transition-all"
                            placeholder="admin123"
                        />
                    </div>

                    <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl text-center font-mono">
                        <div className="font-black text-xs text-red-400 mb-2 uppercase tracking-tighter">Hardcoded Credentials Verified</div>
                        <div className="text-gray-700 text-sm"><strong>USER:</strong> resonate.admin8153@protonmail.com</div>
                        <div className="mt-2 text-red-800"><strong>PASS:</strong> <span className="text-2xl font-black">admin123</span></div>
                    </div>

                    <button
                        onClick={loginDirect}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white py-6 px-8 rounded-3xl font-black text-xl shadow-xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 disabled:opacity-50 active:scale-95"
                    >
                        {loading ? 'Bypassing Security...' : '🚀 DIRECT ADMIN ACCESS'}
                    </button>

                    {error && (
                        <div className="p-5 bg-red-100 border-2 border-red-200 text-red-800 rounded-2xl font-bold text-center animate-pulse">
                            🚨 {error}
                        </div>
                    )}
                </div>

                <div className="text-center mt-10 p-4 bg-gray-50 rounded-2xl text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                    Resonate Infrastructure • Emergency Access Protocol
                </div>
            </div>
        </div>
    );
}
