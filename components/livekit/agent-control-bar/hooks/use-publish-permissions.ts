import { useMemo } from 'react';

export function usePublishPermissions() {
  return useMemo(() => {
    // For now, assume full permissions
    const canPublish = true;
    const canPublishAudio = true;

    return {
      canPublish,
      canPublishAudio,
    };
  }, []);
}
