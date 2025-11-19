import { z } from 'zod';

/**
 * Consolidated Webhook Payload & CEFR Report Schemas
 * Extracted from sewai-api project
 *
 * Schemas for the complete V2 evaluation report and webhook payloads
 */

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Timestamp validation (HH:MM:SS format)
 * Example: "00:15:30", "01:45:22"
 */
export const timestampSchema = z
  .string()
  .regex(/^([0-9]{2}):([0-5][0-9]):([0-5][0-9])$/)
  .describe("Start time of the segment in HH:MM:SS format.");

/**
 * Speaker ID validation (SPEAKER_XX format where XX is 00-99)
 * Example: "SPEAKER_00", "SPEAKER_01"
 */
export const speakerIdSchema = z.string().regex(/^SPEAKER_\d{2}$/);

/**
 * Confidence level enum used in all CEFR assessment scores
 */
export const confidenceLevelSchema = z
  .enum(["low", "medium", "high"])
  .describe("Confidence in the assessment");

/**
 * Base score structure used by all CEFR dimension assessments
 * (fluency, grammar, vocabulary, pronunciation, clarity)
 */
export const baseScoreSchema = z.object({
  strengths: z.array(z.string()).describe("List of observed strengths"),
  limitations: z.array(z.string()).describe("List of observed limitations"),
  score: z.number().min(0).max(100).describe("Overall score out of 100"),
  confidence_level: confidenceLevelSchema,
  reason: z
    .string()
    .describe(
      "Comprehensive justification for the overall score, written in simple, second person language addressing the student",
    ),
});

// ============================================================================
// TRANSCRIPT SCHEMAS
// ============================================================================

/**
 * Individual segment of the transcript with speaker, timestamps, and content
 */
export const transcriptSegmentSchema = z.object({
  speaker: speakerIdSchema,
  start_time: timestampSchema,
  end_time: timestampSchema,
  content: z.string(),
});

/**
 * Maps speaker IDs (SPEAKER_00, SPEAKER_01) to actual speaker names/roles
 */
export const speakerMapSchema = z.object({
  speaker_id: speakerIdSchema,
  speaker_name: z.string(),
});

/**
 * Talk time metrics calculated by API after transcript processing
 * Includes per-speaker talk time, total duration, idle time, and overlap
 */
export const talkTimeMetricsSchema = z.object({
  duration: timestampSchema,
  speakers: z.record(z.string(), timestampSchema),
  idle: timestampSchema,
  overlap: timestampSchema,
});

/**
 * Processed transcript with calculated talk_time metrics
 * This is the final format used by the API (no nested wrapper)
 */
export const processedTranscriptSchema = z.object({
  segments: z.array(transcriptSegmentSchema),
  speaker_map: z.array(speakerMapSchema),
  talk_time: talkTimeMetricsSchema,
});

// ============================================================================
// ANALYSIS SCHEMAS
// ============================================================================

/**
 * Individual topic segment with timestamps
 */
export const topicSegmentSchema = z.object({
  topic: z.string(),
  start_time: timestampSchema,
  end_time: timestampSchema,
});

/**
 * Safety and profanity detection flags
 */
export const safetyFlagsSchema = z.object({
  profanity_detected: z.boolean(),
  flagged_words: z.array(z.string()),
  flagged_categories: z
    .array(
      z.enum([
        'profanity',
        'sexual_content',
        'violence',
        'hate_speech',
        'harassment',
        'self_harm',
        'discrimination',
        'bullying',
        'spam',
      ])
    )
    .optional(),
});

/**
 * Comprehensive emotion enum covering 52 distinct emotional states
 */
const emotionEnum = z.enum([
  'happy',
  'joyful',
  'excited',
  'enthusiastic',
  'content',
  'satisfied',
  'confident',
  'proud',
  'grateful',
  'hopeful',
  'amused',
  'pleased',
  'cheerful',
  'encouraging',
  'supportive',
  'optimistic',
  'relieved',
  'calm',
  'peaceful',
  'sad',
  'unhappy',
  'disappointed',
  'frustrated',
  'angry',
  'annoyed',
  'irritated',
  'anxious',
  'worried',
  'nervous',
  'fearful',
  'scared',
  'confused',
  'uncertain',
  'doubtful',
  'bored',
  'tired',
  'stressed',
  'overwhelmed',
  'embarrassed',
  'ashamed',
  'guilty',
  'jealous',
  'lonely',
  'hurt',
  'disgusted',
  'neutral',
  'indifferent',
  'curious',
  'inquisitive',
  'interested',
  'thoughtful',
  'focused',
  'attentive',
  'surprised',
  'shocked',
  'skeptical',
  'serious',
  'contemplative',
]);

/**
 * Overall sentiment analysis for a speaker
 */
export const speakerSentimentSchema = z.object({
  speaker_id: z.string(),
  average_sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']),
  dominant_emotion: emotionEnum,
  sentiment_score: z.number().optional(),
});

/**
 * Individual emotion event in the timeline
 */
export const emotionEventSchema = z.object({
  speaker: z.string(),
  emotion: z.string(),
  timestamp: timestampSchema,
  intensity: z.enum(['low', 'moderate', 'high', 'very_high']).optional(),
  confidence: z.number().optional(),
});

/**
 * Complete interaction analysis combining all analysis components
 */
export const analysisSchema = z.object({
  topic_segments: z.array(topicSegmentSchema),
  safety_flags: safetyFlagsSchema,
  overall_sentiment: z.array(speakerSentimentSchema),
  emotion_timeline: z.array(emotionEventSchema),
});

// ============================================================================
// FLUENCY SCHEMA
// ============================================================================

/**
 * Tags for fluency-related issues (20 distinct tags)
 */
const fluencyTagsEnum = z.enum([
  'Long Pause',
  'Filler Cluster',
  'Self-Correction',
  'Repetition',
  'Grammatical Error',
  'Accuracy',
  'Structural Error',
  'Clarity',
  'False Start',
  'Meta-Commentary',
  'Tense Error',
  'Retrieval Lag',
  'Redundancy',
  'Structural Breakdown',
  'High Effort',
  'Lexical Choice',
  'Incomplete Phrase',
  'Fragmentation',
  'Awkward Phrasing',
  'Vagueness',
]);

/**
 * Individual fluency feedback segment with timestamp and suggestions
 */
export const fluencySegmentSchema = z.object({
  timestamp: timestampSchema,
  content: z
    .string()
    .describe('The specific phrase or event that occurred in this segment.'),
  suggestion: z
    .array(z.string())
    .describe(
      'An array of 1-3 suggested alternative sentences or phrases for better fluency/delivery. Must only contain the suggested sentence/phrase text.'
    ),
  explanation: z
    .string()
    .describe(
      "Detailed explanation of why this segment was flagged (e.g., '1.8s pause here', 'excessive \"like\" usage', 'grammatical repetition')."
    ),
  tags: z
    .array(fluencyTagsEnum)
    .describe('List of relevant tags for the segment from predefined categories.'),
});

/**
 * Quantitative fluency metrics
 */
export const fluencyMetricsSchema = z.object({
  speech_rate: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z.number().describe("The student's raw score for this metric"),
        unit: z.string().describe("The unit of measurement (e.g., 'WPM')"),
      })
      .describe("User's actual speech rate measurement"),
    target_score: z
      .object({
        value: z
          .number()
          .describe(
            'The target or recommended score/range boundary for this metric (e.g., 150 WPM for B2+)'
          ),
        unit: z.string().describe("The unit of measurement (e.g., 'WPM')"),
      })
      .describe('Target benchmark for comparison'),
    interpretation: z
      .enum(['slow', 'functional', 'near-B2 speed', 'natural', 'fast'])
      .describe('Qualitative interpretation of speech rate'),
  }),
  average_pause_duration: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z.number().describe("The student's average pause duration"),
        unit: z.literal('seconds'),
      })
      .describe("User's average pause measurement"),
    target_score: z
      .object({
        value: z
          .number()
          .describe('The threshold value for acceptable pause duration (0.8s)'),
        unit: z.literal('seconds'),
      })
      .describe('Target benchmark for comparison'),
    threshold_exceeded: z
      .boolean()
      .describe('Whether average duration exceeds acceptable threshold'),
  }),
  fillers_per_100_words: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z.number().describe('Rate of filler words used per 100 words spoken.'),
        unit: z.literal('per 100 words'),
      })
      .describe("User's filler word rate"),
    target_score: z
      .object({
        value: z
          .number()
          .describe(
            'The target or threshold count for fillers per 100 words (e.g., 3.0)'
          ),
        unit: z.literal('per 100 words'),
      })
      .describe('Target benchmark for comparison'),
    level: z
      .enum(['none', 'minimal', 'low', 'moderate', 'high', 'excessive'])
      .describe('Overall level of filler word usage'),
    breakdown: z
      .array(
        z.object({
          filler: z.string().describe('The filler word or phrase'),
          count: z.number().describe('Number of times this filler was used'),
        })
      )
      .describe('Detailed breakdown of filler words'),
  }),
  hesitation_rate: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z
          .number()
          .describe(
            'The total percentage of time spent hesitating (pauses + fillers + self-correction).'
          ),
        unit: z.literal('%'),
      })
      .describe("User's hesitation rate"),
    target_score: z
      .object({
        value: z
          .number()
          .describe('The target or threshold percentage for hesitation rate (e.g., 5.0%)'),
        unit: z.literal('%'),
      })
      .describe('Target benchmark for comparison'),
  }),
});

/**
 * Complete fluency assessment report
 */
export const fluencyReportSchema = z.object({
  type: z.literal('fluency').describe('Type of assessment being performed'),
  segments: z
    .array(fluencySegmentSchema)
    .describe(
      'Top 10 segment-by-segment feedback points focusing on high-impact moments (pauses, fillers, corrections).'
    ),
  metrics: fluencyMetricsSchema,
  score: baseScoreSchema,
});

// ============================================================================
// GRAMMAR SCHEMA
// ============================================================================

/**
 * Tags for grammar-related errors (12 distinct tags)
 */
const grammarTagsEnum = z.enum([
  'Verb Tense',
  'Subject-Verb Agreement',
  'Article Usage',
  'Preposition Error',
  'Word Order',
  'Singular/Plural',
  'Pronoun Usage',
  'Modal Verb Error',
  'Conditional Structure',
  'Relative Clause',
  'Passive Voice',
  'Mixed Errors',
]);

/**
 * Individual grammar feedback segment with timestamp and suggestions
 */
export const grammarSegmentSchema = z.object({
  timestamp: timestampSchema,
  content: z
    .string()
    .describe(
      'The specific erroneous phrase or event that occurred in this segment.'
    ),
  suggestion: z
    .array(z.string())
    .describe(
      'An array of 1-3 suggested alternative sentences or phrases with correct grammar. Must only contain the suggested sentence/phrase text.'
    ),
  explanation: z
    .string()
    .describe(
      "Detailed explanation of why this segment was flagged (e.g., 'Incorrect past tense conjugation: buyed -> bought'). Must be simple and direct."
    ),
  tags: z
    .array(grammarTagsEnum)
    .describe('List of relevant grammatical error tags for the segment.'),
});

/**
 * Quantitative grammar metrics
 */
export const grammarMetricsSchema = z.object({
  errors_per_100_words: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z.number().describe('Error rate normalized per 100 words'),
        unit: z.literal('per 100 words'),
      })
      .describe("User's error rate per 100 words"),
    target_score: z
      .object({
        value: z
          .number()
          .describe(
            'The target or threshold for errors per 100 words (e.g., 5.0 for B2)'
          ),
        unit: z.literal('per 100 words'),
      })
      .describe('Target benchmark for comparison'),
    interpretation: z
      .enum([
        'highly inaccurate',
        'frequent errors',
        'noticeable errors',
        'generally accurate',
        'accurate with minor errors',
        'highly accurate',
      ])
      .describe('Qualitative interpretation of accuracy level'),
  }),
  self_correction_rate: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z.number().describe('Percentage of errors self-corrected by student'),
        unit: z.literal('%'),
      })
      .describe("Student's self-correction rate"),
    target_score: z
      .object({
        value: z
          .number()
          .describe('The target percentage for self-correction (e.g., 30.0%)'),
        unit: z.literal('%'),
      })
      .describe('Target benchmark for comparison'),
  }),
  syntactic_complexity: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z.number().describe('Score representing grammatical complexity'),
        unit: z.literal('score'),
      })
      .describe("User's syntactic complexity score"),
    target_score: z
      .object({
        value: z
          .number()
          .describe('The target complexity score (e.g., 60 for B2)'),
        unit: z.literal('score'),
      })
      .describe('Target benchmark for comparison'),
    interpretation: z
      .enum([
        'very basic structures',
        'simple structures',
        'predictable patterns',
        'varied structures',
        'complex structures',
        'sophisticated structures',
      ])
      .describe('Qualitative interpretation of syntactic complexity'),
  }),
  error_impact: z.object({
    name: z.string().describe('User-facing name of the metric'),
    dominant_error_type: z
      .enum([
        'verb tense',
        'subject-verb agreement',
        'article usage',
        'preposition errors',
        'word order',
        'plural/singular forms',
        'pronoun usage',
        'modal verbs',
        'conditional structures',
        'relative clauses',
        'passive voice',
        'mixed errors',
      ])
      .describe('Most frequent type of grammatical error'),
    impact_level: z
      .enum([
        'severely impairs meaning',
        'frequently impairs meaning',
        'occasionally impairs meaning',
        'rarely impairs meaning',
        'does not impair meaning',
        'negligible impact',
      ])
      .describe('How errors affect communication'),
    example_errors: z
      .array(
        z.object({
          error_type: z.string().describe('Category of the error'),
          incorrect: z.string().describe('The incorrect form used'),
          correct: z.string().describe('The correct form'),
          context: z.string().describe('Sentence or phrase containing the error'),
        })
      )
      .describe('List of top 3 most common error types with context and correction'),
  }),
});

/**
 * Complete grammar assessment report
 */
export const grammarReportSchema = z.object({
  type: z.literal('grammar').describe('Type of assessment being performed'),
  segments: z
    .array(grammarSegmentSchema)
    .describe(
      'Top 10 segment-by-segment feedback points focusing on high-impact grammatical errors. Must be written in simple, accessible language.'
    ),
  metrics: grammarMetricsSchema,
  score: baseScoreSchema,
});

// ============================================================================
// VOCABULARY SCHEMA
// ============================================================================

/**
 * Tags for vocabulary-related errors (8 distinct tags)
 */
const vocabularyTagsEnum = z.enum([
  'Inaccurate Collocation',
  'Word Choice Error',
  'Lexical Gap (Circumlocution)',
  'Misused Phrasal Verb',
  'Formal/Informal Mismatch',
  'Overuse of Vague Language',
  'Semantic Misuse',
  'False Friend',
]);

/**
 * Individual vocabulary feedback segment with timestamp and suggestions
 */
export const vocabularySegmentSchema = z.object({
  timestamp: timestampSchema,
  content: z
    .string()
    .describe('The specific erroneous or misused word/phrase that occurred in this segment.'),
  suggestion: z
    .array(z.string())
    .describe(
      'An array of 1-3 suggested alternative words or phrases that improve precision or range. Must only contain the suggested word/phrase text.'
    ),
  explanation: z
    .string()
    .describe(
      "Detailed explanation of why this word/phrase was flagged (e.g., 'Inaccurate collocation: make decision -> take decision'). Must be simple and direct."
    ),
  tags: z
    .array(vocabularyTagsEnum)
    .describe('List of relevant lexical error tags for the segment.'),
});

/**
 * Quantitative vocabulary metrics including CEFR level breakdown
 */
export const vocabularyMetricsSchema = z.object({
  lexical_diversity: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z.number().describe('Type-token ratio (lexical diversity)'),
        unit: z.literal('ratio'),
      })
      .describe("User's lexical diversity score"),
    target_score: z
      .object({
        value: z.number().describe('The target type-token ratio (e.g., 0.65 for B2)'),
        unit: z.literal('ratio'),
      })
      .describe('Target benchmark for comparison'),
    unique_words_count: z
      .number()
      .describe('Number of unique lexical items used (not including function words)'),
    total_words_count: z.number().describe('Total number of word forms actively used'),
  }),
  lexical_distribution: z.object({
    name: z.string().describe('User-facing name of the metric'),
    average_lexical_level: z
      .number()
      .describe('Average CEFR level of vocabulary as numeric value (e.g., 2.3 for B2)'),
    interpretation: z
      .enum([
        'very basic vocabulary',
        'elementary vocabulary',
        'adequate for general topics',
        'good range for complex topics',
        'sophisticated vocabulary',
        'highly advanced vocabulary',
      ])
      .describe('Qualitative interpretation of lexical distribution'),
    cefr_breakdown: z
      .object({
        A1: z
          .object({
            percentage: z.number().describe('Percentage of A1 level vocabulary'),
            words: z.array(z.string()).describe('List of lemmatized A1 words used'),
          })
          .describe('A1 level vocabulary breakdown'),
        A2: z
          .object({
            percentage: z.number().describe('Percentage of A2 level vocabulary'),
            words: z.array(z.string()).describe('List of lemmatized A2 words used'),
          })
          .describe('A2 level vocabulary breakdown'),
        B1: z
          .object({
            percentage: z.number().describe('Percentage of B1 level vocabulary'),
            words: z.array(z.string()).describe('List of lemmatized B1 words used'),
          })
          .describe('B1 level vocabulary breakdown'),
        B2: z
          .object({
            percentage: z.number().describe('Percentage of B2 level vocabulary'),
            words: z.array(z.string()).describe('List of lemmatized B2 words used'),
          })
          .describe('B2 level vocabulary breakdown'),
        C1: z
          .object({
            percentage: z.number().describe('Percentage of C1 level vocabulary'),
            words: z.array(z.string()).describe('List of lemmatized C1 words used'),
          })
          .describe('C1 level vocabulary breakdown'),
        C2: z
          .object({
            percentage: z.number().describe('Percentage of C2 level vocabulary'),
            words: z.array(z.string()).describe('List of lemmatized C2 words used'),
          })
          .describe('C2 level vocabulary breakdown'),
      })
      .describe('Breakdown of vocabulary by CEFR level with percentages and word lists'),
  }),
  lexical_sophistication: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z.number().describe('Percentage of B2+ vocabulary used'),
        unit: z.literal('%'),
      })
      .describe("User's sophistication score"),
    target_score: z
      .object({
        value: z
          .number()
          .describe('The target percentage of B2+ vocabulary (e.g., 30.0 for B2)'),
        unit: z.literal('%'),
      })
      .describe('Target benchmark for comparison'),
    interpretation: z
      .enum([
        'restricted to basic needs',
        'adequate for simple transactions',
        'sufficient for general topics',
        'broad and flexible for general topics',
        'good range for complex topics',
        'extensive and specialized',
      ])
      .describe('Qualitative interpretation of lexical sophistication'),
  }),
  lexical_precision: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z.number().describe('Total number of precision errors per 100 words'),
        unit: z.literal('per 100 words'),
      })
      .describe("User's precision error rate"),
    target_score: z
      .object({
        value: z
          .number()
          .describe(
            'The target threshold for precision errors per 100 words (e.g., 3.0 for B2)'
          ),
        unit: z.literal('per 100 words'),
      })
      .describe('Target benchmark for comparison'),
    precision_level: z
      .enum([
        'frequent basic misuse',
        'noticeable misuse of complex terms',
        'generally accurate with minor lapses',
        'accurate with rare slips',
        'highly precise',
      ])
      .describe('Qualitative interpretation of vocabulary precision'),
    error_examples: z
      .array(
        z.object({
          error_type: z
            .string()
            .describe('Type of precision error (e.g., Misused Collocation)'),
          incorrect: z.string().describe('The incorrect word/phrase used in context'),
          correct: z.string().describe('The corrected word/phrase'),
        })
      )
      .describe('List of the top 3 most common precision errors with context and correction'),
  }),
});

/**
 * Complete vocabulary assessment report
 */
export const vocabularyReportSchema = z.object({
  type: z.literal('vocabulary').describe('Type of assessment being performed'),
  segments: z
    .array(vocabularySegmentSchema)
    .describe(
      'Top 10 segment-by-segment feedback points focusing on high-impact lexical errors or misuse. Must be written in simple, accessible language.'
    ),
  metrics: vocabularyMetricsSchema,
  score: baseScoreSchema,
});

// ============================================================================
// PRONUNCIATION SCHEMA
// ============================================================================

/**
 * Tags for pronunciation-related errors (7 distinct tags)
 */
const pronunciationTagsEnum = z.enum([
  'Segmental Error (Vowel)',
  'Segmental Error (Consonant)',
  'Word Stress Error',
  'Sentence Stress Error',
  'Intonation Error (Meaning)',
  'Rhythm/Syllable Timing',
  'Linking/Elision Issue',
]);

/**
 * Individual pronunciation feedback segment with timestamp and suggestions
 */
export const pronunciationSegmentSchema = z.object({
  timestamp: timestampSchema,
  content: z.string().describe('The specific word or phrase that contained the error.'),
  suggestion: z
    .array(z.string())
    .describe(
      'An array of 1-3 suggested alternative pronunciation strategies (e.g., focus on the /th/ sound, use falling intonation). Must only contain the suggested advice text.'
    ),
  explanation: z
    .string()
    .describe(
      'Detailed explanation of the error (e.g., \'The /th/ was pronounced as /z/, which affected comprehension of the word *them*\'). Must be simple and direct.'
    ),
  tags: z
    .array(pronunciationTagsEnum)
    .describe('List of relevant phonological error tags for the segment.'),
});

/**
 * Quantitative pronunciation metrics including phoneme analysis
 */
export const pronunciationMetricsSchema = z.object({
  segmental_accuracy: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z.number().describe('Average Goodness of Pronunciation (GOP) score'),
        unit: z.literal('score'),
      })
      .describe("User's GOP score"),
    target_score: z
      .object({
        value: z.number().describe('The target GOP score (e.g., 75 for B2)'),
        unit: z.literal('score'),
      })
      .describe('Target benchmark for comparison'),
    error_rate: z
      .number()
      .describe('Number of segmental (individual sound) errors per 100 words'),
    problematic_phonemes: z
      .array(
        z.object({
          phoneme: z
            .string()
            .describe('IPA notation of problematic phoneme (e.g., /θ/, /r/)'),
          accuracy: z
            .number()
            .describe('Average accuracy percentage for this phoneme (0-100)'),
          examples: z
            .array(z.string())
            .describe('Words where this phoneme was most frequently mispronounced'),
        })
      )
      .describe('List of top 3 specific phonemes causing difficulty'),
  }),
  word_stress_accuracy: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z.number().describe('Number of word stress errors per 100 words'),
        unit: z.literal('per 100 words'),
      })
      .describe("User's word stress error rate"),
    target_score: z
      .object({
        value: z
          .number()
          .describe(
            'The target threshold for word stress errors per 100 words (e.g., 3.0 for B2)'
          ),
        unit: z.literal('per 100 words'),
      })
      .describe('Target benchmark for comparison'),
  }),
  intonation_control: z.object({
    name: z.string().describe('User-facing name of the metric'),
    deviation_level: z
      .enum(['low', 'medium', 'high'])
      .describe('How much intonation deviates from native-like patterns'),
    meaning_variation: z
      .enum(['limited', 'functional', 'effective'])
      .describe(
        'Ability to use intonation to convey different meanings (e.g., question vs. statement)'
      ),
    sentence_stress_error_rate: z
      .number()
      .describe('Number of incorrect sentence stress placements per 100 words'),
  }),
  intelligibility: z.object({
    name: z.string().describe('User-facing name of the metric'),
    listener_strain: z
      .enum(['none', 'minimal', 'noticeable', 'significant', 'severe'])
      .describe('How much effort the listener must exert to understand the speech'),
    overall_impact: z
      .enum([
        'fully intelligible',
        'clearly intelligible',
        'generally intelligible',
        'often unintelligible',
      ])
      .describe('Overall impact of all errors on communication'),
  }),
});

/**
 * Complete pronunciation assessment report
 */
export const pronunciationReportSchema = z.object({
  type: z.literal('pronunciation').describe('Type of assessment being performed'),
  segments: z
    .array(pronunciationSegmentSchema)
    .describe(
      'Top 10 segment-by-segment feedback points focusing on high-impact pronunciation errors (segmental or suprasegmental). Must be written in simple, accessible language.'
    ),
  metrics: pronunciationMetricsSchema,
  score: baseScoreSchema,
});

// ============================================================================
// CLARITY SCHEMA
// ============================================================================

/**
 * Tags for clarity-related issues (8 distinct tags)
 */
const clarityTagsEnum = z.enum([
  'Missing Connector',
  'Inappropriate Connector',
  'Unclear Reference',
  'Topic Drift',
  'Abrupt Transition',
  'Lack of Structure',
  'Repetitive Linking',
  'Logical Gap',
]);

/**
 * Individual clarity feedback segment with timestamp and suggestions
 */
export const claritySegmentSchema = z.object({
  timestamp: timestampSchema,
  content: z
    .string()
    .describe(
      'The specific phrase or segment that demonstrates a coherence/clarity issue.'
    ),
  suggestion: z
    .array(z.string())
    .describe(
      'An array of 1-3 suggested alternative ways to express the idea more clearly or with better cohesion. Must only contain the suggested sentence/phrase text.'
    ),
  explanation: z
    .string()
    .describe(
      "Detailed explanation of the coherence/clarity issue (e.g., 'Missing linking word creates confusion between ideas', 'Topic shift without transition'). Must be simple and direct."
    ),
  tags: z
    .array(clarityTagsEnum)
    .describe('List of relevant coherence/clarity issue tags for the segment.'),
});

/**
 * Quantitative clarity metrics
 */
export const clarityMetricsSchema = z.object({
  cohesive_devices: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z
          .number()
          .describe(
            'Number of cohesive devices (linking words, pronouns, synonyms) per 100 words'
          ),
        unit: z.literal('per 100 words'),
      })
      .describe("User's cohesive device usage rate"),
    target_score: z
      .object({
        value: z
          .number()
          .describe(
            'The target number of cohesive devices per 100 words (e.g., 8.0 for B2)'
          ),
        unit: z.literal('per 100 words'),
      })
      .describe('Target benchmark for comparison'),
    variety_level: z
      .enum(['limited', 'functional', 'varied', 'sophisticated'])
      .describe('Qualitative assessment of the variety of cohesive devices used'),
    misuse_rate: z
      .number()
      .describe(
        'Percentage of cohesive devices that are used inappropriately or awkwardly (0-100)'
      ),
  }),
  discourse_organization: z.object({
    name: z.string().describe('User-facing name of the metric'),
    user_score: z
      .object({
        value: z
          .number()
          .describe('Count of explicit discourse markers used to structure speech'),
        unit: z.literal('count'),
      })
      .describe("User's discourse marker count"),
    target_score: z
      .object({
        value: z.number().describe('The target count of discourse markers (e.g., 5 for B2)'),
        unit: z.literal('count'),
      })
      .describe('Target benchmark for comparison'),
    structural_clarity: z
      .enum(['disjointed', 'linear/basic', 'well-structured', 'lucid/articulate'])
      .describe(
        "Assessment of how easy it is to follow the speaker's main points and structure"
      ),
  }),
  thematic_continuity: z.object({
    name: z.string().describe('User-facing name of the metric'),
    topic_drift_count: z
      .number()
      .describe('Number of times the student drifted significantly off the main topic or task'),
    recovery_rate: z
      .number()
      .describe(
        'Percentage of times the student successfully returned to the original topic after a digression (0-100)'
      ),
  }),
});

/**
 * Complete clarity assessment report
 */
export const clarityReportSchema = z.object({
  type: z.literal('clarity').describe('Type of assessment being performed'),
  segments: z
    .array(claritySegmentSchema)
    .describe(
      'Top 10 segment-by-segment feedback points focusing on high-impact coherence and clarity issues. Must be written in simple, accessible language.'
    ),
  metrics: clarityMetricsSchema,
  score: baseScoreSchema,
});

// ============================================================================
// SUMMARY SCHEMA
// ============================================================================

/**
 * Complete summary aggregating all CEFR dimension scores with action plan
 */
export const summarySchema = z.object({
  type: z.literal('summary').describe('Indicates the holistic nature of the final report.'),
  dimension_scores: z
    .object({
      fluency: z.number().min(0).max(100).describe('Fluency score out of 100'),
      grammar: z.number().min(0).max(100).describe('Grammar accuracy score out of 100'),
      vocabulary: z.number().min(0).max(100).describe('Vocabulary score out of 100'),
      pronunciation: z
        .number()
        .min(0)
        .max(100)
        .describe('Pronunciation score out of 100'),
      clarity: z
        .number()
        .min(0)
        .max(100)
        .describe('Coherence and clarity score out of 100'),
    })
    .describe('Summary of scores from each of the 5 assessed dimensions.'),
  score: z
    .object({
      strengths: z
        .array(z.string())
        .describe(
          'A list of the 3 most significant, cross-dimensional strengths, prioritized for the student.'
        ),
      limitations: z
        .array(z.string())
        .describe(
          'A list of the 3 most critical, cross-dimensional weaknesses that must be addressed first.'
        ),
      score: z
        .number()
        .min(0)
        .max(100)
        .describe('Overall holistic score out of 100 (average of all 5 dimensions)'),
      confidence_level: z
        .enum(['low', 'medium', 'high'])
        .describe('Confidence in the overall assessment'),
      reason: z
        .string()
        .describe(
          'Comprehensive narrative (2-3 paragraphs) explaining the overall score and performance, written in the second person addressing the student.'
        ),
    })
    .describe('Overall summary score with strengths, limitations, and reasoning'),
  action_plan: z
    .array(z.string())
    .describe(
      'A list of 3-5 specific, high-impact activities tailored to address the major limitations and build on strengths.'
    ),
});

// ============================================================================
// CEFR REPORTS SCHEMA
// ============================================================================

/**
 * All CEFR dimension reports grouped together
 */
export const cefrReportsSchema = z.object({
  summary: summarySchema,
  grammar: grammarReportSchema,
  vocabulary: vocabularyReportSchema,
  fluency: fluencyReportSchema,
  pronunciation: pronunciationReportSchema,
  clarity: clarityReportSchema,
});

// ============================================================================
// COMPLETE V2 EVALUATION DATA SCHEMA
// ============================================================================

/**
 * Complete V2 evaluation data with processed transcript, analysis, and CEFR reports
 */
export const v2EvaluationDataSchema = z.object({
  transcript: processedTranscriptSchema,
  interactive_analysis: analysisSchema,
  reports: z.object({
    cefr: cefrReportsSchema,
  }),
});

// ============================================================================
// WEBHOOK PAYLOAD SCHEMAS
// ============================================================================

/**
 * Successful webhook payload with evaluation results
 */
export const webhookPayloadSuccessSchema = z.object({
  recording_id: z.string(),
  correlation_id: z.string(),
  status: z.literal('completed'),
  data: v2EvaluationDataSchema,
  processing_time_ms: z.number(),
});

/**
 * Failed webhook payload with error information
 */
export const webhookPayloadErrorSchema = z.object({
  recording_id: z.string(),
  correlation_id: z.string(),
  status: z.literal('failed'),
  error: z.string(),
  processing_time_ms: z.number(),
});

/**
 * Discriminated union of success and error webhook payloads
 */
export const webhookPayloadSchema = z.union([
  webhookPayloadSuccessSchema,
  webhookPayloadErrorSchema,
]);

// ============================================================================
// EXPORTED TYPES
// ============================================================================

export type Timestamp = z.infer<typeof timestampSchema>;
export type SpeakerId = z.infer<typeof speakerIdSchema>;
export type ConfidenceLevel = z.infer<typeof confidenceLevelSchema>;
export type BaseScore = z.infer<typeof baseScoreSchema>;

export type TranscriptSegment = z.infer<typeof transcriptSegmentSchema>;
export type SpeakerMap = z.infer<typeof speakerMapSchema>;
export type TalkTimeMetrics = z.infer<typeof talkTimeMetricsSchema>;
export type ProcessedTranscript = z.infer<typeof processedTranscriptSchema>;

export type TopicSegment = z.infer<typeof topicSegmentSchema>;
export type SafetyFlags = z.infer<typeof safetyFlagsSchema>;
export type SpeakerSentiment = z.infer<typeof speakerSentimentSchema>;
export type EmotionEvent = z.infer<typeof emotionEventSchema>;
export type Analysis = z.infer<typeof analysisSchema>;

export type FluencySegment = z.infer<typeof fluencySegmentSchema>;
export type FluencyMetrics = z.infer<typeof fluencyMetricsSchema>;
export type FluencyReport = z.infer<typeof fluencyReportSchema>;

export type GrammarSegment = z.infer<typeof grammarSegmentSchema>;
export type GrammarMetrics = z.infer<typeof grammarMetricsSchema>;
export type GrammarReport = z.infer<typeof grammarReportSchema>;

export type VocabularySegment = z.infer<typeof vocabularySegmentSchema>;
export type VocabularyMetrics = z.infer<typeof vocabularyMetricsSchema>;
export type VocabularyReport = z.infer<typeof vocabularyReportSchema>;

export type PronunciationSegment = z.infer<typeof pronunciationSegmentSchema>;
export type PronunciationMetrics = z.infer<typeof pronunciationMetricsSchema>;
export type PronunciationReport = z.infer<typeof pronunciationReportSchema>;

export type ClaritySegment = z.infer<typeof claritySegmentSchema>;
export type ClarityMetrics = z.infer<typeof clarityMetricsSchema>;
export type ClarityReport = z.infer<typeof clarityReportSchema>;

export type Summary = z.infer<typeof summarySchema>;
export type CEFRReports = z.infer<typeof cefrReportsSchema>;
export type V2EvaluationData = z.infer<typeof v2EvaluationDataSchema>;

export type WebhookPayloadSuccess = z.infer<typeof webhookPayloadSuccessSchema>;
export type WebhookPayloadError = z.infer<typeof webhookPayloadErrorSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
