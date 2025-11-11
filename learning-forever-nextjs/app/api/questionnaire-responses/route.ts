import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/questionnaire-responses - Received payload:', JSON.stringify(body, null, 2));

    const {
      userId,
      proficiencyLevel,
      genderPreference,
      speakingSpeed,
      learningGoals,
      comfortableLanguage,
      tutorStyles,
      correctionPreference,
    } = body;

    // Validate required fields with specific missing field tracking
    const missingFields: string[] = [];
    if (!userId) missingFields.push('userId');
    if (!proficiencyLevel) missingFields.push('proficiencyLevel');
    if (!genderPreference) missingFields.push('genderPreference');
    if (!speakingSpeed) missingFields.push('speakingSpeed');
    if (!learningGoals) missingFields.push('learningGoals');
    if (!comfortableLanguage) missingFields.push('comfortableLanguage');
    if (!tutorStyles) missingFields.push('tutorStyles');
    if (!correctionPreference) missingFields.push('correctionPreference');

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

    // Check if user already has a questionnaire response
    const existingResponse = await prisma.englishTutorQnResponses.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    let response;

    if (existingResponse) {
      // Update existing response
      response = await prisma.englishTutorQnResponses.update({
        where: { id: existingResponse.id },
        data: {
          proficiencyLevel,
          genderPreference,
          speakingSpeed,
          learningGoals,
          comfortableLanguage,
          tutorStyles,
          correctionPreference,
        },
      });

      console.log('Successfully updated existing questionnaire response:', response.id);
    } else {
      // Create new English tutor questionnaire response
      response = await prisma.englishTutorQnResponses.create({
        data: {
          userId,
          proficiencyLevel,
          genderPreference,
          speakingSpeed,
          learningGoals,
          comfortableLanguage,
          tutorStyles,
          correctionPreference,
        },
      });

      console.log('Successfully created new questionnaire response:', response.id);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating questionnaire response:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return NextResponse.json(
      {
        error: 'Failed to create questionnaire response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
