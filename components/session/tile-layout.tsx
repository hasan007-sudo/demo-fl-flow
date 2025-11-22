'use client';

import { useVoiceAssistant, BarVisualizer } from '@livekit/components-react';
import { useEffect, useRef } from 'react';

export function TileLayout() {
  const { state, audioTrack, agent } = useVoiceAssistant();
  const containerRef = useRef<HTMLDivElement>(null);

  // Map agent state to visualizer state
  const getVisualizerState = (): any => {
    switch (state) {
      case 'listening':
        return 'listening';
      case 'speaking':
        return 'speaking';
      case 'thinking':
        return 'thinking';
      default:
        return 'listening'; // Default to listening instead of idle
    }
  };

  const isSpeaking = state === 'speaking';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-20 flex items-center justify-center overflow-hidden animate-fade-in"
    >
      {/* Center: Agent Avatar/Visualizer */}
      <div className="relative flex items-center justify-center">
        {/* Animated waves when agent is speaking */}
        {isSpeaking && (
          <>
            {/* Wave 1 - Innermost */}
            <div className="absolute rounded-full border-2 border-emerald-600/40 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"
                 style={{
                   animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                 }} />
            {/* Wave 2 - Middle */}
            <div className="absolute rounded-full border-2 border-emerald-500/30 w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40"
                 style={{
                   animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                   animationDelay: '0.2s'
                 }} />
            {/* Wave 3 - Outermost */}
            <div className="absolute rounded-full border-2 border-emerald-400/20 w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48"
                 style={{
                   animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                   animationDelay: '0.4s'
                 }} />
          </>
        )}

        <div className={`relative z-10 flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/30 shadow-lg transition-all duration-300 backdrop-blur-sm ${
          isSpeaking ? 'shadow-emerald-400/50 scale-110 ring-2 sm:ring-4 ring-emerald-300/30' : 'shadow-emerald-400/30'
        }`}>
          <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20">
            <BarVisualizer
              state={getVisualizerState()}
              barCount={5}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* State indicator text */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 translate-y-full whitespace-nowrap text-xs sm:text-sm font-medium text-gray-700 transition-all duration-300">
          {!agent && 'Connecting to agent...'}
          {agent && state === 'initializing' && 'Initializing...'}
          {agent && state === 'listening' && 'Listening...'}
          {agent && state === 'thinking' && 'Thinking...'}
          {agent && state === 'speaking' && 'Speaking...'}
          {agent && !['initializing', 'listening', 'speaking', 'thinking'].includes(state || '') && 'Ready'}
        </div>
      </div>
    </div>
  );
}
