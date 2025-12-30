
import { NextResponse } from 'next/server';
import { bootstrapAdmin } from '@/lib/adminAuth';

export async function GET() {
    try {
        const result = await bootstrapAdmin();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
