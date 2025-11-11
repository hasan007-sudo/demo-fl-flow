import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { generatePresignedUrlFromS3Url } from "@/lib/s3-client";

// CEFR level definitions for scoring
const CEFR_LEVELS = {
  A1: { min: 0, max: 20, label: "Beginner" },
  A2: { min: 20, max: 40, label: "Elementary" },
  B1: { min: 40, max: 60, label: "Intermediate" },
  B2: { min: 60, max: 75, label: "Upper Intermediate" },
  C1: { min: 75, max: 90, label: "Advanced" },
  C2: { min: 90, max: 100, label: "Proficient" },
};

function getCEFRLevel(score: number): string {
  if (score >= 90) return "C2";
  if (score >= 75) return "C1";
  if (score >= 60) return "B2";
  if (score >= 40) return "B1";
  if (score >= 20) return "A2";
  return "A1";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // Get session with audio URL
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        englishResponse: true,
        interviewResponse: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (!session.audioUrl) {
      return NextResponse.json(
        { error: "No audio recording available for this session" },
        { status: 400 }
      );
    }

    // Initialize Gemini
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    // Create evaluation prompt based on agent type
    let contextInfo = "";
    let evaluationPrompt = "";

    if (session.agentType === "english_tutor" && session.englishResponse) {
      contextInfo = `
Student Profile:
- Proficiency Level: ${session.englishResponse.proficiencyLevel}
- Speaking Speed Preference: ${session.englishResponse.speakingSpeed}
- Learning Goals: ${JSON.stringify(session.englishResponse.learningGoals)}
- Correction Preference: ${session.englishResponse.correctionPreference}
`;

      evaluationPrompt = `
You are an expert English language evaluator using the CEFR (Common European Framework of Reference) standards.

${contextInfo}

Please analyze this English conversation and provide scores on a 0-100 scale for the following areas:

1. Pronunciation - Clarity of speech sounds, accent, and intonation
2. Grammar - Accuracy of grammatical structures and sentence formation
3. Vocabulary - Range and appropriateness of vocabulary used
4. Fluency - Smoothness of speech, natural pacing, minimal hesitation
5. Comprehension - Understanding of questions and ability to respond appropriately

Return ONLY a valid JSON response in this exact format:
{
  "scores": {
    "pronunciation": <number 0-100>,
    "grammar": <number 0-100>,
    "vocabulary": <number 0-100>,
    "fluency": <number 0-100>,
    "comprehension": <number 0-100>
  },
  "overallScore": <number 0-100>,
  "cefrLevel": "<A1|A2|B1|B2|C1|C2>",
  "insights": [
    "<brief insight 1>",
    "<brief insight 2>",
    "<brief insight 3>"
  ]
}

Base your evaluation on CEFR standards where:
- A1 (0-20): Can understand and use basic phrases
- A2 (20-40): Can communicate in simple routine tasks
- B1 (40-60): Can deal with most situations while traveling
- B2 (60-75): Can interact with native speakers with fluency
- C1 (75-90): Can use language flexibly for social and professional purposes
- C2 (90-100): Can understand virtually everything with ease

Important: Provide realistic scores based on actual performance. Keep insights brief and actionable.`;

    } else if (session.agentType === "interview_preparer" && session.interviewResponse) {
      contextInfo = `
Candidate Profile:
- Interview Type: ${session.interviewResponse.interviewType}
- Job Role: ${session.interviewResponse.jobRole}
- Experience Level: ${session.interviewResponse.experienceLevel}
- Focus Areas: ${JSON.stringify(session.interviewResponse.focusAreas)}
`;

      evaluationPrompt = `
You are an expert interview coach and talent evaluator with years of experience assessing candidates across various industries.

${contextInfo}

Please analyze this mock interview session and provide scores on a 0-100 scale for the following areas:

1. Communication Skills - Clarity, articulation, and effectiveness of verbal expression
2. Technical Accuracy - Correctness and depth of domain knowledge (for technical questions)
3. Problem-Solving - Structured thinking, analytical approach, and methodology
4. Confidence & Composure - Handling pressure, nervousness management, and professional demeanor
5. Content Depth - Quality of examples, depth of experience shared, and relevance to the role
6. Structure & Organization - Use of frameworks like STAR method (for behavioral), logical flow of answers

Return ONLY a valid JSON response in this exact format:
{
  "scores": {
    "communication": <number 0-100>,
    "technical": <number 0-100>,
    "problemSolving": <number 0-100>,
    "confidence": <number 0-100>,
    "contentDepth": <number 0-100>,
    "structure": <number 0-100>
  },
  "overallScore": <number 0-100>,
  "performanceLevel": "<Needs Improvement|Developing|Competent|Proficient|Expert>",
  "insights": [
    "<brief actionable insight 1>",
    "<brief actionable insight 2>",
    "<brief actionable insight 3>",
    "<brief actionable insight 4>"
  ]
}

Rate the performance level based on:
- Needs Improvement (0-30): Significant gaps in interview skills, requires substantial practice
- Developing (30-50): Shows basic interview skills but needs refinement and confidence building
- Competent (50-70): Demonstrates solid interview performance with room for polish
- Proficient (70-85): Strong interviewing skills, ready for most interview situations
- Expert (85-100): Exceptional interview performance, very likely to succeed

Important:
- Provide realistic scores based on actual performance
- Consider the interview type and experience level when evaluating
- Keep insights brief, specific, and actionable for improvement
- Focus on what matters most for succeeding in real interviews`;
    }

    try {
      console.log('session.audioUrl', session.audioUrl);

      // Generate presigned URL for secure access to private S3 file
      const presignedUrl = await generatePresignedUrlFromS3Url(session.audioUrl, 3600);
      console.log('Generated presigned URL for audio fetch');

      const audioData = await fetchAudioAsBase64(presignedUrl);

      const result = await model.generateContent([
        { text: evaluationPrompt },
        {
          inlineData: {
            mimeType: 'audio/mp4',
            data: audioData
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format from AI model");
      }

      const evaluation = JSON.parse(jsonMatch[0]);

      // Handle level/grade for both agent types
      if (session.agentType === "english_tutor" && !evaluation.cefrLevel) {
        evaluation.cefrLevel = getCEFRLevel(evaluation.overallScore);
      }

      evaluation.sessionId = sessionId;
      evaluation.evaluatedAt = new Date().toISOString();
      evaluation.agentType = session.agentType;

      // Save evaluation data to database (both scores and full data)
      const evaluationData: any = {
        scores: evaluation.scores,
        overallScore: evaluation.overallScore,
        insights: evaluation.insights || [],
      };

      // Add agent-specific fields
      if (session.agentType === "english_tutor") {
        evaluationData.cefrLevel = evaluation.cefrLevel;
      } else if (session.agentType === "interview_preparer") {
        evaluationData.performanceLevel = evaluation.performanceLevel;
      }

      await prisma.session.update({
        where: { id: sessionId },
        data: {
          evaluationScores: evaluation.scores,
          evaluationData: evaluationData,
        },
      });

      console.log('✅ Evaluation data saved to database:', sessionId);

      return NextResponse.json(evaluation);

    } catch (aiError) {
      console.error("AI evaluation error:", aiError);
      return NextResponse.json(
        { error: "Failed to evaluate session" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate session" },
      { status: 500 }
    );
  }
}

async function fetchAudioAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
  } catch (error) {
    console.error("Error fetching audio:", error);
    throw new Error("Failed to fetch audio file");
  }
}
