import { headers } from "next/headers";

export async function logSecurityEvent(event: string, meta: any) {
    try {
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "unknown";
        const userAgent = headerList.get("user-agent") || "unknown";

        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            ip,
            userAgent,
            ...meta
        };

        // JSON stringify for easy parsing by log collectors (Datadog, AWS CloudWatch, etc.)
        console.log("SECURITY_AUDIT:", JSON.stringify(logEntry));

        // TODO: Insert into DB if required
        // await prisma.securityAuditLog.create({ ... })
    } catch (e) {
        // Fail safe - don't crash request if logging fails
        console.error("Failed to log security event", e);
    }
}
