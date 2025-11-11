import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/interview-preparer-responses - Received payload:', JSON.stringify(body, null, 2));

    const {
      userId,
      interviewType,
      jobRole,
      experienceLevel,
      targetIndustry,
      companySize,
      interviewFormat,
      preparationLevel,
      focusAreas,
      weakPoints,
      practiceGoals,
    } = body;

    // Validate required fields with specific missing field tracking
    const missingFields: string[] = [];
    if (!userId) missingFields.push('userId');
    if (!interviewType) missingFields.push('interviewType');
    if (!jobRole) missingFields.push('jobRole');
    if (!experienceLevel) missingFields.push('experienceLevel');
    if (!focusAreas) missingFields.push('focusAreas');

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missingFields: missingFields,
          receivedPayload: body,
        },
        { status: 400 }
      );
    }

    // Create new interview preparer questionnaire response
    const response = await prisma.interviewPreparerQnResponses.create({
      data: {
        userId,
        interviewType,
        jobRole,
        experienceLevel,
        targetIndustry: targetIndustry || 'technology', // Default to technology
        companySize: companySize || 'startup', // Default to startup
        interviewFormat: interviewFormat || 'remote', // Default to remote
        preparationLevel: preparationLevel || 'some_experience', // Default to some experience
        focusAreas,
        weakPoints: weakPoints || [], // Default to empty array
        practiceGoals: practiceGoals || [], // Default to empty array
      },
    });

    console.log('Successfully created interview preparer response:', response.id);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating interview preparer response:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return NextResponse.json(
      {
        error: 'Failed to create interview preparer response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get the latest interview preparer response for the user
    const response = await prisma.interviewPreparerQnResponses.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    if (!response) {
      return NextResponse.json(
        { error: 'No interview preparer response found for user' },
        { status: 404 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching interview preparer response:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview preparer response' },
      { status: 500 }
    );
  }
}
