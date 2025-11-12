import { useEffect, useRef } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent, DataPacket_Kind, RemoteParticipant } from 'livekit-client';
import { decodeDataPacket, getEventType } from '@/lib/livekit-data-handler';

/**
 * Handler function type for data messages
 */
export type DataMessageHandler = (
  data: unknown,
  participant?: RemoteParticipant,
  kind?: DataPacket_Kind
) => void;

/**
 * Options for the data channel hook
 */
export interface UseDataChannelOptions {
  /**
   * Filter messages by event type (e.g., "time_checkpoint", "transcript")
   * If undefined, all messages are passed to the handler
   */
  eventTypes?: string[];

  /**
   * Enable debug logging
   */
  debug?: boolean;
}

/**
 * Low-level hook to listen to LiveKit data packets
 *
 * This is a reusable hook that provides a clean interface for handling
 * data messages sent via room.local_participant.publish_data() from the backend.
 *
 * @param handler - Callback function to handle incoming data messages
 * @param options - Configuration options
 *
 * @example
 * ```typescript
 * useLiveKitDataChannel((data) => {
 *   if (isTimeCheckpointEvent(data)) {
 *     console.log('Checkpoint:', data.metadata.elapsed_seconds);
 *   }
 * }, { eventTypes: ['time_checkpoint'] });
 * ```
 */
export function useLiveKitDataChannel(
  handler: DataMessageHandler,
  options: UseDataChannelOptions = {}
): void {
  const room = useRoomContext();
  const { eventTypes, debug = false } = options;

  // Use ref to store latest handler and avoid re-subscriptions
  const handlerRef = useRef(handler);

  // Update ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      kind?: DataPacket_Kind
    ) => {
      try {
        // Decode binary payload to JSON
        const data = decodeDataPacket(payload);
        const eventType = getEventType(data);

        // Log if debug enabled
        if (debug) {
          console.log('[useLiveKitDataChannel] Data received:', {
            type: eventType,
            from: participant?.identity,
            kind,
            data,
          });
        }

        // Filter by event types if specified
        if (eventTypes && eventTypes.length > 0) {
          if (!eventType || !eventTypes.includes(eventType)) {
            return; // Skip this message
          }
        }

        // Call the handler with decoded data using ref
        handlerRef.current(data, participant, kind);
      } catch (error) {
        console.error('[useLiveKitDataChannel] Error processing data packet:', error);
      }
    };

    // Subscribe to RoomEvent.DataReceived
    room.on(RoomEvent.DataReceived, handleDataReceived);

    if (debug) {
      console.log('[useLiveKitDataChannel] Subscribed to RoomEvent.DataReceived', {
        eventTypes: eventTypes || 'all',
      });
    }

    // Cleanup on unmount
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
      if (debug) {
        console.log('[useLiveKitDataChannel] Unsubscribed from RoomEvent.DataReceived');
      }
    };
  }, [room, eventTypes, debug]); // Removed 'handler' from dependencies
}
