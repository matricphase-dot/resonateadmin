import { NextRequest, NextResponse } from "next/server";
import { setAdminSession, isAdminEmail } from "@/lib/security/authz";
import { verify } from "@/lib/security/jwt";

export async function POST(req: NextRequest) {
    const otpContext = req.cookies.get("resonate_admin_otp_context")?.value;
    if (!otpContext) {
        return NextResponse.json({ error: "Session expired or invalid" }, { status: 400 });
    }

    const { otp } = await req.json();
    if (!otp) {
        return NextResponse.json({ error: "Missing OTP" }, { status: 400 });
    }

    // Verify context token
    const payload = await verify(otpContext, process.env.ADMIN_OTP_SECRET || "default-secret");
    if (!payload) {
        return NextResponse.json({ error: "Invalid context" }, { status: 400 });
    }

    if (Date.now() > payload.exp) {
        return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    // Verify OTP hash
    const encoder = new TextEncoder();
    const data = encoder.encode(otp);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const inputHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

    if (inputHash !== payload.otpHash) {
        return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    // Double check allowlist just in case (though login filtered it)
    if (!isAdminEmail(payload.email)) {
        return NextResponse.json({ error: "Unauthorized email" }, { status: 403 });
    }

    // Success! Create Admin Session
    await setAdminSession(payload.email);

    const res = NextResponse.json({ success: true });
    // Clear the OTP context
    res.cookies.delete("resonate_admin_otp_context");

    return res;
}
