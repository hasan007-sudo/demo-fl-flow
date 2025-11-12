import { NextRequest, NextResponse } from 'next/server';
import { WebhookReceiver } from 'livekit-server-sdk';
import { prisma } from '@/lib/prisma';

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const authHeader = request.headers.get('Authorization');

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
