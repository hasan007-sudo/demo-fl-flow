// ABOUTME: NPS feedback route for post-call survey
// ABOUTME: Collects rating and comments after AI call session

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import type { NPSFeedback } from '../types/session'

export const Route = createFileRoute('/session/feedback')({
  component: FeedbackForm,
})

function FeedbackForm() {
  const navigate = useNavigate()
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  useEffect(() => {
    const sessionData = localStorage.getItem('sessionData')
    const callDuration = localStorage.getItem('callDuration')

    if (!sessionData || !callDuration) {
      navigate({ to: '/session' })
    }
  }, [navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedRating === null) {
      alert('Please select a rating')
      return
    }

    setIsSubmitting(true)

    const feedback: NPSFeedback = {
      rating: selectedRating,
      comment,
      timestamp: Date.now(),
    }

    localStorage.setItem('feedback', JSON.stringify(feedback))

    setTimeout(() => {
      setIsSubmitting(false)
      setIsGeneratingReport(true)

      setTimeout(() => {
        navigate({ to: '/session/report' })
      }, 30000)
    }, 500)
  }

  const getRatingLabel = (rating: number) => {
    if (rating <= 3) return 'Not Likely'
    if (rating <= 6) return 'Neutral'
    if (rating <= 8) return 'Likely'
    return 'Very Likely'
  }

  const getRatingColor = (rating: number) => {
    if (rating <= 3) return 'text-red-600 dark:text-red-400'
    if (rating <= 6) return 'text-yellow-600 dark:text-yellow-400'
    if (rating <= 8) return 'text-indigo-600 dark:text-indigo-400'
    return 'text-green-600 dark:text-green-400'
  }

  if (isGeneratingReport) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <LoadingSpinner size="lg" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-2">
            Generating Your Report
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We're analyzing your session and preparing detailed insights...
          </p>
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="space-y-3 text-left text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                <span>Processing conversation transcript</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />
                <span>Analyzing fluency and pronunciation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse" />
                <span>Generating personalized insights...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pt-6 pb-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⭐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              How was your experience?
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your feedback helps us improve our AI coaching
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-4">
                How likely are you to recommend this AI session to a friend?
              </label>

              <div className="grid grid-cols-11 gap-1.5 mb-3">
                {[...Array(11)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedRating(i)}
                    className={`aspect-square rounded-lg font-medium text-sm transition-all ${
                      selectedRating === i
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white ring-4 ring-indigo-200 dark:ring-indigo-700 transform scale-110'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Not at all likely</span>
                <span>Extremely likely</span>
              </div>

              {selectedRating !== null && (
                <div className="text-center mt-4">
                  <span
                    className={`text-lg font-semibold ${getRatingColor(selectedRating)}`}
                  >
                    {getRatingLabel(selectedRating)}
                  </span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="comment"
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Tell us more about your experience (optional)
              </label>
              <textarea
                id="comment"
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like? What could be improved?"
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
              />
            </div>

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
