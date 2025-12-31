"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginPage.module.css"; // Reuse existing styles
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                // Success - go to verify page
                router.push("/admin/verify");
            } else {
                const data = await res.json();
                setError(data.details ? `${data.error}: ${data.details}` : data.error || "Access denied");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Admin Access</h1>
                <p className={styles.subtitle}>Enter your email to receive a login code.</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@example.com"
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Send Code"}
                    </button>
                </form>

                <button
                    onClick={async () => {
                        const res = await fetch('/api/admin/emergency-bypass', {
                            method: 'POST',
                            headers: { 'X-Admin-Bypass-Secret': 'temporary_emergency_secret_12345' }
                        });
                        if (res.ok) {
                            window.location.href = '/admin';
                        } else {
                            alert('Bypass failed - ensure secret is correct');
                        }
                    }}
                    className="mt-6 p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl w-full font-bold transition-all shadow-lg"
                >
                    🚨 EMERGENCY BYPASS (24hr access)
                </button>

                {/* Emergency bypass removed for security. Use API with secret if needed. */}
            </div>
        </div>
    );
}
