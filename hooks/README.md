# LiveKit Data Channel Hooks

This directory contains a modular, scalable architecture for handling data messages from LiveKit agents.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Python Agent)                    │
│  room.local_participant.publish_data(message, reliable=True) │
└────────────────────┬────────────────────────────────────────┘
                     │ Binary Data (Uint8Array)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    LiveKit Room (WebRTC)                     │
│              RoomEvent.DataReceived emitted                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         useLiveKitDataChannel (Low-level hook)               │
│  - Subscribes to RoomEvent.DataReceived                      │
│  - Decodes Uint8Array → JSON                                 │
│  - Filters by event type (optional)                          │
│  - Calls handler with decoded data                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────┐
         │useTranscript     │
         │Messages          │
         └──────────────────┘
```

## Core Files

### 1. `lib/livekit-data-handler.ts`
Utility functions for encoding/decoding and type guards.

**Exports:**
- `decodeDataPacket<T>()` - Decode Uint8Array to JSON
- `isTranscriptMessage()` - Type guard for transcript messages
- `getEventType()` - Safely extract event type

### 2. `hooks/use-livekit-data-channel.ts`
Low-level hook for subscribing to LiveKit data packets.

**Features:**
- Direct `RoomEvent.DataReceived` subscription
- Automatic binary decoding
- Event type filtering
- Debug logging
- Clean subscription management

**Usage:**
```typescript
useLiveKitDataChannel((data) => {
  console.log('Received:', data);
}, {
  eventTypes: ['transcript'],
  debug: true
});
```

### 3. `hooks/use-transcript-messages.ts`
High-level hook for transcript management.

**Features:**
- Receives transcript messages from agent
- Maintains Map of segments by turn_id
- Handles both interim and final transcripts
- Error state management

**Usage:**
```typescript
const { transcripts, error } = useTranscriptMessages();

const sortedTranscripts = Array.from(transcripts.values())
  .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
```

## Event Types

### Transcript Message
```typescript
{
  type: "transcript",
  role: "user" | "assistant",
  text: "Hello, how are you?",
  timestamp: "2025-11-11T10:30:00.000Z",
  isFinal: true,
  turn_id: "uuid-1234"
}
```

## Adding New Event Types

To add a new event type (e.g., "agent_feedback"):

### 1. Define TypeScript interface
```typescript
// types/agent-events.ts
export interface AgentFeedbackEvent {
  type: 'agent_feedback';
  sentiment: 'positive' | 'negative' | 'neutral';
  message: string;
  timestamp: string;
}
```

### 2. Add type guard
```typescript
// lib/livekit-data-handler.ts
export function isAgentFeedbackEvent(data: unknown): data is AgentFeedbackEvent {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    data.type === 'agent_feedback'
  );
}
```

### 3. Create specialized hook
```typescript
// hooks/use-agent-feedback.ts
import { useState, useCallback } from 'react';
import { useLiveKitDataChannel } from './use-livekit-data-channel';
import { isAgentFeedbackEvent } from '@/lib/livekit-data-handler';

export function useAgentFeedback() {
  const [feedback, setFeedback] = useState<AgentFeedbackEvent[]>([]);

  const handleFeedback = useCallback((data: unknown) => {
    if (isAgentFeedbackEvent(data)) {
      setFeedback((prev) => [...prev, data]);
    }
  }, []);

  useLiveKitDataChannel(handleFeedback, {
    eventTypes: ['agent_feedback'],
  });

  return feedback;
}
```

### 4. Use in components
```typescript
const feedback = useAgentFeedback();

feedback.forEach((item) => {
  console.log(item.sentiment, item.message);
});
```

## Best Practices

### 1. **Separation of Concerns**
- Low-level hook handles WebRTC → JSON decoding
- High-level hooks handle business logic
- Utility functions handle type guards and formatting

### 2. **Type Safety**
- Use type guards for runtime validation
- Define proper TypeScript interfaces
- Leverage discriminated unions

### 3. **Performance**
- Use `useCallback` for event handlers
- Filter events at the low level (eventTypes option)
- Avoid unnecessary re-renders

### 4. **Debugging**
- Enable debug logging via options
- Log at appropriate levels (info, warn, error)
- Use consistent log prefixes

### 5. **Error Handling**
- Catch decoding errors gracefully
- Provide error state to consumers
- Log errors with context

## Testing

### Quick Test
1. Start a session with the agent
2. Open browser console
3. Look for log messages:
```
[useLiveKitDataChannel] Subscribed to RoomEvent.DataReceived
```

### Verify Events
```typescript
// Add to your component temporarily
useLiveKitDataChannel((data) => {
  console.log('RAW EVENT:', data);
}, { debug: true });
```

## Migration Guide

### From Old Approach
```typescript
// ❌ OLD (Wrong)
const { message } = useDataChannel();
useEffect(() => {
  if (!message) return;
  const payload = JSON.parse(message.payload);
  // ...
}, [message]);
```

### To New Approach
```typescript
// ✅ NEW (Correct)
const { transcripts } = useTranscriptMessages();
// Just use the data - hook handles everything
```

## Troubleshooting

**Problem:** `message` is always `undefined`
**Solution:** You're using `useDataChannel()` instead of `RoomEvent.DataReceived`. Use the new `useLiveKitDataChannel()` hook.

**Problem:** Events not being received
**Solution:**
1. Check backend is publishing via `publish_data()`
2. Enable debug logging
3. Check browser Network tab for WebSocket messages

**Problem:** Types not matching
**Solution:** Use type guards (`isTimeCheckpointEvent()`, etc.) instead of type assertions.

## Additional Resources

- [LiveKit Data Packets Documentation](https://docs.livekit.io/home/client/data/packets/)
- [LiveKit React Components](https://docs.livekit.io/reference/components/react/)
- [TypeScript Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
