import { useState, useEffect, useCallback, useRef } from 'react';
import { getTimerStatus, TimerStatus } from '@/lib/session-timer-config';

interface UseSessionTimerProps {
  duration: number; // Duration in seconds
  onExpire?: () => void;
  autoStart?: boolean;
  agentType?: 'interview_preparer' | 'english_tutor';
}

interface UseSessionTimerReturn {
  remainingSeconds: number;
  formattedTime: string;
  timerStatus: TimerStatus;
  isExpired: boolean;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export function useSessionTimer({
  duration,
  onExpire,
  autoStart = false,
  agentType = 'interview_preparer',
}: UseSessionTimerProps): UseSessionTimerReturn {
  const [remainingSeconds, setRemainingSeconds] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep onExpire ref updated
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    if (!isExpired) {
      setIsRunning(true);
    }
  }, [isExpired]);

  // Stop timer
  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset timer
  const resetTimer = useCallback(() => {
    stopTimer();
    setRemainingSeconds(duration);
    setIsExpired(false);
  }, [duration, stopTimer]);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isExpired) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            setIsRunning(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            // Call onExpire callback
            if (onExpireRef.current) {
              onExpireRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isExpired]);

  return {
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    timerStatus: getTimerStatus(remainingSeconds, agentType),
    isExpired,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
