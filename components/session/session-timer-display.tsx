'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { TimerStatus } from '@/lib/session-timer-config';
import { cn } from '@/lib/utils';

interface SessionTimerDisplayProps {
  formattedTime: string;
  timerStatus: TimerStatus;
  className?: string;
}

export function SessionTimerDisplay({
  formattedTime,
  timerStatus,
  className,
}: SessionTimerDisplayProps) {
  return (
    <div
      className={cn(
        'fixed top-[14%] right-[3%] z-50 flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 shadow-lg',
        {
          'bg-white/90 text-gray-900 border border-gray-300': timerStatus === 'normal',
          'bg-yellow-500/90 text-white border border-yellow-600 animate-pulse': timerStatus === 'warning',
          'bg-red-600/90 text-white border border-red-700 animate-pulse': timerStatus === 'critical',
        },
        className
      )}
    >
      <Clock className={cn('w-4 h-4', {
        'animate-spin': timerStatus === 'critical',
      })} />
      <span className="font-mono font-semibold text-lg">
        {formattedTime}
      </span>
      {timerStatus !== 'normal' && (
        <span className="text-xs ml-1">
          {timerStatus === 'warning' ? 'left' : 'ending soon'}
        </span>
      )}
    </div>
  );
}
