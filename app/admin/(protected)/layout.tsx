
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/security/authz';
import AdminLayout from '@/components/admin/AdminLayout';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    try {
        await requireAdmin();
    } catch (e) {
        redirect('/admin/login');
    }

    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
