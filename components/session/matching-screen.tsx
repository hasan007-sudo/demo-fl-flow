'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from '@phosphor-icons/react';

const MATCHING_STEPS = [
  { label: 'Tuning to your goals', duration: 2000 },
  { label: "Setting your tutor's vibe", duration: 2500 },
  { label: 'Adjusting voice & pace', duration: 2800 },
  { label: 'Customizing feedback style', duration: 3200 },
];

interface MatchingScreenProps {
  onComplete?: () => void;
}

export function MatchingScreen({ onComplete }: MatchingScreenProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    // Start animations for each step
    MATCHING_STEPS.forEach((step, index) => {
      timeouts.push(
        setTimeout(() => {
          setCurrentStep(index);
        }, index * 800)
      );

      timeouts.push(
        setTimeout(() => {
          setCompletedSteps((prev) => [...prev, index]);

          // Call onComplete when all steps are done
          if (index === MATCHING_STEPS.length - 1) {
            timeouts.push(
              setTimeout(() => {
                onComplete?.();
              }, 500)
            );
          }
        }, step.duration)
      );
    });

    // Cleanup function to clear all timeouts on unmount or dependency change
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">
            Matching you
          </h2>
          <p className="text-2xl font-semibold text-white/90">
            with the right Tutor...
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-6">
          {MATCHING_STEPS.map((step, index) => {
            const isActive = currentStep >= index;
            const isCompleted = completedSteps.includes(index);
            const isInProgress = isActive && !isCompleted;

            return (
              <div
                key={index}
                className={`transition-opacity duration-500 ${
                  isActive ? 'opacity-100' : 'opacity-40'
                }`}
              >
                {/* Step Label */}
                <div className="flex items-center gap-3 mb-2">
                  {isCompleted ? (
                    <CheckCircle
                      className="h-5 w-5 text-green-400"
                      weight="fill"
                    />
                  ) : (
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      isInProgress
                        ? 'border-white animate-pulse'
                        : 'border-white/40'
                    }`} />
                  )}
                  <span className={`text-sm font-medium ${
                    isCompleted
                      ? 'text-white'
                      : isInProgress
                      ? 'text-white'
                      : 'text-white/60'
                  }`}>
                    {step.label}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCompleted
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 w-full'
                        : isInProgress
                        ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-progress'
                        : 'w-0'
                    }`}
                    style={{
                      transitionDuration: isInProgress ? `${step.duration}ms` : '300ms',
                      ...(isInProgress && { width: '100%' }),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center pt-4">
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-progress {
          animation: progress linear forwards;
        }
      `}</style>
    </div>
  );
}
