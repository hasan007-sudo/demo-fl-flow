import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePresignedUrlFromS3Url } from '@/lib/s3-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const report = await prisma.report.findUnique({
      where: { sessionId },
      include: {
        session: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Generate presigned URL for audio playback (1 hour expiration)
    let presignedAudioUrl = null;
    if (report.session.audioUrl) {
      try {
        presignedAudioUrl = await generatePresignedUrlFromS3Url(
          report.session.audioUrl,
          3600
        );
      } catch (error) {
        console.error('Failed to generate presigned URL:', error);
      }
    }

    return NextResponse.json({
      id: report.id,
      sessionId: report.sessionId,
      data: report.data,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      session: {
        id: report.session.id,
        agentType: report.session.agentType,
        audioUrl: presignedAudioUrl,
        startedAt: report.session.startedAt,
        endedAt: report.session.endedAt,
        user: report.session.user ? {
          id: report.session.user.id,
          name: report.session.user.name,
          email: report.session.user.email,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
