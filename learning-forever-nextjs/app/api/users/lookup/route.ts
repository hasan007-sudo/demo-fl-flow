import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { UserLookupResult } from '@/types/user';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, whatsapp, agentType } = body;

    // At least one contact method must be provided
    if (!email && !whatsapp) {
      return NextResponse.json(
        { error: 'Email or WhatsApp number is required' },
        { status: 400 }
      );
    }

    // Validate agentType
    if (!agentType || (agentType !== 'english_tutor' && agentType !== 'interview_preparer')) {
      return NextResponse.json(
        { error: 'agentType is required and must be "english_tutor" or "interview_preparer"' },
        { status: 400 }
      );
    }

    // Build the where clause to search by email OR whatsapp
    const whereClause: any = {
      OR: [],
    };

    if (email) {
      whereClause.OR.push({ email });
    }

    if (whatsapp) {
      whereClause.OR.push({ whatsapp });
    }

    // Find the most recent user matching email or whatsapp
    const user = await prisma.user.findFirst({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!user) {
      const result: UserLookupResult = {
        found: false,
        agentType,
      };
      return NextResponse.json(result);
    }

    // Fetch the user's most recent questionnaire response based on agentType
    if (agentType === 'english_tutor') {
      const latestResponse = await prisma.englishTutorQnResponses.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      const result: UserLookupResult = {
        found: true,
        agentType: 'english_tutor',
        user,
        latestResponse: latestResponse || undefined,
      };
      return NextResponse.json(result);
    }

    // interview_preparer
    const latestResponse = await prisma.interviewPreparerQnResponses.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const result: UserLookupResult = {
      found: true,
      agentType: 'interview_preparer',
      user,
      latestResponse: latestResponse || undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in user lookup:', error);
    return NextResponse.json(
      { error: 'Failed to lookup user' },
      { status: 500 }
    );
  }
}
