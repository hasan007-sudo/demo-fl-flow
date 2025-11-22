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
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center px-2 py-3 sm:px-4 sm:py-4 md:px-12 animate-slide-up" style={{ animationDelay: '0.5s' }}>
      <div className="flex w-full max-w-2xl items-center justify-between rounded-xl sm:rounded-2xl border border-gray-200 bg-white/90 p-2 sm:p-4 md:p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-gray-300">
        {/* Left/Center: Microphone Controls */}
        <MicrophoneControl />

        {/* Right: End Call Button */}
        <Button
          variant="outline"
          size="default"
          onClick={handleLeave}
          className="font-mono border-2 border-red-500/70 text-red-600 hover:bg-red-50 hover:border-red-500 text-xs sm:text-sm px-2 sm:px-4 h-9 sm:h-10"
        >
          <PhoneOff className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden xs:inline">End Call</span>
          <span className="inline xs:hidden">End</span>
        </Button>
      </div>
    </div>
  );
}
