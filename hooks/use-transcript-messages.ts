import { useState, useCallback, useMemo } from 'react';
import type { TranscriptMessage, TranscriptSegment } from '@/types/transcript';
import { isTranscriptMessage } from '@/lib/livekit-data-handler';
import { useLiveKitDataChannel } from './use-livekit-data-channel';

/**
 * Custom hook to receive and manage transcript messages from the agent
 *
 * Listens for 'transcript' events from the backend agent and maintains
 * a map of transcript segments organized by turn_id.
 *
 * This hook handles both interim and final transcripts, updating them
 * as the agent speaks and the user responds.
 *
 * @returns Object containing transcript segments and error state
 *
 * @example
 * ```typescript
 * const { transcripts, error } = useTranscriptMessages();
 *
 * const sortedTranscripts = Array.from(transcripts.values())
 *   .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
 * ```
 */
export function useTranscriptMessages() {
  const [transcripts, setTranscripts] = useState<Map<string, TranscriptSegment>>(new Map());
  const [error, setError] = useState<string | null>(null);

  // Handler for transcript messages
  const handleTranscriptMessage = useCallback((data: unknown) => {
    if (!isTranscriptMessage(data)) {
      return; // Not a transcript message
    }

    const transcriptMsg = data as TranscriptMessage;

    setTranscripts((prev) => {
      const newTranscripts = new Map(prev);

      // Create or update transcript segment
      const segment: TranscriptSegment = {
        id: transcriptMsg.turn_id,
        role: transcriptMsg.role,
        text: transcriptMsg.text,
        timestamp: new Date(transcriptMsg.timestamp),
        isFinal: transcriptMsg.isFinal,
      };

      // Update the transcript (interim or final)
      newTranscripts.set(transcriptMsg.turn_id, segment);

      return newTranscripts;
    });

    // Clear any previous errors on successful message
    setError(null);
  }, []);

  // Memoize eventTypes array to prevent re-subscriptions
  const eventTypes = useMemo(() => ['transcript'], []);

  // Subscribe to transcript events
  useLiveKitDataChannel(handleTranscriptMessage, {
    eventTypes,
    debug: process.env.NODE_ENV == 'development',
  });

  return {
    transcripts,
    error,
  };
}
