"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../login/LoginPage.module.css"; // Reuse login styles
import { Loader2 } from "lucide-react";

export default function AdminVerify() {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/verify", {
                method: "POST",
                body: JSON.stringify({ otp }),
            });

            if (res.ok) {
                router.push("/admin/dashboard");
                router.refresh(); // Refresh to update session state
            } else {
                const data = await res.json();
                setError(data.error || "Verification failed");
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
                <h1 className={styles.title}>Verify Access</h1>
                <p className={styles.subtitle}>Enter the 6-digit code sent to your email.</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleVerify}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Security Code</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            placeholder="123456"
                            maxLength={6}
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Code"}
                    </button>
                </form>
            </div>
        </div>
    );
}
