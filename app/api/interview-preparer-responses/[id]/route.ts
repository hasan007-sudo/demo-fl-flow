import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    console.log(`PATCH /api/interview-preparer-responses/${id} - Received payload:`, JSON.stringify(body, null, 2));

    // Validate ID
    if (!id || id.trim() === '') {
      console.error('Invalid ID provided:', id);
      return NextResponse.json(
        { error: 'Invalid ID provided', details: `ID is ${id}` },
        { status: 400 }
      );
    }

    // Check if response exists
    const existingResponse = await prisma.interviewPreparerQnResponses.findUnique({
      where: { id },
    });

    if (!existingResponse) {
      console.error(`Interview preparer response not found: ${id}`);
      return NextResponse.json(
        { error: 'Interview preparer response not found' },
        { status: 404 }
      );
    }

    // Update the response
    const updatedResponse = await prisma.interviewPreparerQnResponses.update({
      where: { id },
      data: {
        ...(body.interviewType && { interviewType: body.interviewType }),
        ...(body.jobRole && { jobRole: body.jobRole }),
        ...(body.experienceLevel && { experienceLevel: body.experienceLevel }),
        ...(body.targetIndustry && { targetIndustry: body.targetIndustry }),
        ...(body.companySize && { companySize: body.companySize }),
        ...(body.interviewFormat && { interviewFormat: body.interviewFormat }),
        ...(body.preparationLevel && { preparationLevel: body.preparationLevel }),
        ...(body.focusAreas && { focusAreas: body.focusAreas }),
        ...(body.weakPoints && { weakPoints: body.weakPoints }),
        ...(body.practiceGoals && { practiceGoals: body.practiceGoals }),
      },
    });

    console.log(`Successfully updated interview preparer response: ${id}`);
    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error('Error updating interview preparer response:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return NextResponse.json(
      {
        error: 'Failed to update interview preparer response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
