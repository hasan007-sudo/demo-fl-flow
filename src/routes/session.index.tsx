// ABOUTME: Session form route for collecting user details and agent configuration
// ABOUTME: Captures personal info and preferences before starting AI call session

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import Button from '../components/Button'
import type {
  PersonalDetails,
  AgentConfig,
  SessionData,
  NativeLanguage,
  AgentPersonality,
  TalkingSpeed,
} from '../types/session'

export const Route = createFileRoute('/session/')({
  component: SessionForm,
})

const NATIVE_LANGUAGES: NativeLanguage[] = [
  'Tamil',
  'Hindi',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
]

const INTEREST_OPTIONS = [
  'Technology',
  'Sports',
  'Movies',
  'Music',
  'Career Goals',
  'Travel',
  'Food',
  'Books',
  'Gaming',
  'Fitness',
]

const AGENT_PERSONALITIES: AgentPersonality[] = [
  'Friendly',
  'Professional',
  'Enthusiastic',
  'Casual',
]

const TALKING_SPEEDS: TalkingSpeed[] = ['Slow', 'Normal', 'Fast']

function SessionForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [showSettings, setShowSettings] = useState(false)

  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    name: '',
    whatsappNumber: '',
    nativeLanguage: '' as NativeLanguage,
    interests: [],
  })

  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    personality: 'Friendly' as AgentPersonality,
    talkingSpeed: 'Normal' as TalkingSpeed,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!personalDetails.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!personalDetails.whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp number is required'
    } else if (!/^\d{10}$/.test(personalDetails.whatsappNumber.replace(/\s/g, ''))) {
      newErrors.whatsappNumber = 'Please enter a valid 10-digit number'
    }

    if (!personalDetails.nativeLanguage) {
      newErrors.nativeLanguage = 'Please select your native language'
    }

    if (personalDetails.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep1()) {
      setStep(2)
      setErrors({})
    }
  }

  const handleStartCall = () => {
    const sessionData: SessionData = {
      personalDetails,
      agentConfig,
      timestamp: Date.now(),
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionData', JSON.stringify(sessionData))
    }

    navigate({ to: '/session/call' })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pt-4 pb-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {step === 1 ? 'Start Your AI Session' : 'Meet Your AI Coach'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {step === 1
                ? 'Tell us about yourself to personalize your experience'
                : 'Ready to begin your conversation'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1Next}>
              <FormInput
                label="Name"
                name="name"
                value={personalDetails.name}
                onChange={(value) =>
                  setPersonalDetails({ ...personalDetails, name: value })
                }
                placeholder="Enter your name"
                required
                error={errors.name}
              />

              <FormInput
                label="WhatsApp Number"
                name="whatsappNumber"
                type="tel"
                value={personalDetails.whatsappNumber}
                onChange={(value) =>
                  setPersonalDetails({ ...personalDetails, whatsappNumber: value })
                }
                placeholder="Enter your 10-digit number"
                required
                error={errors.whatsappNumber}
              />

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Native Language
                  <span className="text-indigo-600 dark:text-indigo-400 ml-1">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {NATIVE_LANGUAGES.map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() =>
                        setPersonalDetails({
                          ...personalDetails,
                          nativeLanguage: language,
                        })
                      }
                      className={`px-2 py-1.5 rounded-md font-medium text-xs transition-all ${
                        personalDetails.nativeLanguage === language
                          ? 'bg-indigo-600 dark:bg-indigo-500 text-white ring-1 ring-indigo-300 dark:ring-indigo-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
                {errors.nativeLanguage && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.nativeLanguage}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Interests
                  <span className="text-indigo-600 dark:text-indigo-400 ml-1">*</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-normal ml-1">
                    (Select one or more)
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = personalDetails.interests.includes(interest)
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setPersonalDetails({
                              ...personalDetails,
                              interests: personalDetails.interests.filter(
                                (i) => i !== interest
                              ),
                            })
                          } else {
                            setPersonalDetails({
                              ...personalDetails,
                              interests: [...personalDetails.interests, interest],
                            })
                          }
                        }}
                        className={`px-2 py-1.5 rounded-md font-medium text-xs transition-all ${
                          isSelected
                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white ring-1 ring-indigo-300 dark:ring-indigo-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {interest}
                      </button>
                    )
                  })}
                </div>
                {errors.interests && (
                  <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.interests}</p>
                )}
              </div>

              <Button type="submit" fullWidth>
                Next →
              </Button>
            </form>
          ) : (
            <div>
              {/* Agent Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  {/* Agent Orb Avatar */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-purple-500 to-indigo-600 shadow-lg"></div>

                  {/* Settings Icon Button */}
                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Agent settings"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>

                {/* Agent Description with Greeting */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Hello, {personalDetails.name}! 👋
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    I'm your AI coach with a <span className="font-medium text-gray-900 dark:text-white">{agentConfig.personality.toLowerCase()}</span> personality. I'll engage you in a natural conversation about <span className="font-medium text-gray-900 dark:text-white">{personalDetails.interests.join(', ')}</span> in a comfortable mix of {personalDetails.nativeLanguage} and English. We'll explore your thoughts, practice communication, and have an enriching 15-minute dialogue.
                  </p>

                  {/* Personality Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                      {agentConfig.personality}
                    </span>
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                      {agentConfig.talkingSpeed} Pace
                    </span>
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                      {personalDetails.nativeLanguage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settings Modal */}
              {showSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Agent Settings
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowSettings(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                      <FormSelect
                        label="Personality"
                        name="personality"
                        value={agentConfig.personality}
                        onChange={(value) =>
                          setAgentConfig({
                            ...agentConfig,
                            personality: value as AgentPersonality,
                          })
                        }
                        options={AGENT_PERSONALITIES}
                      />

                      <FormSelect
                        label="Talking Speed"
                        name="talkingSpeed"
                        value={agentConfig.talkingSpeed}
                        onChange={(value) =>
                          setAgentConfig({
                            ...agentConfig,
                            talkingSpeed: value as TalkingSpeed,
                          })
                        }
                        options={TALKING_SPEEDS}
                      />

                      <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Tip:</span> The AI will adapt its conversation style based on these settings.
                        </p>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                      <Button onClick={() => setShowSettings(false)} fullWidth>
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
                  onClick={() => {
                    setStep(1)
                    setErrors({})
                  }}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </Button>
                <Button onClick={handleStartCall} fullWidth>
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
