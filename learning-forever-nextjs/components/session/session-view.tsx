'use client';

import { useState, useEffect } from 'react';
import { LiveKitRoom, RoomAudioRenderer, useRoomContext } from '@livekit/components-react';
import { DisconnectReason, RoomEvent } from 'livekit-client';
import { TileLayout } from './tile-layout';
import { AgentControlBar } from '../livekit/agent-control-bar/agent-control-bar';
import { SessionTimerDisplay } from './session-timer-display';
import { TranscriptDisplay } from './transcript-display';
import { useCheckpointLogger } from '@/hooks/use-checkpoint-logger';

interface SessionTimerReturn {
  remainingSeconds: number;
  formattedTime: string;
  timerStatus: 'normal' | 'warning' | 'critical';
  isExpired: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

interface SessionViewProps {
  serverUrl: string;
  roomName: string;
  participantToken: string;
  participantName: string;
  onLeave?: () => void;
  timer?: SessionTimerReturn;
}

// Inner component that has access to room context
function SessionContent({
  timer,
  onLeave,
  isConnected,
}: {
  timer?: SessionTimerReturn;
  onLeave: () => void;
  isConnected: boolean;
}) {
  const room = useRoomContext();

  // Listen for checkpoint events and log them
  useCheckpointLogger();

  // Handle timer expiry - disconnect room when timer expires
  useEffect(() => {
    if (timer?.isExpired && room) {
      // Disconnect the room when timer expires
      room.disconnect();
    }
  }, [timer?.isExpired, room]);

  return (
    <>
      {/* Audio renderer - Critical for playing remote audio tracks */}
      <RoomAudioRenderer />

      {/* Timer display - Show countdown timer */}
      {timer && !timer.isExpired && (
        <SessionTimerDisplay
          formattedTime={timer.formattedTime}
          timerStatus={timer.timerStatus}
        />
      )}

      {/* Agent visualization */}
      <TileLayout />

      {/* Transcript display - Real-time conversation transcript */}
      <TranscriptDisplay
        autoScroll={true}
        maxHeight="400px"
        className="animate-slide-up"
      />

      {/* Control bar */}
      <AgentControlBar onLeave={onLeave} showPreconnectMessage={!isConnected} />
    </>
  );
}

export function SessionView({
  serverUrl,
  roomName,
  participantToken,
  participantName,
  onLeave,
  timer,
}: SessionViewProps) {
  const [isConnected, setIsConnected] = useState(false);

  const handleLeave = () => {
    // Don't call endSession here - let ViewController handle cleanup
    // This prevents double cleanup and race conditions
    onLeave?.();
  };

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={participantToken}
      serverUrl={serverUrl}
      onConnected={() => setIsConnected(true)}
      onDisconnected={() => {
        debugger;
        setIsConnected(false);
        handleLeave();
      }}
      data-lk-theme="dark"
    >
      <SessionContent
        timer={timer}
        onLeave={handleLeave}
        isConnected={isConnected}
      />
    </LiveKitRoom>
  );
}
