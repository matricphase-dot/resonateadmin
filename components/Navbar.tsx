"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <Link href="/admin/dashboard" className={styles.logo}>
                Resonate Admin
            </Link>
            <div className={styles.navLinks}>
                <Link href="/admin/marketing" className={styles.link}>
                    Marketing
                </Link>
                <Link href="/admin/outreach" className={styles.link}>
                    Outreach
                </Link>
                <Link href="/admin/support" className={styles.link}>
                    Support
                </Link>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Superadmin
                </div>
            </div>
        </nav>
    );
}
