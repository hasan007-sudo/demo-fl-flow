'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDataChannel, useTranscriptions } from '@livekit/components-react';
import { ChevronUp, ChevronDown, MessageSquare, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  TranscriptMessage,
  TranscriptSegment,
  TranscriptDisplayProps
} from '@/types/transcript';

/**
 * TranscriptDisplay Component
 *
 * Real-time transcript display for LiveKit sessions with OpenAI Realtime model.
 * Shows turn-by-turn conversation between user and AI assistant with:
 * - Live streaming updates
 * - Collapsible bottom sheet UI
 * - Auto-scrolling to latest messages
 * - Timestamp display for each message
 * - Different styling for user vs assistant messages
 *
 * @component
 * @example
 * ```tsx
 * <TranscriptDisplay
 *   maxHeight="400px"
 *   autoScroll={true}
 *   className="custom-class"
 * />
 * ```
 */
export function TranscriptDisplay({
  className,
  maxHeight = '400px',
  autoScroll = true,
}: TranscriptDisplayProps) {
  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcripts, setTranscripts] = useState<Map<string, TranscriptSegment>>(new Map());
  const [error, setError] = useState<string | null>(null);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(autoScroll);

  // LiveKit data channel hook
  const { message } = useDataChannel();

  /**
   * Format timestamp to human-readable time
   * @param timestamp - ISO timestamp string or Date object
   * @returns Formatted time string (e.g., "10:30 AM")
   */
  const formatTime = useCallback((timestamp: string | Date): string => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (err) {
      console.error('Error formatting timestamp:', err);
      return '';
    }
  }, []);

  /**
   * Handle incoming data channel messages
   * Parses transcript messages and updates state accordingly
   */
  useEffect(() => {
    if (!message) return;

    try {
      // Parse the message payload
      const payload = typeof message.payload === 'string'
        ? JSON.parse(message.payload)
        : message.payload;

      // Check if this is a transcript message
      if (payload.type === 'transcript') {
        const transcriptMsg = payload as TranscriptMessage;

        setTranscripts(prev => {
          const newTranscripts = new Map(prev);

          // Create or update transcript segment
          const segment: TranscriptSegment = {
            id: transcriptMsg.turn_id,
            role: transcriptMsg.role,
            text: transcriptMsg.text,
            timestamp: new Date(transcriptMsg.timestamp),
            isFinal: transcriptMsg.isFinal,
          };

          // If streaming (not final), update existing or add new
          // If final, always update to ensure we have the complete text
          newTranscripts.set(transcriptMsg.turn_id, segment);

          return newTranscripts;
        });

        // Clear any previous errors on successful message
        setError(null);
      }
    } catch (err) {
      console.error('Error parsing transcript message:', err);
      setError('Failed to parse transcript message');
    }
  }, [message]);

  /**
   * Auto-scroll to latest message when transcripts update
   */
  useEffect(() => {
    if (shouldScrollRef.current && scrollContainerRef.current && isExpanded) {
      const container = scrollContainerRef.current;
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }, 50);
    }
  }, [transcripts, isExpanded]);

  /**
   * Handle manual scroll to detect if user is scrolling up
   * Disables auto-scroll when user scrolls up manually
   */
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const isAtBottom =
      container.scrollHeight - container.scrollTop <= container.clientHeight + 50;

    shouldScrollRef.current = isAtBottom;
  }, []);

  /**
   * Convert Map to sorted array for rendering
   */
  const sortedTranscripts = useMemo(() => {
    return Array.from(transcripts.values()).sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    );
  }, [transcripts]);

  /**
   * Toggle expanded/collapsed state
   */
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Don't render if there are no transcripts
  if (transcripts.size === 0 && !error) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-20 left-0 right-0 z-30 transition-all duration-300 ease-in-out',
        isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)]',
        className
      )}
    >
      <div className="mx-4 sm:mx-12 max-w-4xl mx-auto">
        <div className="rounded-t-2xl border border-gray-200 bg-white/95 backdrop-blur-xl shadow-2xl">
          {/* Header - Always visible */}
          <button
            onClick={toggleExpanded}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-t-2xl"
            aria-label={isExpanded ? 'Collapse transcript' : 'Expand transcript'}
            aria-expanded={isExpanded}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                Transcript
              </span>
              {transcripts.size > 0 && (
                <span className="text-xs text-gray-500">
                  ({transcripts.size} {transcripts.size === 1 ? 'message' : 'messages'})
                </span>
              )}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Content - Only visible when expanded */}
          {isExpanded && (
            <div className="border-t border-gray-200">
              {/* Error display */}
              {error && (
                <div className="p-4 bg-red-500/10 border-b border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Transcript messages */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="overflow-y-auto p-4 space-y-3"
                style={{ maxHeight }}
                role="log"
                aria-label="Conversation transcript"
              >
                {sortedTranscripts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      No messages yet. Start speaking to see the transcript.
                    </p>
                  </div>
                ) : (
                  sortedTranscripts.map((segment) => (
                    <div
                      key={segment.id}
                      className={cn(
                        'flex gap-3 animate-fadeIn',
                        segment.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                          segment.role === 'assistant'
                            ? 'bg-emerald-500/20 text-emerald-600'
                            : 'bg-blue-500/20 text-blue-600'
                        )}
                        aria-hidden="true"
                      >
                        {segment.role === 'assistant' ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>

                      {/* Message bubble */}
                      <div
                        className={cn(
                          'flex-1 max-w-[80%]',
                          segment.role === 'assistant' ? 'mr-auto' : 'ml-auto'
                        )}
                      >
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2.5 relative',
                            segment.role === 'assistant'
                              ? 'bg-emerald-50 text-gray-900 border border-emerald-200'
                              : 'bg-blue-50 text-gray-900 border border-blue-200'
                          )}
                        >
                          {/* Role label for screen readers */}
                          <span className="sr-only">
                            {segment.role === 'assistant' ? 'Assistant' : 'You'}:
                          </span>

                          {/* Message text */}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {segment.text}
                            {!segment.isFinal && (
                              <span className="inline-block ml-1 animate-pulse">...</span>
                            )}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <p
                          className="text-xs text-gray-500 mt-1 px-4"
                          aria-label={`Sent at ${formatTime(segment.timestamp)}`}
                        >
                          {formatTime(segment.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Auto-scroll indicator */}
              {!shouldScrollRef.current && transcripts.size > 5 && (
                <div className="absolute bottom-4 right-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      shouldScrollRef.current = true;
                      scrollContainerRef.current?.scrollTo({
                        top: scrollContainerRef.current.scrollHeight,
                        behavior: 'smooth',
                      });
                    }}
                    className="bg-white/90 backdrop-blur-sm border-gray-300"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Scroll to bottom
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}