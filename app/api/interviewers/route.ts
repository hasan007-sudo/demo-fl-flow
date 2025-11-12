import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const interviewers = await prisma.interviewerProfile.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(interviewers);
  } catch (error) {
    console.error('Error fetching interviewer profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviewer profiles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const interviewer = await prisma.interviewerProfile.create({
      data: body,
    });

    return NextResponse.json(interviewer);
  } catch (error) {
    console.error('Error creating interviewer profile:', error);
    return NextResponse.json(
      { error: 'Failed to create interviewer profile' },
      { status: 500 }
    );
  }
}
