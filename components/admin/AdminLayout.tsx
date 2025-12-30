
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminLayout.module.css';
import { LayoutDashboard, Megaphone, Users, HelpCircle, LogOut, Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Traffic & Marketing', href: '/admin/marketing', icon: Megaphone },
        { name: 'Outreach', href: '/admin/outreach', icon: Users },
        { name: 'Support', href: '/admin/support', icon: HelpCircle },
    ];

    const handleSignOut = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    };

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    {/* Placeholder Logo Icon */}
                    <div style={{ width: 32, height: 32, background: 'var(--linkedin-blue)', borderRadius: 6 }}></div>
                    <span className={styles.logoText}>Resonate Admin</span>
                </div>
                <nav className={styles.nav}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                            >
                                <item.icon size={18} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Topbar */}
                <header className={styles.topbar}>
                    <div className={styles.breadcrumbs}>
                        Admin / <span className={styles.breadcrumbCurrent}>{menuItems.find(m => m.href === pathname)?.name || 'Page'}</span>
                    </div>
                    <div className={styles.userMenu}>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>Admin User</span>
                            <span className={styles.userRole}>Administrator</span>
                        </div>
                        <button onClick={handleSignOut} className={styles.signOutButton}>
                            Sign Out
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className={styles.pageContent}>
                    {children}
                </div>
            </main>
        </div>
    );
}
