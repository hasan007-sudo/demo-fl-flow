// ABOUTME: Report route displaying session analytics and insights
// ABOUTME: Shows call summary, fluency scores, topics discussed, and improvement suggestions

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Clock,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  Star,
  ArrowRight,
} from 'lucide-react'
import Button from '../components/Button'
import type { SessionData, NPSFeedback } from '../types/session'

export const Route = createFileRoute('/session/report')({
  component: SessionReport,
})

function SessionReport() {
  const navigate = useNavigate()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [feedback, setFeedback] = useState<NPSFeedback | null>(null)
  const [callDuration, setCallDuration] = useState<number>(0)

  useEffect(() => {
    const storedSessionData = localStorage.getItem('sessionData')
    const storedFeedback = localStorage.getItem('feedback')
    const storedCallDuration = localStorage.getItem('callDuration')

    if (!storedSessionData || !storedFeedback || !storedCallDuration) {
      navigate({ to: '/session' })
      return
    }

    setSessionData(JSON.parse(storedSessionData))
    setFeedback(JSON.parse(storedFeedback))
    setCallDuration(parseInt(storedCallDuration, 10))
  }, [navigate])

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}m ${seconds}s`
  }

  const handleStartNewSession = () => {
    localStorage.removeItem('sessionData')
    localStorage.removeItem('feedback')
    localStorage.removeItem('callDuration')
    navigate({ to: '/session' })
  }

  if (!sessionData || !feedback) {
    return null
  }

  const mockReport = {
    fluencyScore: 78,
    highlights: [
      `Strong engagement discussing ${sessionData.personalDetails.interests[0] || 'your interests'}`,
      'Good use of English vocabulary mixed with native language',
      'Natural conversation flow maintained throughout',
      'Active listening demonstrated with relevant responses',
    ],
    topicsDiscussed: sessionData.personalDetails.interests.length > 0
      ? sessionData.personalDetails.interests
      : ['Technology', 'Career aspirations', 'Learning goals', 'Cultural perspectives'],
    suggestions: [
      'Practice more advanced vocabulary to enhance expression',
      'Work on transition phrases between topics',
      'Try longer sessions to build stamina',
      'Focus on pronunciation of technical terms',
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Session Complete!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Great job, {sessionData.personalDetails.name}! Here's your performance
            report.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDuration(callDuration)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Call Duration</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-500 dark:text-green-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockReport.fluencyScore}%
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fluency Score</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500 dark:text-yellow-400" fill="currentColor" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {feedback.rating}/10
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your Rating</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Session Highlights</h2>
          </div>
          <ul className="space-y-3">
            {mockReport.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Topics Discussed</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {mockReport.topicsDiscussed.map((topic, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Improvement Suggestions
              </h2>
            </div>
            <ul className="space-y-2">
              {mockReport.suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {feedback.comment && (
          <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your Feedback</h3>
            <p className="text-gray-700 dark:text-gray-300 italic">"{feedback.comment}"</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Ready for your next session?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Keep practicing to improve your fluency and confidence!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleStartNewSession}>
                Start New Session →
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/' })}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
