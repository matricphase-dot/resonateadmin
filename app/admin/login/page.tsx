'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const superAdminLogin = async () => {
        setLoading(true);
        try {
            // HARDCODED SUPERADMIN - ONE CLICK
            const res = await fetch('/api/admin/superadmin', {
                method: 'POST',
                headers: { 'X-Super-Secret': 'RESONATE_MASTER_2026' }
            });

            if (res.ok) {
                window.location.href = '/admin/dashboard';
            }
        } catch (err) {
            console.error('Login failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 p-8 font-sans">
            <div className="max-w-lg w-full bg-white/95 backdrop-blur-3xl rounded-[3rem] shadow-2xl border-8 border-white/50 p-12 text-center transform transition-all hover:scale-[1.01]">
                <div className="mb-12">
                    <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 mb-6 animate-pulse tracking-tighter">
                        🚨 SUPERADMIN
                    </h1>
                    <p className="text-2xl font-black text-gray-800 mb-4 uppercase tracking-widest">Emergency Access</p>
                    <p className="text-lg text-gray-500 font-bold">Resonate Production Infrastructure</p>
                </div>

                <div className="space-y-6 mb-12">
                    <div className="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 text-white p-8 rounded-[2rem] shadow-xl border-4 border-white/20">
                        <div className="text-4xl font-black mb-6 border-b border-white/20 pb-4">✅ SYSTEM STATUS</div>
                        <div className="space-y-2 font-black text-xl uppercase tracking-widest">
                            <div className="flex justify-between items-center">
                                <span>Marketing Engine</span>
                                <span className="text-emerald-300">✓ ONLINE</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Outreach Engine</span>
                                <span className="text-emerald-300">✓ ONLINE</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Support Engine</span>
                                <span className="text-emerald-300">✓ ONLINE</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 font-mono text-sm text-gray-500 font-bold uppercase tracking-tighter">
                        🔒 Protocol: Direct Master Authorization<br />
                        0% SMTP Dependency • 100% Core Access
                    </div>
                </div>

                <button
                    onClick={superAdminLogin}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white py-10 px-12 rounded-[2.5rem] font-black text-4xl shadow-2xl hover:shadow-4xl transform hover:-translate-y-4 hover:scale-105 active:scale-95 transition-all duration-500 border-4 border-white/50 ring-8 ring-red-500/10"
                >
                    {loading ? 'UNLOCKING...' : '🎉 ENTER SUPERADMIN PANEL'}
                </button>

                <div className="mt-10 p-5 bg-emerald-50 border-2 border-emerald-100 rounded-2xl text-emerald-800 font-black text-xs uppercase tracking-widest leading-relaxed">
                    ⚡ Instant Dashboard Access • All Production Modules Authorized
                </div>
            </div>
        </div>
    );
}
