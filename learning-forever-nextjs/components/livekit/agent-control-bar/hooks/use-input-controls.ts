import { useCallback, useState } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';

export function useInputControls() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);

  const toggleMicrophone = useCallback(async () => {
    if (!localParticipant) return;

    const newState = !isMicrophoneEnabled;
    await localParticipant.setMicrophoneEnabled(newState);
    setIsMicrophoneEnabled(newState);
  }, [localParticipant, isMicrophoneEnabled]);

  const disconnectSession = useCallback(async () => {
    if (room) {
      await room.disconnect();
    }
  }, [room]);

  return {
    isMicrophoneEnabled,
    setIsMicrophoneEnabled,
    toggleMicrophone,
    disconnectSession,
  };
}
