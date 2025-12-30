"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import styles from "./Navbar.module.css";

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.logo}>
                Resonate
            </Link>
            <div className={styles.navLinks}>
                <Link href="/dashboard" className={styles.link}>
                    Dashboard
                </Link>
                <Link href="/pricing" className={styles.link}>
                    Pricing
                </Link>
                <Link href="/hook-analyzer" className={styles.link}>
                    Hook Engine
                </Link>
                <Link href="/repurpose" className={styles.link}>
                    Repurpose
                </Link>
                <Link href="/comments" className={styles.link}>
                    Comments
                </Link>
                <Link href="/calendar" className={styles.link}>
                    Calendar
                </Link>
                <Link href="/extension" className={styles.link}>
                    Extension
                </Link>
                <Link href="/admin/marketing" className={styles.link}>
                    Admin
                </Link>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className={styles.link} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "inherit" }}>
                            Sign In
                        </button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
            </div>
        </nav>
    );
}
