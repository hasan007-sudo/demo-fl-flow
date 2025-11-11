# Learning Forever - Next.js App

AI-powered learning platform for English coaching and interview preparation with LiveKit voice sessions.

## 🚀 Setup Complete

This Next.js app has been fully migrated from the TanStack Start version with LiveKit integration from grant-app.

### Project Structure

```
learning-forever-nextjs/
├── app/
│   ├── api/                      # API routes
│   │   ├── connection-details/   # LiveKit room creation
│   │   ├── webhooks/livekit/     # Recording webhooks
│   │   ├── sessions/             # Session management
│   │   ├── session-survey/       # Survey submission
│   │   └── users/                # User management
│   ├── english-tutor/            # English tutor flow
│   │   ├── page.tsx              # Questionnaire
│   │   └── session/page.tsx      # LiveKit session
│   ├── interview-preparer/       # Interview prep flow
│   │   ├── page.tsx              # Questionnaire
│   │   └── session/page.tsx      # LiveKit session
│   ├── survey/page.tsx           # Post-session survey
│   ├── report/page.tsx           # Session evaluation report
│   └── page.tsx                  # Landing page
├── components/
│   ├── livekit/                  # LiveKit components
│   ├── session/                  # Session management
│   ├── ui/                       # ShadCN components
│   ├── Navbar.tsx                # Navigation bar
│   └── theme-provider.tsx        # Theme provider
├── lib/
│   ├── prisma.ts                 # Prisma client
│   ├── livekit-egress.ts         # Recording utilities
│   ├── s3-client.ts              # S3 utilities
│   ├── session-timer-config.ts   # Timer configuration
│   └── utils.ts                  # Utility functions
├── hooks/
│   └── use-session-timer.ts      # Session timer hook
└── prisma/
    └── schema.prisma              # Database schema
```

## 📦 Dependencies Installed

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4, ShadCN UI
- **LiveKit**: livekit-client, livekit-server-sdk, @livekit/components-react
- **Database**: Prisma with PostgreSQL
- **Forms**: react-hook-form, zod, @hookform/resolvers
- **Storage**: @aws-sdk/client-s3, @aws-sdk/s3-request-presigner
- **Charts**: recharts
- **UI**: lucide-react, next-themes, sonner
- **AI**: @google/generative-ai (optional)

## 🗄️ Database Setup

### Tables Created:
- ✅ `TutorProfile` - AI tutor profiles
- ✅ `InterviewerProfile` - AI interviewer profiles
- ✅ `User` - User accounts
- ✅ `EnglishTutorQnResponses` - English tutor questionnaires
- ✅ `InterviewPreparerQnResponses` - Interview prep questionnaires
- ✅ `Session` - Session tracking with LiveKit
- ✅ `SessionSurvey` - Post-session surveys
- ✅ `Waitlist` - Email waitlist

Migrations have been run successfully!

## 🔑 Environment Variables

Your `.env` file should contain:

```env
# Database
DATABASE_URL="postgresql://..."

# LiveKit
LIVEKIT_URL="wss://..."
LIVEKIT_API_KEY="..."
LIVEKIT_API_SECRET="..."

# S3 Storage (for session recordings)
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
S3_REGION="..."
S3_BUCKET="..."
S3_ENDPOINT="..."
S3_FORCE_PATH_STYLE="false"

# AI Evaluation (optional)
GOOGLE_GENERATIVE_AI_API_KEY="..."
```

## 🎯 User Flows

### English Tutor Flow
1. **Landing Page** (`/`) → Click "Talk to AI - Free" or "Explore" under English Coach
2. **Questionnaire** (`/english-tutor`) → Fill proficiency, learning goals, correction preference
3. **Session** (`/english-tutor/session`) → 10-minute voice session with AI tutor
4. **Survey** (`/survey`) → Rate experience (0-10) and provide feedback
5. **Report** (`/report`) → View CEFR evaluation scores and charts

### Interview Preparer Flow
1. **Landing Page** (`/`) → Click "Explore" under Interview Preparer
2. **Questionnaire** (`/interview-preparer`) → Fill interview type, job role, experience
3. **Session** (`/interview-preparer/session`) → 15-minute mock interview
4. **Survey** (`/survey`) → Rate experience and feedback
5. **Report** (`/report`) → View interview performance evaluation

## 🎨 Design System

### Minimal Dark Theme
- **Background**: Gray-900 (#111827)
- **Cards**: Gray-800 with gray-700 borders
- **Text**: White primary, gray-400 secondary
- **Accents**: Indigo-500 for links/actions
- **NO emojis**: Text-only interface
- **NO colorful styling**: Consistent dark theme throughout

### Key Components
- **Navbar**: Atom logo + theme toggle + navigation
- **SessionView**: LiveKit room with voice visualization
- **AgentControlBar**: Microphone controls + device selection
- **SessionTimerDisplay**: Countdown timer with status indicators
- **Survey**: Simple NPS score + text feedback
- **Report**: Radar chart + skill breakdown + insights

## 🚀 Running the App

```bash
# Install dependencies (if not done)
npm install

# Run database migrations (already done)
npx prisma migrate dev

# Generate Prisma client (already done)
npx prisma generate

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 🧪 Testing the App

### Test Flow End-to-End:

1. **Landing Page**
   - Check theme toggle works (light/dark)
   - Navigation links functional
   - Footer displays

2. **Questionnaire**
   - Fill out form with valid data
   - Submit should navigate to session

3. **Session**
   - LiveKit connection establishes
   - Microphone controls work
   - Timer counts down
   - Can leave session

4. **Survey**
   - Select NPS score (0-10)
   - Fill feedback text
   - Submit navigates to report

5. **Report**
   - Displays evaluation scores
   - Shows radar chart
   - Back to home works

## ⚠️ Known Setup Requirements

### Before Testing LiveKit:
1. ✅ Environment variables configured
2. ✅ Database migrations run
3. ⚠️ LiveKit server running and accessible
4. ⚠️ S3 bucket created and configured
5. ⚠️ Webhook URL configured in LiveKit dashboard

### Optional Setup:
- Seed tutor/interviewer profiles in database
- Configure Gemini AI for automatic evaluations
- Set up production LiveKit server
- Configure production S3 bucket

## 📝 API Routes Reference

- `POST /api/connection-details` - Create LiveKit room and token
- `POST /api/webhooks/livekit` - Handle recording webhooks
- `POST /api/sessions` - Create session
- `GET /api/sessions/[id]` - Get session details
- `PATCH /api/sessions/[id]` - Update session
- `POST /api/session-survey` - Submit survey
- `POST /api/users` - Create user
- `GET /api/tutors` - List tutors
- `GET /api/interviewers` - List interviewers

## 🎯 Next Steps

1. **Test the complete flow** with LiveKit server
2. **Seed database** with sample tutor/interviewer profiles
3. **Configure webhooks** in LiveKit dashboard
4. **Test recording** and S3 storage
5. **Test evaluation** with Gemini AI (optional)
6. **Deploy** to production (Vercel recommended)

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Database commands
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create new migration
npx prisma generate        # Regenerate Prisma client
npx prisma db push         # Push schema without migration
```

## 📚 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, ShadCN UI
- **Real-time**: LiveKit (WebRTC voice sessions)
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: AWS S3 (session recordings)
- **AI**: Google Gemini (optional evaluations)
- **Deployment**: Vercel-ready

## 🎉 Status

✅ All pages created
✅ All API routes implemented
✅ LiveKit components integrated
✅ Database schema migrated
✅ Minimal dark theme applied
✅ Complete user flows implemented

**Ready for testing!**
