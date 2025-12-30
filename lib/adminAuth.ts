
import { getAdminSession, setAdminSession } from '@/lib/security/authz';
import { cookies } from 'next/headers';

// --- Legacy Adapter for new Authz Module ---

// Mock matching the Prisma AdminUser shape roughly if needed, 
// or just return the session shape. 
// Existing code expects: { id, email, ... }
// New session: { id, email, role }
// We'll return the new session object as it satisfies id/email.

export async function getCurrentAdmin() {
    const session = await getAdminSession();
    if (!session) return null;
    return {
        id: session.id,
        email: session.email,
        passwordHash: "managed-by-otp",
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

export async function createAdminSession(adminUserId: string) {
    // This was used by password login. 
    // New login uses setAdminSession(email).
    // We can't support this easily without email.
    throw new Error("Use setAdminSession(email) instead.");
}

export async function destroyAdminSession() {
    const cookieStore = await cookies();
    cookieStore.delete("resonate_admin_session");
}

// --- Deprecated / Disabled Functions ---

export function hashPassword(password: string): string {
    return "disabled";
}

export function verifyPassword(password: string, storedHash: string): boolean {
    return false;
}

export async function bootstrapAdmin() {
    return { success: false, message: "Bootstrap disabled. Use OTP login with ALLOWLIST." };
}
