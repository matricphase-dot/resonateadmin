import { requireAdmin } from '@/lib/security/authz';
import { NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
  await requireAdmin();
  await destroyAdminSession();
  return NextResponse.json({ success: true });
}
