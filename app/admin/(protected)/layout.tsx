import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;

    if (!adminSession) {
        redirect('/admin/login');
    }

    return (
        <div>
            <nav style={{ padding: '1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <strong>Admin Dashboard</strong>
            </nav>
            {children}
        </div>
    );
}
