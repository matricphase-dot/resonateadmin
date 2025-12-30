
import Link from 'next/link';

export const metadata = {
    title: "Admin Dashboard | Resonate",
};

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
            <p className="text-gray-500">Welcome to the Resonate Admin Panel. Select a module from the sidebar.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/marketing" className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Traffic & Marketing Engine</h3>
                    <p className="text-gray-500 text-sm">Manage automated social posts, blog content, and analytics.</p>
                </Link>

                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg opacity-60">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Outreach (Coming Soon)</h3>
                    <p className="text-gray-500 text-sm">Automated DM & cold email campaigns.</p>
                </div>
            </div>
        </div>
    );
}
