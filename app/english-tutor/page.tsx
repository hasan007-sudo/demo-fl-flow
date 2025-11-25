'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Settings } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

const NATIVE_LANGUAGES = [
  'Tamil',
  'Hindi',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
]

const LEARNING_GOAL_OPTIONS = [
  'Interview Preparation',
  'Business Communication',
  'Workplace Conversations',
  'Professional Networking',
  'Technical Discussions',
  'Presentations & Public Speaking',
  'Email & Written Communication',
  'Travel & Daily Situations',
  'Small Talk & Social English',
  'Industry Terminology',
]

const AGENT_PERSONALITIES = ['Friendly', 'Professional', 'Enthusiastic', 'Casual']
const TALKING_SPEEDS = ['Slow', 'Normal', 'Fast']

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  whatsappNumber: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit number'),
  nativeLanguage: z.string().min(1, 'Please select your native language'),
  learningGoals: z.array(z.string()).min(1, 'Please select at least one learning goal'),
})

type FormData = z.infer<typeof formSchema>

interface AgentConfig {
  personality: string
  talkingSpeed: string
}

export default function EnglishTutorPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [showSettings, setShowSettings] = useState(false)
  const [existingUserData, setExistingUserData] = useState<any>(null)
  const [isCheckingUser, setIsCheckingUser] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      whatsappNumber: '',
      nativeLanguage: '',
      learningGoals: [],
    },
  })

  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    personality: 'Friendly',
    talkingSpeed: 'Normal',
  })

  const formValues = watch()

  // Check for existing user when whatsapp number is entered
  useEffect(() => {
    const checkExistingUser = async () => {
      if (formValues.whatsappNumber?.length === 10) {
        setIsCheckingUser(true)
        try {
          const response = await fetch('/api/users/lookup/response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              whatsapp: formValues.whatsappNumber,
              agentType: 'english_tutor',
            }),
          })
          const result = await response.json()

          if (result.found) {
            setExistingUserData(result)
            // Pre-fill form with existing data
            if (result.user.name) {
              setValue('name', result.user.name)
            }
            if (result.latestResponse) {
              setValue('nativeLanguage', result.latestResponse.comfortableLanguage)
              setValue('learningGoals', result.latestResponse.learningGoals)
              // Also pre-fill agent config
              if (result.latestResponse.tutorStyles?.[0]) {
                setAgentConfig((prev) => ({
                  ...prev,
                  personality:
                    result.latestResponse.tutorStyles[0].charAt(0).toUpperCase() +
                    result.latestResponse.tutorStyles[0].slice(1),
                }))
              }
              if (result.latestResponse.speakingSpeed) {
                setAgentConfig((prev) => ({
                  ...prev,
                  talkingSpeed:
                    result.latestResponse.speakingSpeed.charAt(0).toUpperCase() +
                    result.latestResponse.speakingSpeed.slice(1),
                }))
              }
            }
          } else {
            setExistingUserData(null)
          }
        } catch (error) {
          console.error('Error checking existing user:', error)
        } finally {
          setIsCheckingUser(false)
        }
      } else {
        setExistingUserData(null)
      }
    }

    checkExistingUser()
  }, [formValues.whatsappNumber, setValue])

  const handleStep1Next = async (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = await trigger()
    if (isValid) {
      setStep(2)
    }
  }

  const handleStartSession = async () => {
    try {
      const formData = formValues

      // Create user with name and whatsapp number
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          whatsapp: formData.whatsappNumber,
        }),
      })

      if (!userResponse.ok) throw new Error('Failed to create user')
      const user = await userResponse.json()

      // Save questionnaire responses
      const responseData = await fetch('/api/questionnaire-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          proficiencyLevel: 'intermediate',
          genderPreference: 'no_preference',
          speakingSpeed: agentConfig.talkingSpeed.toLowerCase(),
          learningGoals: formData.learningGoals,
          comfortableLanguage: formData.nativeLanguage,
          tutorStyles: [agentConfig.personality.toLowerCase()],
          correctionPreference: 'end_of_conversation',
        }),
      })

      if (!responseData.ok) throw new Error('Failed to save responses')
      const response  = await responseData.json()

      // Store session context
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionData', JSON.stringify({
          personalDetails: formData,
          agentConfig,
          userId: user.id,
          responseId: response.id,
        }))
      }

      // Navigate to session
      router.push(`/english-tutor/session?userId=${user.id}&responseId=${response.id}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to start session. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors py-4 sm:py-6 md:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 relative">
          {isCheckingUser && (
            <LoadingSpinner
              overlay={true}
              message="Checking for existing account..."
              size="md"
            />
          )}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {step === 1 ? 'Start Your AI Session' : 'Meet Your AI Coach'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {step === 1
                ? 'Tell us about yourself to personalize your experience'
                : 'Ready to begin your conversation'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1Next}>
              {/* Name */}
              <div className="mb-4">
                <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Name
                  <span className="text-indigo-600 dark:text-indigo-400 ml-1">*</span>
                </Label>
                <Input
                  type="text"
                  {...register('name')}
                  placeholder="Enter your name"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div className="mb-4">
                <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  WhatsApp Number
                  <span className="text-indigo-600 dark:text-indigo-400 ml-1">*</span>
                </Label>
                <Input
                  type="tel"
                  {...register('whatsappNumber')}
                  placeholder="Enter your 10-digit number"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
                {errors.whatsappNumber && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                    {errors.whatsappNumber.message}
                  </p>
                )}
                {existingUserData && !isCheckingUser && (
                  <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                    ✓ Welcome back! Your previous preferences have been loaded.
                  </p>
                )}
              </div>

              {/* Native Language */}
              <div className="mb-4">
                <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Native Language
                  <span className="text-indigo-600 dark:text-indigo-400 ml-1">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {NATIVE_LANGUAGES.map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => setValue('nativeLanguage', language)}
                      className={`px-3 py-2.5 sm:px-2 sm:py-1.5 rounded-md font-medium text-sm sm:text-xs transition-all ${
                        formValues.nativeLanguage === language
                          ? 'bg-indigo-600 dark:bg-indigo-500 text-white ring-1 ring-indigo-300 dark:ring-indigo-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
                {errors.nativeLanguage && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                    {errors.nativeLanguage.message}
                  </p>
                )}
              </div>

              {/* Learning Goals */}
              <div className="mb-4">
                <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Learning Goals
                  <span className="text-indigo-600 dark:text-indigo-400 ml-1">*</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-normal ml-1">
                    (Select one or more)
                  </span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LEARNING_GOAL_OPTIONS.map((goal) => {
                    const isSelected = formValues.learningGoals.includes(goal)
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setValue('learningGoals', formValues.learningGoals.filter((g) => g !== goal))
                          } else {
                            setValue('learningGoals', [...formValues.learningGoals, goal])
                          }
                        }}
                        className={`px-3 py-2.5 sm:px-2 sm:py-1.5 rounded-md font-medium text-sm sm:text-xs transition-all ${
                          isSelected
                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white ring-1 ring-indigo-300 dark:ring-indigo-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {goal}
                      </button>
                    )
                  })}
                </div>
                {errors.learningGoals && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.learningGoals.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                Next →
              </Button>
            </form>
          ) : (
            <div>
              {/* Agent Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  {/* Agent Avatar */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-400 via-purple-500 to-indigo-600 shadow-lg"></div>

                  {/* Settings Button */}
                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Agent settings"
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Agent Description */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Hello, {formValues.name}! 👋
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 sm:mb-4">
                    I'm your AI coach with a{' '}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {agentConfig.personality.toLowerCase()}
                    </span>{' '}
                    personality. I'll engage you in a natural conversation about{' '}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formValues.learningGoals.join(', ')}
                    </span>{' '}
                    in a comfortable mix of {formValues.nativeLanguage} and English. We'll
                    explore your thoughts, practice communication, and have an enriching 5-minute
                    dialogue.
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                      {agentConfig.personality}
                    </span>
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                      {agentConfig.talkingSpeed} Pace
                    </span>
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                      {formValues.nativeLanguage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settings Modal */}
              {showSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Agent Settings
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowSettings(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Personality
                        </Label>
                        <Select
                          value={agentConfig.personality}
                          onValueChange={(value) =>
                            setAgentConfig({ ...agentConfig, personality: value })
                          }
                        >
                          <SelectTrigger className="bg-white dark:bg-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                            {AGENT_PERSONALITIES.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="mb-4">
                        <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Talking Speed
                        </Label>
                        <Select
                          value={agentConfig.talkingSpeed}
                          onValueChange={(value) =>
                            setAgentConfig({ ...agentConfig, talkingSpeed: value })
                          }
                        >
                          <SelectTrigger className="bg-white dark:bg-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                            {TALKING_SPEEDS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Tip:</span> The AI will adapt its
                          conversation style based on these settings.
                        </p>
                      </div>
                    </div>

                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                      <Button onClick={() => setShowSettings(false)} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Apply Settings
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </Button>
                <Button onClick={handleStartSession} className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                  Start Conversation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
