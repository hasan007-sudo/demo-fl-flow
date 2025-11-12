import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      agentType,
      englishResponseId,
      matchedTutorId,
      interviewResponseId,
      matchedInterviewerId,
      roomName,
      participantToken,
      serverUrl,
    } = body;

    // Validate required fields - only userId and agentType are required
    if (!userId || !agentType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId or agentType' },
        { status: 400 }
      );
    }

    // Create new session with status="active"
    // All other fields are optional - direct connection to agent without matching
    const session = await prisma.session.create({
      data: {
        userId,
        agentType,
        englishResponseId: englishResponseId || null,
        matchedTutorId: matchedTutorId || null,
        interviewResponseId: interviewResponseId || null,
        matchedInterviewerId: matchedInterviewerId || null,
        roomName: roomName || null,
        participantToken: participantToken || null,
        serverUrl: serverUrl || null,
        status: 'active',
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      egressId,
      roomName,
      serverUrl,
      participantToken,
      audioUrl,
      status,
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (egressId !== undefined) updateData.egressId = egressId;
    if (roomName !== undefined) updateData.roomName = roomName;
    if (serverUrl !== undefined) updateData.serverUrl = serverUrl;
    if (participantToken !== undefined) updateData.participantToken = participantToken;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
    if (status !== undefined) updateData.status = status;

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
