import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        user: true,
        englishResponse: true,
        matchedTutor: true,
        interviewResponse: true,
        matchedInterviewer: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    // Check if session exists
    const existingSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update the session
    const updateData: any = {};
    if (body.endedAt) {
      updateData.endedAt = new Date(body.endedAt);
    }
    if (body.status) {
      updateData.status = body.status;
    }
    if (body.endReason) {
      updateData.endReason = body.endReason;
    }
    if (body.audioUrl) {
      updateData.audioUrl = body.audioUrl;
    }
    if (body.roomName !== undefined) {
      updateData.roomName = body.roomName;
    }
    if (body.participantToken !== undefined) {
      updateData.participantToken = body.participantToken;
    }
    if (body.serverUrl !== undefined) {
      updateData.serverUrl = body.serverUrl;
    }
    if (body.egressId !== undefined) {
      updateData.egressId = body.egressId;
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
