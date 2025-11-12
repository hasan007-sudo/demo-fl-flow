/**
 * LiveKit Data Message Handler Utilities
 *
 * Provides utilities for encoding/decoding and handling data messages
 * sent between the backend agent and frontend.
 */

import type { TranscriptMessage } from '@/types/transcript';

/**
 * Decode a Uint8Array payload to a parsed JSON object
 */
export function decodeDataPacket<T = unknown>(payload: Uint8Array): T {
  const decoder = new TextDecoder();
  const messageText = decoder.decode(payload);
  return JSON.parse(messageText);
}

/**
 * Type guard to check if data is a TranscriptMessage
 */
export function isTranscriptMessage(data: unknown): data is TranscriptMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    data.type === 'transcript' &&
    'role' in data &&
    'text' in data
  );
}

/**
 * Get event type from unknown data (safely)
 */
export function getEventType(data: unknown): string | null {
  if (typeof data === 'object' && data !== null && 'type' in data) {
    return typeof data.type === 'string' ? data.type : null;
  }
  return null;
}
