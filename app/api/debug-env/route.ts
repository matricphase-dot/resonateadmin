import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER,
        port: process.env.SMTP_PORT,
    });
}
