'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionTimerDisplayProps {
  formattedTime: string;
  className?: string;
}

export function SessionTimerDisplay({
  formattedTime,
  className,
}: SessionTimerDisplayProps) {
  return (
    <div
      className={cn(
        'fixed top-[14%] right-[3%] z-50 flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 shadow-lg bg-white/90 text-gray-900 border border-gray-300',
        className
      )}
    >
      <Clock className="w-4 h-4" />
      <span className="font-mono font-semibold text-lg">
        {formattedTime}
      </span>
    </div>
  );
}
