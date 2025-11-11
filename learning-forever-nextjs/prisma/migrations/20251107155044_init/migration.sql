-- CreateTable
CREATE TABLE "TutorProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "gender" TEXT NOT NULL,
    "primaryStyles" JSONB NOT NULL,
    "speakingSpeeds" JSONB NOT NULL,
    "specialtyInterests" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "whatsapp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishTutorQnResponses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proficiencyLevel" TEXT NOT NULL,
    "genderPreference" TEXT NOT NULL,
    "speakingSpeed" TEXT NOT NULL,
    "interests" JSONB NOT NULL,
    "comfortableLanguage" TEXT NOT NULL,
    "tutorStyles" JSONB NOT NULL,
    "correctionPreference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnglishTutorQnResponses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewPreparerQnResponses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interviewType" TEXT NOT NULL,
    "jobRole" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "genderPreference" TEXT NOT NULL DEFAULT 'no_preference',
    "targetIndustry" TEXT NOT NULL,
    "companySize" TEXT NOT NULL,
    "interviewFormat" TEXT NOT NULL,
    "preparationLevel" TEXT NOT NULL,
    "focusAreas" JSONB NOT NULL,
    "weakPoints" JSONB NOT NULL,
    "practiceGoals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewPreparerQnResponses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewerProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "gender" TEXT NOT NULL,
    "interviewStyles" JSONB NOT NULL,
    "industryExperience" JSONB NOT NULL,
    "roleExpertise" JSONB NOT NULL,
    "experienceLevels" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "englishResponseId" TEXT,
    "matchedTutorId" TEXT,
    "interviewResponseId" TEXT,
    "matchedInterviewerId" TEXT,
    "roomName" TEXT,
    "participantToken" TEXT,
    "serverUrl" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "endReason" TEXT,
    "egressId" TEXT,
    "audioUrl" TEXT,
    "evaluationScores" JSONB,
    "evaluationData" JSONB,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionSurvey" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "matchedTutorId" TEXT,
    "matchedInterviewerId" TEXT,
    "npsScore" INTEGER NOT NULL,
    "feedbackText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "planType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TutorProfile_gender_idx" ON "TutorProfile"("gender");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_whatsapp_idx" ON "User"("whatsapp");

-- CreateIndex
CREATE INDEX "EnglishTutorQnResponses_userId_idx" ON "EnglishTutorQnResponses"("userId");

-- CreateIndex
CREATE INDEX "InterviewPreparerQnResponses_userId_idx" ON "InterviewPreparerQnResponses"("userId");

-- CreateIndex
CREATE INDEX "InterviewerProfile_gender_idx" ON "InterviewerProfile"("gender");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_status_idx" ON "Session"("status");

-- CreateIndex
CREATE INDEX "Session_startedAt_idx" ON "Session"("startedAt");

-- CreateIndex
CREATE INDEX "Session_agentType_idx" ON "Session"("agentType");

-- CreateIndex
CREATE UNIQUE INDEX "SessionSurvey_sessionId_key" ON "SessionSurvey"("sessionId");

-- CreateIndex
CREATE INDEX "SessionSurvey_sessionId_idx" ON "SessionSurvey"("sessionId");

-- CreateIndex
CREATE INDEX "SessionSurvey_matchedTutorId_idx" ON "SessionSurvey"("matchedTutorId");

-- CreateIndex
CREATE INDEX "SessionSurvey_matchedInterviewerId_idx" ON "SessionSurvey"("matchedInterviewerId");

-- CreateIndex
CREATE INDEX "SessionSurvey_agentType_idx" ON "SessionSurvey"("agentType");

-- CreateIndex
CREATE INDEX "Waitlist_userId_idx" ON "Waitlist"("userId");

-- CreateIndex
CREATE INDEX "Waitlist_email_idx" ON "Waitlist"("email");

-- CreateIndex
CREATE INDEX "Waitlist_planType_idx" ON "Waitlist"("planType");

-- AddForeignKey
ALTER TABLE "EnglishTutorQnResponses" ADD CONSTRAINT "EnglishTutorQnResponses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewPreparerQnResponses" ADD CONSTRAINT "InterviewPreparerQnResponses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_englishResponseId_fkey" FOREIGN KEY ("englishResponseId") REFERENCES "EnglishTutorQnResponses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_matchedTutorId_fkey" FOREIGN KEY ("matchedTutorId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_interviewResponseId_fkey" FOREIGN KEY ("interviewResponseId") REFERENCES "InterviewPreparerQnResponses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_matchedInterviewerId_fkey" FOREIGN KEY ("matchedInterviewerId") REFERENCES "InterviewerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionSurvey" ADD CONSTRAINT "SessionSurvey_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionSurvey" ADD CONSTRAINT "SessionSurvey_matchedTutorId_fkey" FOREIGN KEY ("matchedTutorId") REFERENCES "TutorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionSurvey" ADD CONSTRAINT "SessionSurvey_matchedInterviewerId_fkey" FOREIGN KEY ("matchedInterviewerId") REFERENCES "InterviewerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
