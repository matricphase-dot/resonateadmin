
// Pure crypto helpers for Edge/Node compatibility (no Next.js imports)

export async function sign(payload: any, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = btoa(JSON.stringify(payload));
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
    return `${data}.${signature}`;
}

export async function verify(token: string, secret: string): Promise<any | null> {
    if (!token) return null;
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    // Re-sign to verify
    const signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBuffer, encoder.encode(data));

    if (!isValid) return null;

    try {
        return JSON.parse(atob(data));
    } catch {
        return null;
    }
}
