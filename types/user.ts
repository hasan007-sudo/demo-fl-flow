/**
 * User-related type definitions
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  whatsapp?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLookupResult {
  found: boolean;
  agentType?: 'english_tutor' | 'interview_preparer';
  user?: User;
  latestResponse?: any; // Can be EnglishTutorQnResponses or InterviewPreparerQnResponses
}