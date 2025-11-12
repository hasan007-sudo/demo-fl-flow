"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_MESSAGES = [
  { text: "Analyzing your conversation...", duration: 5000 },
  { text: "Processing audio recording...", duration: 5000 },
  { text: "Evaluating pronunciation and grammar...", duration: 5000 },
  { text: "Calculating CEFR scores...", duration: 8000 },
  { text: "Generating your performance report...", duration: 8000 },
  { text: "Almost done, finalizing results...", duration: 0 }, // stays until done
];

export function EvaluationLoading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const currentMessage = LOADING_MESSAGES[messageIndex];

  // Rotate through messages
  useEffect(() => {
    // Don't set interval for last message (it stays until API completes)
    if (messageIndex >= LOADING_MESSAGES.length - 1) {
      return;
    }

    const timer = setTimeout(() => {
      setMessageIndex((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, currentMessage.duration);

    return () => clearTimeout(timer);
  }, [messageIndex, currentMessage.duration]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6">
        {/* Circular Spinner */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-700/50"
            />
            {/* Animated progress circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * 0.25}`}
              className="animate-spin origin-center"
              strokeLinecap="round"
              style={{ animationDuration: "2s" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-white">
          Evaluating Your Session
        </h2>

        {/* Rotating message */}
        <div className="h-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-base text-white/70"
            >
              {currentMessage.text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Info text */}
        <p className="text-sm text-white/50 mt-4">
          This usually takes 10-30 seconds
        </p>
      </div>
    </div>
  );
}
