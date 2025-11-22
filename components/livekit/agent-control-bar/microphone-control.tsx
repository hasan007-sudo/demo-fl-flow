'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { BarVisualizer } from '@livekit/components-react';
import { Mic, MicOff, ChevronDown, Check, Loader2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import { MicrophonePermissionDialog } from './microphone-permission-dialog';

export function MicrophoneControl() {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [isEnabled, setIsEnabled] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Permission management state
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const prevPermissionStateRef = useRef<'prompt' | 'granted' | 'denied' | 'checking'>('checking');

  // Use LiveKit's built-in speaking detection
  useEffect(() => {
    if (!localParticipant) {
      setIsSpeaking(false);
      return;
    }

    const handleSpeakingChanged = (speaking: boolean) => {
      // Only show speaking indicator when mic is enabled
      setIsSpeaking(speaking && isEnabled);
    };

    // Subscribe to LiveKit's speaking events
    localParticipant.on('isSpeakingChanged', handleSpeakingChanged);

    return () => {
      localParticipant.off('isSpeakingChanged', handleSpeakingChanged);
    };
  }, [localParticipant, isEnabled]);

  // Proactive permission check on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        setIsLoading(true);

        // Check if Permissions API is supported
        if ('permissions' in navigator && navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissionState(result.state as 'prompt' | 'granted' | 'denied');

          // Show dialog if permission is denied or prompt
          if (result.state === 'denied' || result.state === 'prompt') {
            setIsDialogOpen(true);
          }

          // Listen for permission changes
          result.addEventListener('change', () => {
            const newState = result.state as 'prompt' | 'granted' | 'denied';
            setPermissionState(newState);
          });
        } else if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          // Fallback: Try to request permission directly
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setPermissionState('granted');
          } catch (error) {
            if (error instanceof Error && error.name === 'NotAllowedError') {
              setPermissionState('denied');
              setIsDialogOpen(true);
            } else {
              setPermissionState('prompt');
              setIsDialogOpen(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking microphone permission:', error);
        setPermissionState('prompt');
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, []);

  // Auto-refresh when permission changes from denied/prompt to granted
  useEffect(() => {
    const prevState = prevPermissionStateRef.current;

    // Only refresh if permission was explicitly denied or prompt, and now becomes granted
    // Don't refresh if it was just 'checking' (initial state)
    if ((prevState === 'denied' || prevState === 'prompt') && permissionState === 'granted') {
      // Permission was just granted by user, refresh the page
      window.location.reload();
    }

    // Update the ref with current state
    prevPermissionStateRef.current = permissionState;
  }, [permissionState]);

  // Get available devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = deviceList.filter((device) => device.kind === 'audioinput');
        setDevices(audioDevices);

        if (room && audioDevices.length > 0) {
          const activeDevice = await room.getActiveDevice('audioinput');
          if (activeDevice) {
            setSelectedDeviceId(activeDevice);
          } else if (!selectedDeviceId) {
            setSelectedDeviceId(audioDevices[0].deviceId);
          }
        }
      } catch (error) {
        console.error('Error getting devices:', error);
      }
    };

    getDevices();

    const handleDeviceChange = () => {
      getDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [room]);

  // Handle microphone toggle
  const handleToggle = useCallback(async () => {
    if (!localParticipant) return;

    // Check permission state before toggling
    if (permissionState === 'denied') {
      setIsDialogOpen(true);
      return;
    }

    const newState = !isEnabled;
    setIsLoading(true);

    try {
      setIsEnabled(newState);
      await localParticipant.setMicrophoneEnabled(newState);
    } catch (error) {
      console.error('Error toggling microphone:', error);

      // Revert state on error
      setIsEnabled(!newState);

      // Handle permission errors
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setPermissionState('denied');
        setIsDialogOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [localParticipant, isEnabled, permissionState]);

  // Handle device change
  const handleDeviceChange = useCallback(
    async (deviceId: string) => {
      setSelectedDeviceId(deviceId);
      if (room) {
        try {
          await room.switchActiveDevice('audioinput', deviceId);
          console.log('Switched to audio device:', deviceId);
        } catch (error) {
          console.error('Error switching device:', error);
        }
      }
      setIsOpen(false);
    },
    [room]
  );

  // Handle retry permission request
  const handleRetryPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionState('granted');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Permission request failed:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setPermissionState('denied');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectedDevice = devices.find((d) => d.deviceId === selectedDeviceId);

  return (
    <div className="relative flex items-center gap-1.5 sm:gap-3">
      {/* Sound wave lines for user speaking */}
      {(
        <div className="hidden sm:flex items-center gap-1 px-2">
          <div
            className="w-1 bg-emerald-500 rounded-full transition-all duration-100"
            style={{
              height: isSpeaking ? '16px' : '4px',
              opacity: isSpeaking ? 1 : 0.4,
              animation: isSpeaking ? 'soundWave1 0.6s ease-in-out infinite' : 'none',
              transformOrigin: 'center'
            }}
          />
          <div
            className="w-1 bg-emerald-500 rounded-full transition-all duration-100"
            style={{
              height: isSpeaking ? '24px' : '4px',
              opacity: isSpeaking ? 1 : 0.4,
              animation: isSpeaking ? 'soundWave2 0.6s ease-in-out infinite' : 'none',
              transformOrigin: 'center'
            }}
          />
          <div
            className="w-1 bg-emerald-500 rounded-full transition-all duration-100"
            style={{
              height: isSpeaking ? '20px' : '4px',
              opacity: isSpeaking ? 1 : 0.4,
              animation: isSpeaking ? 'soundWave3 0.6s ease-in-out infinite' : 'none',
              transformOrigin: 'center'
            }}
          />
        </div>
      )}

      <div className="flex items-center rounded-full overflow-hidden border-2 border-gray-300 bg-gray-50">
        {/* Left: Toggle Button */}
        <button
          onClick={handleToggle}
          disabled={isLoading || permissionState === 'denied' || permissionState === 'checking'}
          className={cn(
            "relative h-9 w-9 sm:h-12 sm:w-12 flex items-center justify-center transition-all duration-200",
            isEnabled
              ? "bg-emerald-500/20 hover:bg-emerald-500/30"
              : "bg-gray-100 hover:bg-gray-200",
            (isLoading || permissionState === 'denied' || permissionState === 'checking') &&
              "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 animate-spin" />
          ) : isEnabled ? (
            <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 relative z-10" />
          ) : (
            <MicOff className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
          )}
        </button>

      {/* Divider */}
      <div className="h-6 sm:h-8 w-px bg-gray-300" />

      {/* Right: Dropdown Button */}
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            disabled={isLoading || permissionState !== 'granted'}
            className={cn(
              "h-9 sm:h-12 px-2 sm:px-3 flex items-center gap-1 sm:gap-2 hover:bg-gray-100 transition-colors text-gray-900 text-xs sm:text-sm",
              (isLoading || permissionState !== 'granted') && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="max-w-[80px] sm:max-w-[140px] truncate">
              {selectedDevice?.label || 'Select'}
            </span>
            <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[240px] bg-white border-2 border-gray-200 rounded-lg p-2 shadow-xl z-50"
            sideOffset={5}
          >
            {devices.map((device) => (
              <DropdownMenu.Item
                key={device.deviceId}
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-900 rounded cursor-pointer outline-none hover:bg-gray-100 focus:bg-gray-100"
                onSelect={() => handleDeviceChange(device.deviceId)}
              >
                <span className="truncate">
                  {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                </span>
                {device.deviceId === selectedDeviceId && (
                  <Check className="h-4 w-4 text-emerald-600 ml-2 flex-shrink-0" />
                )}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      </div>

      {/* Microphone Permission Dialog */}
      <MicrophonePermissionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        permissionState={permissionState}
        onRetry={handleRetryPermission}
      />
    </div>
  );
}
