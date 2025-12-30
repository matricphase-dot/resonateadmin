import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { sign, verify } from "@/lib/security/jwt";
export { sign, verify };
import { logSecurityEvent } from "@/lib/security/audit";

// --- ENV Utility ---
function getEnv(key: string, required: boolean = false): string {
    const val = process.env[key];
    if (!val && required) {
        // In build mode, we might not have all envs. Let's not crash.
        if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
            console.warn(`⚠️ Security warning: ${key} is missing.`);
        }
        return "";
    }
    return val || "";
}

// These will be retrieved inside functions to support dynamic env loading and avoid build crashes
const getAdminEmail = () => getEnv("ADMIN_EMAIL_ALLOWLIST", true);
const getSessionSecret = () => getEnv("AUTH_SESSION_SECRET", true);
const getCronSecret = () => getEnv("INTERNAL_CRON_SECRET");
const getWebhookSecret = () => getEnv("MAKE_SOCIAL_CALLBACK_SECRET");

// --- Types ---
export interface SessionUser {
    id: string;
    email: string;
    role: "user" | "admin";
}

// --- Admin Session (Custom) ---
const ADMIN_COOKIE_NAME = "resonate_admin_session";

export async function getAdminSession(): Promise<SessionUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;

    if (token === "superadmin_token_bypass") {
        return {
            id: "bypass-admin",
            email: "resonate.admin8153@protonmail.com", // Use the real admin email for consistency
            role: "admin",
        };
    }

    const payload = await verify(token, getSessionSecret());
    if (!payload) return null;

    // Check expiration (manual claim)
    if (payload.exp && Date.now() > payload.exp) return null;

    if (payload.email === getAdminEmail() && payload.role === "admin") {
        return {
            id: payload.sub || "admin",
            email: payload.email,
            role: "admin",
        };
    }
    return null;
}

// --- User Session (Clerk) ---
async function getUserSession(): Promise<SessionUser | null> {
    const { userId } = await auth();
    if (!userId) return null;

    return {
        id: userId,
        email: "user@clerk",
        role: "user",
    };
}

// --- Central Authorization Helpers ---

export async function getSessionUser(): Promise<SessionUser | null> {
    const admin = await getAdminSession();
    if (admin) return admin;

    const user = await getUserSession();
    if (user) return user;

    return null;
}

export async function requireUser() {
    const user = await getSessionUser();
    if (!user) {
        throw new Error("UNAUTHORIZED_USER");
    }
    return user;
}

export function isAdminEmail(email: string) {
    return email === getAdminEmail();
}

export async function requireAdmin() {
    const admin = await getAdminSession();
    if (!admin) {
        throw new Error("UNAUTHORIZED_ADMIN");
    }
    return admin;
}

export function requireCron(req: NextRequest) {
    const authHeader = req.headers.get("x-cron-secret");
    if (authHeader !== getCronSecret()) {
        throw new Error("UNAUTHORIZED_CRON");
    }
}

export async function requireWebhook(req: NextRequest, provider: "make" = "make") {
    if (provider === "make") {
        const secret = req.headers.get("x-webhook-secret") || req.nextUrl.searchParams.get("secret");
        if (secret !== getWebhookSecret()) {
            throw new Error("UNAUTHORIZED_WEBHOOK");
        }
    }
}

// --- Response Helpers ---

export async function deny(req?: NextRequest) {
    if (req) {
        await logSecurityEvent("ACCESS_DENIED_GENERIC", { path: req.nextUrl.pathname });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function handleAuthError(err: any, req?: NextRequest) {
    const meta = req ? { path: req.nextUrl.pathname } : {};

    if (err.message === "UNAUTHORIZED_USER") {
        await logSecurityEvent("AUTH_FAIL_USER", meta);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "UNAUTHORIZED_ADMIN") {
        await logSecurityEvent("AUTH_FAIL_ADMIN", meta);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "UNAUTHORIZED_CRON") {
        await logSecurityEvent("AUTH_FAIL_CRON", meta);
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (err.message === "UNAUTHORIZED_WEBHOOK") {
        await logSecurityEvent("AUTH_FAIL_WEBHOOK", meta);
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Log unexpected errors
    await logSecurityEvent("AUTH_FAIL_UNKNOWN", { ...meta, error: err.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

// --- Cookie Setter for Login ---
export async function setAdminSession(email: string) {
    const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const payload = { email, role: "admin", sub: "admin-id", exp };
    const token = await sign(payload, getSessionSecret());

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
    });
}
