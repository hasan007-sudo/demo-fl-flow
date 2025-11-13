'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SessionView } from '@/components/session/session-view';
import { useSessionTimer } from '@/hooks/use-session-timer';

function EnglishTutorSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const responseId = searchParams.get('responseId');

  const [connectionDetails, setConnectionDetails] = useState<{
    serverUrl: string;
    roomName: string;
    participantToken: string;
    participantName: string;
    sessionId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timer: Elapsed time counter (starts from 00:00)
  const timer = useSessionTimer({
    autoStart: false,
  });

  useEffect(() => {
    if (!userId || !responseId) {
      setError('Missing user or response information');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchConnectionDetails() {
      try {
        // Create session first - direct connection without matching
        const sessionResponse = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            agentType: 'english_tutor',
            ...(responseId && { englishResponseId: responseId }),
          }),
        });

        if (!sessionResponse.ok) {
          throw new Error('Failed to create session');
        }

        const session = await sessionResponse.json();

        if (!isMounted) return;

        // Store session ID in localStorage for survey page
        localStorage.setItem('currentSessionId', session.id);

        // Fetch connection details
        const connectionResponse = await fetch('/api/connection-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: `user_${userId}`,
            name: 'User',
            agent_type: 'english_tutor',
            session_id: session.id,
          }),
        });

        if (!connectionResponse.ok) {
          throw new Error('Failed to get connection details');
        }

        const details = await connectionResponse.json();

        if (!isMounted) return;

        setConnectionDetails({
          ...details,
          sessionId: session.id,
        });

        // Update session with roomName, egressId, and other connection details
        if (details.egressId || details.roomName) {
          await fetch('/api/sessions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: session.id,
              egressId: details.egressId,
              roomName: details.roomName,
              serverUrl: details.serverUrl,
              participantToken: details.participantToken,
            }),
          });
        }
      } catch (err) {
        console.error('Error fetching connection details:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchConnectionDetails();

    return () => {
      isMounted = false;
    };
  }, [userId, responseId]);

  const handleLeave = () => {
    timer.stopTimer();
    const sessionId = localStorage.getItem('currentSessionId');
    if (sessionId) {
      router.push(`/survey?sessionId=${sessionId}&agentType=english_tutor`);
    } else {
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Connecting to your English tutor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 text-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Connection Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!connectionDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <SessionView
        serverUrl={connectionDetails.serverUrl}
        roomName={connectionDetails.roomName}
        participantToken={connectionDetails.participantToken}
        participantName={connectionDetails.participantName}
        onLeave={handleLeave}
        timer={timer}
      />
    </div>
  );
}

export default function EnglishTutorSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 text-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      }
    >
      <EnglishTutorSessionContent />
    </Suspense>
  );
}
