import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tutors = await prisma.tutorProfile.findMany();
    return NextResponse.json(tutors);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    return NextResponse.json({ error: 'Failed to fetch tutors' }, { status: 500 });
  }
}
