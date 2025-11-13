import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSessionTimerProps {
  autoStart?: boolean;
}

interface UseSessionTimerReturn {
  elapsedSeconds: number;
  formattedTime: string;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export function useSessionTimer({
  autoStart = false,
}: UseSessionTimerProps = {}): UseSessionTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

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
    setElapsedSeconds(0);
  }, [stopTimer]);

  // Timer logic - count up every second
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
