export type TimerStatus = 'normal' | 'warning' | 'critical';

export const SESSION_TIMER_CONFIG = {
  // Interview preparer always gets 15 minutes
  interview_preparer: {
    duration: 15 * 60, // 15 minutes in seconds
    warningThreshold: 5 * 60, // Warning at 5 minutes left
    criticalThreshold: 1 * 60, // Critical at 1 minute left
  },
  // English tutor configurable (default 5 minutes)
  english_tutor: {
    duration: 5 * 60, // 5 minutes in seconds (configurable)
    warningThreshold: 2 * 60, // Warning at 2 minutes left
    criticalThreshold: 1 * 60, // Critical at 1 minute left
  },
};

export function getTimerStatus(remainingSeconds: number, agentType: 'interview_preparer' | 'english_tutor' = 'interview_preparer'): TimerStatus {
  const config = SESSION_TIMER_CONFIG[agentType];

  if (remainingSeconds <= config.criticalThreshold) {
    return 'critical';
  } else if (remainingSeconds <= config.warningThreshold) {
    return 'warning';
  }
  return 'normal';
}
