// ABOUTME: Call interface route for active AI voice session
// ABOUTME: Displays call status, timer, waveform animation, and call controls

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Phone, PhoneOff } from 'lucide-react'
import Button from '../components/Button'
import type { SessionData } from '../types/session'

export const Route = createFileRoute('/session/call')({
  component: CallInterface,
})

type CallStatus = 'connecting' | 'in-call' | 'ended'

const MAX_CALL_DURATION = 15 * 60 * 1000

function CallInterface() {
  const navigate = useNavigate()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [callStatus, setCallStatus] = useState<CallStatus>('connecting')
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState<number>(0)

  useEffect(() => {
    const storedData = localStorage.getItem('sessionData')
    if (!storedData) {
      navigate({ to: '/session' })
      return
    }

    setSessionData(JSON.parse(storedData))

    setTimeout(() => {
      setCallStatus('in-call')
      setStartTime(Date.now())
    }, 2000)
  }, [navigate])

  useEffect(() => {
    if (callStatus !== 'in-call' || !startTime) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime

      if (elapsed >= MAX_CALL_DURATION) {
        handleEndCall()
      } else {
        setElapsedTime(elapsed)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [callStatus, startTime])

  const handleEndCall = () => {
    const finalDuration = Math.min(elapsedTime, MAX_CALL_DURATION)
    localStorage.setItem('callDuration', String(finalDuration))
    setCallStatus('ended')

    setTimeout(() => {
      navigate({ to: '/session/feedback' })
    }, 1500)
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getRemainingTime = () => {
    const remaining = MAX_CALL_DURATION - elapsedTime
    return Math.max(0, remaining)
  }

  if (!sessionData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div
              className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
                callStatus === 'connecting'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30'
                  : callStatus === 'in-call'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Phone
                className={`w-12 h-12 ${
                  callStatus === 'connecting'
                    ? 'text-yellow-600 dark:text-yellow-400 animate-pulse'
                    : callStatus === 'in-call'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                }`}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'in-call' && 'In Call'}
              {callStatus === 'ended' && 'Call Ended'}
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {sessionData.personalDetails.name}
            </p>

            {callStatus === 'in-call' && (
              <div className="space-y-2">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Time remaining: {formatTime(getRemainingTime())}
                </div>
              </div>
            )}
          </div>

          {callStatus === 'in-call' && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 h-20">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 60 + 20}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.8s',
                    }}
                  />
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                AI is listening and responding...
              </p>
            </div>
          )}

          {callStatus === 'connecting' && (
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          )}

          {callStatus === 'ended' && (
            <div className="text-center mb-8">
              <p className="text-gray-600 dark:text-gray-400">
                Thank you for your session. Redirecting to feedback...
              </p>
            </div>
          )}

          <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4 mb-6">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Language:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {sessionData.personalDetails.nativeLanguage} + English
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Personality:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {sessionData.agentConfig.personality}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Speed:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {sessionData.agentConfig.talkingSpeed}
                </span>
              </div>
            </div>
          </div>

          {callStatus === 'in-call' && (
            <Button
              onClick={handleEndCall}
              fullWidth
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              <PhoneOff className="w-5 h-5 mr-2 inline" />
              End Call
            </Button>
          )}
        </div>

        {callStatus === 'in-call' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The AI is discussing your interests:{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {sessionData.personalDetails.interests.join(', ')}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
