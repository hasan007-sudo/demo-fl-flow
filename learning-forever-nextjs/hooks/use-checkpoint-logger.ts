import { useCallback } from 'react';
import { useLiveKitDataChannel } from './use-livekit-data-channel';

/**
 * Hook to listen for checkpoint events and log them
 * This is a simple listener that logs checkpoint times for debugging/monitoring
 */
export function useCheckpointLogger() {
  const handleCheckpointEvent = useCallback((data: unknown) => {
    // Type guard to check if it's a checkpoint event
    if (
      typeof data === 'object' &&
      data !== null &&
      'type' in data &&
      data.type === 'time_checkpoint' &&
      'metadata' in data
    ) {
      const metadata = (data as any).metadata;
      const elapsedMinutes = Math.floor(metadata.elapsed_seconds / 60);
      const elapsedSeconds = metadata.elapsed_seconds % 60;
      const timeString = `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}`;

      console.log('[Checkpoint Event]', {
        time: timeString,
        elapsed_seconds: metadata.elapsed_seconds,
        remaining_seconds: metadata.remaining_seconds,
        checkpoint_index: metadata.checkpoint_index,
        is_final: metadata.is_final,
        status: (data as any).status,
        timestamp: new Date().toISOString(),
      });

      // Optional: You can add UI notifications here in the future
      if (metadata.is_final) {
        console.log('🔴 FINAL CHECKPOINT - Session ending soon!');
      }
    }
  }, []);

  useLiveKitDataChannel(handleCheckpointEvent, {
    eventTypes: ['time_checkpoint'],
    debug: false, // Set to true for additional debug logs
  });
}
