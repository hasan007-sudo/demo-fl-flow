import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    console.log(`PATCH /api/questionnaire-responses/${id} - Received payload:`, JSON.stringify(body, null, 2));

    // Validate ID
    if (!id || id.trim() === '') {
      console.error('Invalid ID provided:', id);
      return NextResponse.json(
        { error: 'Invalid ID provided', details: `ID is ${id}` },
        { status: 400 }
      );
    }

    // Check if response exists
    const existingResponse = await prisma.englishTutorQnResponses.findUnique({
      where: { id },
    });

    if (!existingResponse) {
      console.error(`Questionnaire response not found: ${id}`);
      return NextResponse.json(
        { error: 'Questionnaire response not found' },
        { status: 404 }
      );
    }

    // Update the response
    const updatedResponse = await prisma.englishTutorQnResponses.update({
      where: { id },
      data: {
        ...(body.proficiencyLevel && { proficiencyLevel: body.proficiencyLevel }),
        ...(body.genderPreference && { genderPreference: body.genderPreference }),
        ...(body.speakingSpeed && { speakingSpeed: body.speakingSpeed }),
        ...(body.learningGoals && { learningGoals: body.learningGoals }),
        ...(body.comfortableLanguage && { comfortableLanguage: body.comfortableLanguage }),
        ...(body.tutorStyles && { tutorStyles: body.tutorStyles }),
        ...(body.correctionPreference && { correctionPreference: body.correctionPreference }),
      },
    });

    console.log(`Successfully updated questionnaire response: ${id}`);
    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error('Error updating questionnaire response:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return NextResponse.json(
      {
        error: 'Failed to update questionnaire response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
