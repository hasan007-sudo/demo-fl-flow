'use client';

import { useCallback } from 'react';
import { useRoomContext, useVoiceAssistant } from '@livekit/components-react';
import { Button } from '@/components/ui/button';
import { PhoneOff } from 'lucide-react';
import { MicrophoneControl } from './microphone-control';
import { useInputControls } from './hooks/use-input-controls';

interface AgentControlBarProps {
  onLeave?: () => void;
  showPreconnectMessage?: boolean;
}

export function AgentControlBar({
  onLeave,
  showPreconnectMessage = false,
}: AgentControlBarProps) {
  const room = useRoomContext();
  const { state } = useVoiceAssistant();
  const { disconnectSession } = useInputControls();

  const handleLeave = useCallback(async () => {
    await disconnectSession();
    onLeave?.();
  }, [disconnectSession, onLeave]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-4 sm:px-12 animate-slide-up" style={{ animationDelay: '0.5s' }}>
      <div className="flex w-full max-w-2xl items-center justify-between rounded-2xl border border-gray-200 bg-white/90 p-4 backdrop-blur-xl shadow-xl sm:p-6 transition-all duration-300 hover:border-gray-300">
        {/* Left/Center: Microphone Controls */}
        <MicrophoneControl />

        {/* Right: End Call Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleLeave}
          className="font-mono border-2 border-red-500/70 text-red-600 hover:bg-red-50 hover:border-red-500"
        >
          <PhoneOff className="mr-2 h-5 w-5" />
          End Call
        </Button>
      </div>
    </div>
  );
}
