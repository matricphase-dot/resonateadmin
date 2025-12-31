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
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed');
            } else {
                setStep('code');
                setError('✅ Use code: 123456');
            }
        } catch (err) {
            setError('Connection failed');
        }

        setLoading(false);
    };

    const verifyCode = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: code }),
            });

            if (res.ok) {
                window.location.href = '/admin'; // Force reload to dashboard
            } else {
                const data = await res.json();
                setError(data.error || 'Wrong code');
            }
        } catch (err) {
            setError('Verification failed');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        Admin Portal
                    </h1>
                    <p className="text-gray-600">Resonate Control Panel</p>
                </div>

                {step === 'email' ? (
                    <>
                        <div className="space-y-4 mb-6">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-emerald-500 focus:border-transparent text-lg transition-all"
                                placeholder="resonate.admin8153@protonmail.com"
                            />
                            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <strong>EXACT EMAIL REQUIRED:</strong><br />
                                resonate.admin8153@protonmail.com
                            </div>
                        </div>
                        <button
                            onClick={sendCode}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-4 px-6 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : '📤 Send Code'}
                        </button>
                    </>
                ) : (
                    <>
                        <div className="space-y-4 mb-6">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                className="w-full p-6 text-center text-4xl font-black border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500 focus:border-transparent tracking-[10px] bg-gradient-to-r from-emerald-50 to-blue-50 transition-all font-mono"
                                placeholder="123456"
                            />
                            <div className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl font-mono border border-emerald-100">
                                💡 Use code: <strong>123456</strong>
                            </div>
                        </div>
                        <button
                            onClick={verifyCode}
                            disabled={loading || code.length !== 6}
                            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-4 px-6 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? 'Unlocking...' : '🚀 Unlock Admin'}
                        </button>
                        <button
                            onClick={() => setStep('email')}
                            className="w-full text-gray-400 hover:text-gray-600 text-sm font-medium py-4 mt-2 transition-colors"
                        >
                            ← Back to Email
                        </button>
                    </>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border-2 border-red-100 text-red-800 rounded-2xl text-sm font-medium mt-4 animate-pulse">
                        {error}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Resonate Production Environment</p>
                </div>
            </div>
        </div>
    );
}
