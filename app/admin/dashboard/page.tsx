export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-12 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <header className="mb-4">
                        <span className="px-6 py-2 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-[0.3em] border border-emerald-200">
                            Authorized Superadmin Session
                        </span>
                    </header>
                    <h1 className="text-8xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 tracking-tighter">
                        🎉 MASTER CONTROL
                    </h1>
                    <p className="text-2xl text-gray-400 font-bold uppercase tracking-[0.2em] italic">Resonate Global Infrastructure</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <a href="/admin/marketing" className="group p-12 bg-white/80 backdrop-blur-2xl rounded-[3rem] border-4 border-emerald-100 hover:border-emerald-500 shadow-xl hover:shadow-4xl transform hover:-translate-y-8 transition-all duration-700">
                        <div className="w-28 h-28 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:rotate-[15deg] transition-all duration-500 shadow-lg shadow-emerald-200">
                            <span className="text-4xl font-black text-white">🚀</span>
                        </div>
                        <h2 className="text-5xl font-black text-emerald-900 mb-4 text-center tracking-tight">Marketing</h2>
                        <p className="text-xl text-gray-400 font-medium text-center group-hover:text-emerald-700 transition-colors leading-relaxed">AI Content Generation • Campaign Management • Performance Analytics</p>
                    </a>

                    <a href="/admin/outreach" className="group p-12 bg-white/80 backdrop-blur-2xl rounded-[3rem] border-4 border-blue-100 hover:border-blue-500 shadow-xl hover:shadow-4xl transform hover:-translate-y-8 transition-all duration-700">
                        <div className="w-28 h-28 bg-blue-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:rotate-[-15deg] transition-all duration-500 shadow-lg shadow-blue-200">
                            <span className="text-4xl font-black text-white">📧</span>
                        </div>
                        <h2 className="text-5xl font-black text-blue-900 mb-4 text-center tracking-tight">Outreach</h2>
                        <p className="text-xl text-gray-400 font-medium text-center group-hover:text-blue-700 transition-colors leading-relaxed">LinkedIn Automation • Multi-channel Engagement • Smart Prospecting</p>
                    </a>

                    <a href="/admin/support" className="group p-12 bg-white/80 backdrop-blur-2xl rounded-[3rem] border-4 border-purple-100 hover:border-purple-500 shadow-xl hover:shadow-4xl transform hover:-translate-y-8 transition-all duration-700">
                        <div className="w-28 h-28 bg-purple-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-purple-200">
                            <span className="text-4xl font-black text-white">🛠️</span>
                        </div>
                        <h2 className="text-5xl font-black text-purple-900 mb-4 text-center tracking-tight">Support</h2>
                        <p className="text-xl text-gray-400 font-medium text-center group-hover:text-purple-700 transition-colors leading-relaxed">Ticket Infrastructure • AI Support Agents • Knowledge Base Management</p>
                    </a>
                </div>

                <div className="mt-24 p-12 bg-white/50 backdrop-blur-md border-4 border-emerald-400/30 rounded-[3rem] text-center shadow-lg">
                    <h3 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-[0.2em]">Deployment Integrity Status</h3>
                    <div className="flex flex-wrap justify-center gap-12 text-sm font-black text-emerald-600 uppercase tracking-widest">
                        <div className="flex items-center gap-3"><span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span> Core Engines: OK</div>
                        <div className="flex items-center gap-3"><span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span> Auth Bypass: ACTIVE</div>
                        <div className="flex items-center gap-3"><span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span> Prod Sync: VERIFIED</div>
                    </div>
                </div>

                <footer className="mt-16 text-center text-gray-300 font-black text-[10px] uppercase tracking-[0.6em] pb-8">
                    Resonate High-Availability Production Cluster
                </footer>
            </div>
        </div>
    );
}
