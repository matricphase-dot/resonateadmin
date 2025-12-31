'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function VerifyOTPContent() {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const verifyOtp = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp }),
            });

            if (res.ok) {
                window.location.href = '/admin'; // Force reload to trigger session checks
            } else {
                const data = await res.json();
                setError(data.error || 'Invalid code');
            }
        } catch (err) {
            setError('Verification failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 font-sans">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Enter Admin Code
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Check your ProtonMail inbox for the 6-digit code
                    </p>
                </div>
                <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
                    <div className="space-y-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="123456"
                                maxLength={6}
                                className="w-full p-4 text-center text-3xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent tracking-widest transition-all"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && verifyOtp()}
                            />
                        </div>

                        <button
                            onClick={verifyOtp}
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-blue-600 text-white py-4 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-bold transition-all shadow-lg active:scale-95 disabled:hover:bg-blue-600"
                        >
                            {loading ? 'Verifying...' : 'Verify Code & Login'}
                        </button>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-pulse">
                                🚨 {error}
                            </div>
                        )}

                        <div className="pt-2 text-center">
                            <button
                                onClick={() => router.push('/admin/login')}
                                className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400">
                    Resonate Admin Production Utility • {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}

export default function VerifyOTP() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <VerifyOTPContent />
        </Suspense>
    );
}
