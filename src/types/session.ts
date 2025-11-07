// ABOUTME: TypeScript interfaces and types for AI voice session flow
// ABOUTME: Defines data structures for user details, agent config, feedback, and session data

export type NativeLanguage = 'Tamil' | 'Hindi' | 'Telugu' | 'Kannada' | 'Malayalam' | 'Marathi'

export type AgentPersonality = 'Friendly' | 'Professional' | 'Enthusiastic' | 'Casual'

export type TalkingSpeed = 'Slow' | 'Normal' | 'Fast'

export interface PersonalDetails {
  name: string
  whatsappNumber: string
  nativeLanguage: NativeLanguage
  interests: string[]
}

export interface AgentConfig {
  personality: AgentPersonality
  talkingSpeed: TalkingSpeed
}

export interface SessionData {
  personalDetails: PersonalDetails
  agentConfig: AgentConfig
  timestamp: number
}

export interface NPSFeedback {
  rating: number
  comment: string
  timestamp: number
}

export interface SessionReport {
  sessionData: SessionData
  feedback: NPSFeedback
  callDuration: number
  highlights: string[]
  fluencyScore: number
  topicsDiscussed: string[]
  suggestions: string[]
}
