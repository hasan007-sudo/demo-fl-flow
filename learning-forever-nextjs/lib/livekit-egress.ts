import { EgressClient, EncodedFileOutput, EncodedFileType, S3Upload } from 'livekit-server-sdk';

export async function startRoomRecording(roomName: string, sessionId: string) {
  const egressClient = new EgressClient(
    process.env.LIVEKIT_URL!,
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
  );

  const s3Upload = new S3Upload({
    accessKey: process.env.S3_ACCESS_KEY!,
    secret: process.env.S3_SECRET_KEY!,
    region: process.env.S3_REGION!,
    bucket: process.env.S3_BUCKET!,
    endpoint: process.env.S3_ENDPOINT!,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  });

  const fileOutput = new EncodedFileOutput({
    fileType: EncodedFileType.MP4,
    filepath: `sessions/${sessionId}.mp4`,
    output: {
      case: 's3',
      value: s3Upload,
    },
  });

  const egressInfo = await egressClient.startRoomCompositeEgress(
    roomName,
    {
      file: fileOutput,
    },
    {
      audioOnly: true,
    }
  );

  return {
    egressId: egressInfo.egressId,
    roomName: egressInfo.roomName,
  };
}
