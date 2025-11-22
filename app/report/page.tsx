'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Home, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CEFRReport, AudioPlayerProvider } from '@forever-learning/cefr-report-ui'
import '@forever-learning/cefr-report-ui/styles.css'

interface ReportData {
  id: string
  sessionId: string
  data: any // V2 evaluation data for CEFRReport
  createdAt: string
  updatedAt: string
  session: {
    id: string
    agentType: string
    audioUrl?: string
    startedAt?: string
    endedAt?: string
    user?: {
      id: string
      name?: string
      email?: string
    }
  }
}

function ReportContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    let pollInterval: NodeJS.Timeout | null = null
    let shouldStopPolling = false

    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setReport(data)
          setLoading(false)
          console.log('V2 Report received:', data)
          shouldStopPolling = true
          if (pollInterval) {
            clearInterval(pollInterval)
            pollInterval = null
          }
          return true
        }
        return false
      } catch (err) {
        console.log('Report not ready yet, continuing to poll...')
        return false
      }
    }

    // Initial fetch
    fetchReport().then((ready) => {
      if (!ready) {
        setLoading(false)
      }
    })

    // Poll every 5 seconds until report is ready
    pollInterval = setInterval(async () => {
      if (shouldStopPolling) {
        if (pollInterval) {
          clearInterval(pollInterval)
          pollInterval = null
        }
        return
      }

      await fetchReport()
    }, 5000)

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [sessionId])

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Invalid Session</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">No session ID provided</p>
          <Link href="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base">
              <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 animate-spin mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-gray-600">Loading session report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Error Loading Report</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base">
              <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // If no report data yet, show pending message
  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center shadow-sm">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 animate-spin mx-auto mb-3 sm:mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Evaluation In Progress
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Your session is being analyzed. This may take a few minutes.
            </p>
            <Link href="/">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base">
                <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Get session title based on agent type
  const getSessionTitle = () => {
    const agentType = report.session.agentType
    if (agentType === 'english_tutor') {
      return 'English Tutoring Session'
    } else if (agentType === 'interview_preparer') {
      return 'Interview Practice Session'
    }
    return 'Learning Session'
  }

  const studentName = report.session.user?.name || 'Student'
  const audioUrl = report.session.audioUrl || ''

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with navigation */}
        <div className="mb-4 sm:mb-6 flex sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Session Report
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              {report.session.startedAt ? (
                <>
                  {new Date(report.session.startedAt).toLocaleDateString()} at{' '}
                  {new Date(report.session.startedAt).toLocaleTimeString()}
                </>
              ) : (
                'Date not available'
              )}
            </p>
          </div>
          <Link href="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base px-3 sm:px-4 py-2 h-auto">
              <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Back to Home</span>
              <span className="inline xs:hidden">Home</span>
            </Button>
          </Link>
        </div>

        {/* CEFRReport Component */}
        <AudioPlayerProvider audioUrl={audioUrl}>
          <CEFRReport
            reportData={report.data}
            audioUrl={audioUrl}
            recordingTitle={getSessionTitle()}
            studentName={studentName}
            variant='standalone'
          />
        </AudioPlayerProvider>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    }>
      <ReportContent />
    </Suspense>
  )
}
