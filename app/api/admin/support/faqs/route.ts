import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/security/authz';
import { z } from 'zod';

export async function GET() {
  await requireAdmin();
  const faqs = await prisma.supportFAQ.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json(faqs);
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();
  const schema = z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    category: z.string().optional(),
  });

  const validation = schema.safeParse(body);
  if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });

  const faq = await prisma.supportFAQ.create({
    data: {
      question: validation.data.question,
      answerMarkdown: validation.data.answer,
      category: validation.data.category || 'general'
    }
  });
  return NextResponse.json(faq);
}

export async function DELETE(request: Request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  await prisma.supportFAQ.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
