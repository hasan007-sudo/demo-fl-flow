'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Home, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'

interface SessionData {
  id: string
  agentType: string
  audioUrl?: string
  evaluationData?: {
    scores: {
      pronunciation: number
      grammar: number
      vocabulary: number
      fluency: number
      comprehension: number
    }
    overallScore: number
    cefrLevel: string
    insights: string[]
  }
  startedAt: string
}

export default function ReportPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [evaluationTriggered, setEvaluationTriggered] = useState(false)
  const [hasAudioUrl, setHasAudioUrl] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    let pollInterval: NodeJS.Timeout | null = null
    let shouldStopPolling = false

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch session')
        }
        const data = await response.json()
        setSession(data)
        setLoading(false)

        // If we have evaluationData, stop polling completely
        if (data.evaluationData) {
          shouldStopPolling = true
          if (pollInterval) {
            clearInterval(pollInterval)
            pollInterval = null
          }
          return
        }

        // If audioUrl exists, trigger evaluation once and continue polling for results
        if (data.audioUrl && !evaluationTriggered) {
          setHasAudioUrl(true)
          setEvaluationTriggered(true)

          console.log('📊 Triggering evaluation for session:', sessionId)

          fetch(`/api/sessions/${sessionId}/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
            .then((res) => {
              if (!res.ok) {
                console.error('Evaluation failed:', res.statusText)
              } else {
                console.log('✅ Evaluation triggered successfully, continuing to poll for results')
              }
            })
            .catch((err) => {
              console.error('Error triggering evaluation:', err)
            })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setLoading(false)
        shouldStopPolling = true
        if (pollInterval) {
          clearInterval(pollInterval)
          pollInterval = null
        }
      }
    }

    // Initial fetch
    fetchSession()

    // Poll every 5 seconds
    // - If no evaluationData yet: keep polling
    // - Once evaluationData exists: stop polling
    pollInterval = setInterval(() => {
      if (shouldStopPolling) {
        if (pollInterval) {
          clearInterval(pollInterval)
          pollInterval = null
        }
        return
      }

      // Continue polling until we have evaluationData
      fetchSession()
    }, 5000)

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [sessionId])

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Session</h1>
          <p className="text-gray-600 mb-6">No session ID provided</p>
          <Link href="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading session report...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Report</h1>
          <p className="text-gray-600 mb-6">{error || 'Session not found'}</p>
          <Link href="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { evaluationData } = session

  // If no evaluation data yet, show pending message
  if (!evaluationData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Evaluation In Progress
            </h1>
            <p className="text-gray-600 mb-6">
              Your session is being analyzed. This may take a few minutes.
            </p>
            <Link href="/">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Prepare radar chart data
  const chartData = [
    {
      category: 'Pronunciation',
      score: evaluationData.scores.pronunciation,
    },
    {
      category: 'Grammar',
      score: evaluationData.scores.grammar,
    },
    {
      category: 'Vocabulary',
      score: evaluationData.scores.vocabulary,
    },
    {
      category: 'Fluency',
      score: evaluationData.scores.fluency,
    },
    {
      category: 'Comprehension',
      score: evaluationData.scores.comprehension,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Session Report
          </h1>
          <p className="text-gray-600 mb-8">
            {session.startedAt ? (
              <>
                {new Date(session.startedAt).toLocaleDateString()} at{' '}
                {new Date(session.startedAt).toLocaleTimeString()}
              </>
            ) : (
              'Date not available'
            )}
          </p>

          {/* Overall Score */}
          <div className="mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                <p className="text-4xl font-bold text-gray-900">
                  {evaluationData.overallScore}/100
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">CEFR Level</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {evaluationData.cefrLevel}
                </p>
              </div>
            </div>
          </div>

          {/* Skills Chart */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Skill Breakdown
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#4b5563', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Detailed Scores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(evaluationData.scores).map(([key, value]) => (
                <div key={key} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 capitalize">{key}</span>
                    <span className="text-gray-900 font-semibold">{value}/100</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          {evaluationData.insights && evaluationData.insights.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Insights & Recommendations
              </h2>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <ul className="space-y-3">
                  {evaluationData.insights.map((insight, index) => (
                    <li key={index} className="text-gray-700 flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Link href="/" className="flex-1">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
