import { NextRequest, NextResponse } from 'next/server';
import { WebhookReceiver } from 'livekit-server-sdk';
import { prisma } from '@/lib/prisma';
import { generatePresignedUrlFromS3Url } from '@/lib/s3-client';

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const authHeader = request.headers.get('Authorization');

    // let event;

    // // Dev bypass: skip signature validation when no auth header in non-production
    // if (process.env.NODE_ENV !== 'production' && !authHeader) {
    //   console.log('⚠️ Dev mode: bypassing webhook signature validation');
    //   event = JSON.parse(body);
    // } else {
    //   if (!authHeader) {
    //     return NextResponse.json(
    //       { error: 'Missing authorization header' },
    //       { status: 401 }
    //     );
    //   }
    //   event = await receiver.receive(body, authHeader);
    // }

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const event = await receiver.receive(body, authHeader);

    console.log('📨 Webhook event received:', event.event);

    if (event.event === 'egress_ended') {
      const egressInfo = event.egressInfo;

      if (!egressInfo) {
        console.error('No egress info in webhook');
        return NextResponse.json({ error: 'No egress info' }, { status: 400 });
      }

      const roomName = egressInfo.roomName;
      const fileResults = egressInfo.fileResults;

      if (!fileResults || fileResults.length === 0) {
        console.error('No file results in egress info');
        return NextResponse.json({ error: 'No file results' }, { status: 400 });
      }
      console.log('File results:', fileResults[0]);

      const downloadUrl = fileResults[0].location;

      if (!downloadUrl) {
        console.error('No download URL in file results');
        return NextResponse.json({ error: 'No download URL' }, { status: 400 });
      }

      console.log('🎬 Recording complete:', {
        roomName,
        downloadUrl,
        egressId: egressInfo.egressId
      });

      const session = await prisma.session.findFirst({
        where: { roomName },
      });

      if (session) {
        await prisma.session.update({
          where: { id: session.id },
          data: { audioUrl: downloadUrl },
        });

        console.log('✅ Session updated with audio URL:', {
          sessionId: session.id,
          audioUrl: downloadUrl
        });

        // Trigger Reports API V2 evaluation
        try {
          const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
          const webhookUrl = `${baseUrl}/api/webhooks/evaluation`;

          // Generate presigned URL for Reports API (1 hour expiration)
          const presignedUrl = await generatePresignedUrlFromS3Url(downloadUrl, 3600);

          console.log('🚀 Triggering Reports API evaluation:', {
            sessionId: session.id,
            s3_url: presignedUrl,
            webhookUrl
          });

          const backendUrl = process.env.BACKEND_URL;
          const evaluationResponse = await fetch(`${backendUrl}/v2/evaluate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recording_id: session.id,
              s3_url: presignedUrl,
              webhook_url: webhookUrl,
            })
          });

          if (!evaluationResponse.ok) {
            const errorText = await evaluationResponse.text();
            console.error('Failed to trigger Reports API:', {
              status: evaluationResponse.status,
              error: errorText,
            });
          } else {
            const result = await evaluationResponse.json();
            console.log('✅ Reports API evaluation triggered:', {
              sessionId: session.id,
              correlationId: result.correlation_id,
            });
          }
        } catch (error) {
          console.error('Error triggering Reports API:', error);
        }
      } else {
        console.warn('Session not found for room:', roomName);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
