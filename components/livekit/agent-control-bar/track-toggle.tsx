'use client';

import { useCallback, useState } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import { BarVisualizer } from '@livekit/components-react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackToggleProps {
  source: 'microphone' | 'camera' | 'screen_share';
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
  showLabel?: boolean;
}

export function TrackToggle({
  source,
  enabled = true,
  onChange,
  showLabel = false,
}: TrackToggleProps) {
  const { localParticipant } = useLocalParticipant();
  const [isEnabled, setIsEnabled] = useState(enabled);

  const handleToggle = useCallback(async () => {
    if (!localParticipant) return;

    const newState = !isEnabled;
    setIsEnabled(newState);
    onChange?.(newState);

    if (source === 'microphone') {
      await localParticipant.setMicrophoneEnabled(newState);
    }
  }, [localParticipant, isEnabled, source, onChange]);

  if (source !== 'microphone') {
    return null; // Only showing microphone in audio-only mode
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative h-12 w-12 rounded-full transition-colors",
        isEnabled ? "bg-emerald-500/20" : "bg-gray-100"
      )}
    >
      {isEnabled ? (
        <>
          <Mic className="h-5 w-5 text-emerald-500 mx-auto" />
          <BarVisualizer
            state="speaking"
            barCount={3}
            className="absolute inset-0"
          />
        </>
      ) : (
        <MicOff className="h-5 w-5 text-red-500 mx-auto" />
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {source === 'microphone' ? 'Mic' : 'Camera'}
        </span>
      )}
    </button>
  );
}
