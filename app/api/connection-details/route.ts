import {
  AccessToken,
  type AccessTokenOptions,
  type VideoGrant,
  RoomServiceClient
} from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import { startRoomRecording } from '@/lib/livekit-egress';

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const liveKitUrl = process.env.LIVEKIT_URL!;

const roomClient = new RoomServiceClient(liveKitUrl, apiKey, apiSecret);
const isDev = process.env.NODE_ENV !== 'production';

export async function POST(request: Request) {
  try {

    if (!apiKey || !apiSecret || !liveKitUrl) {
      return Response.json(
        { error: 'LiveKit credentials not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Extract room_config from body if present (from useConnectionDetails hook)
    const roomConfig = body.room_config;
    const agentName = roomConfig?.agents?.[0]?.agent_name || 'openai-realtime-agent';

    const { identity, name, context, agent_type, session_id } = body;

    console.log('📥 Received request:', {
      has_context: !!context,
      agent_type: agent_type || 'not provided',
      context_keys: context ? Object.keys(context) : [],
      session_id: session_id || 'not provided'
    });

    const participantIdentity = identity || `user_${Math.floor(Math.random() * 10_000)}`;
    const participantName = name || 'User';
    const roomName = `voice_room_${Math.floor(Math.random() * 10_000)}`;

   await roomClient.createRoom({
     name: roomName,
     metadata: JSON.stringify({
       context,
       agent_type: agent_type || 'english-tutor',
       session_id
     }),
     emptyTimeout: 60 * 10,
     maxParticipants: 10,
   });

    const participantToken = await createParticipantToken(
      { identity: participantIdentity },
      roomName
    );

    let egressId: string | undefined;
    const shouldRecord =
      !isDev &&
      session_id &&
      (agent_type === 'english_tutor' || agent_type === 'interview_preparer');

    if (shouldRecord) {
      try {
        const recording = await startRoomRecording(roomName, session_id);
        egressId = recording.egressId;
        console.log('🎙️ Recording started:', { egressId, sessionId: session_id, agentType: agent_type });
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    } else if (isDev) {
      console.log('🎙️ Recording disabled in development mode');
    }

    const response = {
      serverUrl: liveKitUrl,
      roomName,
      participantName,
      participantToken,
      egressId,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}

function createParticipantToken(
  userInfo: AccessTokenOptions,
  roomName: string,
  agentName?: string,
  tutorContext?: any,
  agentType?: string
): Promise<string> {
  // Include metadata in the access token
  const tokenOptions: AccessTokenOptions = {
    ...userInfo,
    ttl: '15m'
  };

  const at = new AccessToken(apiKey, apiSecret, tokenOptions);

  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);

  return at.toJwt();
}
