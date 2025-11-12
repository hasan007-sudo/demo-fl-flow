'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

const surveySchema = z.object({
  npsScore: z.number().min(0).max(10).optional(),
  feedbackText: z.string().optional(),
})

type SurveyFormData = z.infer<typeof surveySchema>

function SurveyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const agentType = searchParams.get('agentType') as 'english_tutor' | 'interview_preparer'
  const matchedTutorId = searchParams.get('tutorId') || undefined
  const matchedInterviewerId = searchParams.get('interviewerId') || undefined

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      npsScore: undefined,
      feedbackText: '',
    },
  })

  const npsScore = watch('npsScore')

  const getFollowUpQuestion = (score: number | undefined): string => {
    if (score === undefined) return 'Please select a score first'

    if (score <= 6) {
      return 'What areas of the session could we improve?'
    } else if (score <= 8) {
      return 'What would make your experience better?'
    } else {
      return 'What did you love most about this session?'
    }
  }

  const onSubmit = async (data: SurveyFormData) => {
    // Prevent double submission
    if (!sessionId || isSubmitting || hasSubmitted) {
      if (!sessionId) setError('Session ID is missing')
      return
    }

    setIsSubmitting(true)
    setHasSubmitted(true)
    setError(null)

    try {
      const response = await fetch('/api/session-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          agentType,
          matchedTutorId,
          matchedInterviewerId,
          npsScore: data.npsScore ?? null,
          feedbackText: data.feedbackText?.trim() || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit survey')
      }

      // Redirect to report page
      router.push(`/report?sessionId=${sessionId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      setIsSubmitting(false)
      setHasSubmitted(false) // Reset on error so user can retry
    }
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Session</h1>
          <p className="text-gray-600">No session ID provided</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Session Feedback
          </h1>
          <p className="text-gray-600 mb-8">
            Your feedback helps us improve our service
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* NPS Score */}
            <div className="space-y-4">
              <Label htmlFor="npsScore" className="text-gray-900 text-base">
                On a scale of 0 to 10, how likely are you to recommend us?
              </Label>
              <p className="text-sm text-gray-600">
                0 = Not likely at all, 10 = Extremely likely
              </p>

              <div className="grid grid-cols-11 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setValue('npsScore', score)}
                    className={`
                      cursor-pointer px-2 py-3 rounded border text-center font-medium transition-colors
                      ${
                        Number(npsScore) === score
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400'
                      }
                    `}
                  >
                    {score}
                  </button>
                ))}
              </div>
              {errors.npsScore && (
                <p className="text-sm text-red-400">{errors.npsScore.message}</p>
              )}
            </div>

            {/* Feedback Text */}
            {npsScore !== undefined && (
              <div className="space-y-4 pt-8 border-t border-gray-200">
                <Label htmlFor="feedbackText" className="text-gray-900 text-base">
                  {getFollowUpQuestion(Number(npsScore))}
                </Label>

                <textarea
                  id="feedbackText"
                  {...register('feedbackText')}
                  placeholder="Please share your thoughts..."
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={5}
                  disabled={isSubmitting}
                />
                {errors.feedbackText && (
                  <p className="text-sm text-red-500">{errors.feedbackText.message}</p>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SurveyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    }>
      <SurveyContent />
    </Suspense>
  )
}
