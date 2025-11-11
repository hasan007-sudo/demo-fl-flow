import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      agentType,
      matchedTutorId,
      matchedInterviewerId,
      npsScore,
      feedbackText,
    } = body;

    // Validate required fields - only sessionId and agentType are required
    if (!sessionId || !agentType) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId or agentType' },
        { status: 400 }
      );
    }

    // Validate NPS score range if provided
    if (npsScore !== null && npsScore !== undefined && (typeof npsScore !== 'number' || npsScore < 0 || npsScore > 10)) {
      return NextResponse.json(
        { error: 'Invalid npsScore: must be a number between 0 and 10' },
        { status: 400 }
      );
    }

    // Upsert session survey record (create if not exists, update if exists)
    const survey = await prisma.sessionSurvey.upsert({
      where: { sessionId },
      update: {
        npsScore: npsScore || null,
        feedbackText: feedbackText || null,
        matchedTutorId: matchedTutorId || null,
        matchedInterviewerId: matchedInterviewerId || null,
      },
      create: {
        sessionId,
        agentType,
        npsScore: npsScore || null,
        feedbackText: feedbackText || null,
        matchedTutorId: matchedTutorId || null,
        matchedInterviewerId: matchedInterviewerId || null,
      },
      include: {
        session: true,
        matchedTutor: true,
        matchedInterviewer: true,
      },
    });

    return NextResponse.json(survey, { status: 201 });
  } catch (error) {
    console.error('Error upserting session survey:', error);

    return NextResponse.json(
      { error: 'Failed to save session survey' },
      { status: 500 }
    );
  }
}
