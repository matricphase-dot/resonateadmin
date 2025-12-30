import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/security/authz';
import { z } from 'zod';

export async function GET() {
  await requireAdmin();
  const articles = await prisma.supportArticle.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();
  const schema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    contentMarkdown: z.string().min(1),
    category: z.string().optional(),
    isPublished: z.boolean().optional(),
  });

  const validation = schema.safeParse(body);
  if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });

  const item = await prisma.supportArticle.create({
    data: {
      ...validation.data,
      category: validation.data.category || 'general'
    }
  });
  return NextResponse.json(item);
}

export async function PUT(request: Request) {
  await requireAdmin();
  const body = await request.json();
  const { id, ...data } = body;

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const item = await prisma.supportArticle.update({
    where: { id },
    data
  });
  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  await prisma.supportArticle.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
