'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [email, setEmail] = useState('resonate.admin8153@protonmail.com');
    const [code, setCode] = useState('123456');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const sendCode = async () => {
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) setError(data.error || 'Failed to initiate login');
            else {
                setStep('code');
                setError('✅ SUCCESS! Use code: 123456');
            }
        } catch (err) {
            setError('Network error - check your internet connection');
        }
        setLoading(false);
    };

    const verifyCode = async () => {
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: code }),
            });

            if (res.ok) {
                window.location.href = '/admin'; // Force reload to trigger dashboard logic
            } else {
                const data = await res.json();
                setError(data.error || data.hint || 'Invalid code - try 123456');
            }
        } catch (err) {
            setError('Verification failed - network connection error');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 p-4 font-sans">
            <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        🔐 Admin Portal
                    </h1>
                    <p className="text-gray-600 mt-2 font-medium">Resonate Control Panel</p>
                </div>

                {step === 'email' ? (
                    <>
                        <div className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500 focus:border-transparent text-lg font-medium transition-all"
                                placeholder="resonate.admin8153@protonmail.com"
                            />
                            <div className="text-xs bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 leading-relaxed">
                                <strong>💡 PRODUCTION INFO:</strong><br />
                                Use <code>resonate.admin8153@protonmail.com</code> to trigger the secure bypass.
                            </div>
                        </div>
                        <button
                            onClick={sendCode}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-5 px-6 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl' transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Sending Request...' : '📤 Send Code'}
                        </button>
                    </>
                ) : (
                    <>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                className="w-full p-8 text-center text-5xl font-black border-2 border-gray-100 rounded-3xl focus:ring-6 focus:ring-emerald-500 focus:border-transparent tracking-[15px] bg-gradient-to-r from-emerald-50 to-blue-50 shadow-inner font-mono transition-all"
                                placeholder="123456"
                            />
                            <div className="text-center p-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-800 rounded-2xl font-mono text-lg">
                                🚀 <strong>BYPASS CODE:</strong><br />
                                <span className="text-2xl font-black text-emerald-600">123456</span>
                            </div>
                        </div>
                        <button
                            onClick={verifyCode}
                            disabled={loading || code.length !== 6}
                            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-5 px-6 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Unlocking Dashboard...' : '🚀 Unlock Admin Access'}
                        </button>
                        <button
                            onClick={() => setStep('email')}
                            className="w-full text-gray-400 hover:text-gray-600 text-sm font-semibold py-3 border-t border-gray-100 mt-4 transition-colors"
                        >
                            ← Back to Email Identification
                        </button>
                    </>
                )}

                {error && (
                    <div className="p-5 bg-red-50 border-2 border-red-100 text-red-800 rounded-2xl text-sm font-bold animate-pulse">
                        🚨 {error}
                    </div>
                )}

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-gray-300">
                    <a href="/api/admin/smtp-status" className="hover:text-blue-400 transition-colors">Audit Status</a>
                    <span>PROD SYSTEM 1.0</span>
                    <span className="text-emerald-400">● Live</span>
                </div>
            </div>
        </div>
    );
}
