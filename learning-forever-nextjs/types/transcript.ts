/**
 * Transcript message types for LiveKit data channel communication
 * These types define the structure of transcript messages sent from the agent
 */

export type TranscriptRole = 'user' | 'assistant';

export interface TranscriptMessage {
  /** Message type identifier */
  type: 'transcript';
  /** Role of the speaker (user or AI assistant) */
  role: TranscriptRole;
  /** The transcribed text content */
  text: string;
  /** ISO 8601 timestamp when the message was created */
  timestamp: string;
  /** Whether this is the final version of the transcript (vs streaming) */
  isFinal: boolean;
  /** Unique identifier for this conversation turn */
  turn_id: string;
}

export interface TranscriptSegment {
  /** Unique identifier for this segment */
  id: string;
  /** Role of the speaker */
  role: TranscriptRole;
  /** The text content */
  text: string;
  /** Timestamp as Date object for easier manipulation */
  timestamp: Date;
  /** Whether this segment is complete or still being updated */
  isFinal: boolean;
}

/**
 * Props for the TranscriptDisplay component
 */
export interface TranscriptDisplayProps {
  /** Optional CSS class name */
  className?: string;
  /** Maximum height of the transcript container */
  maxHeight?: string;
  /** Whether to auto-scroll to latest messages */
  autoScroll?: boolean;
}
