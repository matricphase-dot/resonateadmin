export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-16 text-center">
                    <h1 className="text-7xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tighter">
                        🎉 COMMAND CENTER
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.5em] text-xs">Resonate Admin Dashboard</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <a href="/admin/marketing" className="group p-10 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border-2 border-emerald-100 hover:border-emerald-300 shadow-xl hover:shadow-2xl' transform hover:-translate-y-4 transition-all duration-700">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl mb-6 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🚀</div>
                        <h2 className="text-3xl font-black text-emerald-900 mb-2">Marketing</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">Scale your reach with AI-powered content generation.</p>
                    </a>

                    <a href="/admin/outreach" className="group p-10 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border-2 border-blue-100 hover:border-blue-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-700">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl mb-6 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📧</div>
                        <h2 className="text-3xl font-black text-blue-900 mb-2">Outreach</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">Automate your LinkedIn and email campaigns.</p>
                    </a>

                    <a href="/admin/support" className="group p-10 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border-2 border-purple-100 hover:border-purple-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-700">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl mb-6 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🛠️</div>
                        <h2 className="text-3xl font-black text-purple-900 mb-2">Support</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">Manage tickets and resolve user issues instantly.</p>
                    </a>
                </div>

                <footer className="mt-24 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 border border-gray-100 rounded-full shadow-sm text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        System Operational • All Modules Loaded
                    </div>
                </footer>
            </div>
        </div>
    );
}
