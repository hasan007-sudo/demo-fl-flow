import { NextRequest, NextResponse } from 'next/server';
import { WebhookPayload, webhookPayloadSchema } from '@/reportsV2/schemas';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const payload = webhookPayloadSchema.parse(body) as WebhookPayload;

    if (payload.status === 'completed') {
      await prisma.report.upsert({
        where: { sessionId: payload.recording_id },
        update: {
          data: payload.data,
          updatedAt: new Date(),
        },
        create: {
          sessionId: payload.recording_id,
          data: payload.data,
        },
      });

      console.log(`✓ Evaluation stored for session: ${payload.recording_id}`);
    } else if (payload.status === 'failed') {
      console.error(`✗ Evaluation failed for session: ${payload.recording_id}`, payload.error);
    }

    return NextResponse.json({
      received: true,
      session_id: payload.recording_id,
      correlation_id: payload.correlation_id,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    console.error(`Payload received`, JSON.stringify(body));
    return NextResponse.json(
      {
        received: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
