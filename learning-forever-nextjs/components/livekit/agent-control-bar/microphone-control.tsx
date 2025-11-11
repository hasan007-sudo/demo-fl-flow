'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { BarVisualizer } from '@livekit/components-react';
import { Mic, MicOff, ChevronDown, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

export function MicrophoneControl() {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [isEnabled, setIsEnabled] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
    const newState = !isEnabled;
    setIsEnabled(newState);
    await localParticipant.setMicrophoneEnabled(newState);
  }, [localParticipant, isEnabled]);

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

  const selectedDevice = devices.find((d) => d.deviceId === selectedDeviceId);

  return (
    <div className="relative flex items-center gap-3">
      {/* Sound wave lines for user speaking */}
      {(
        <div className="flex items-center gap-1 px-2">
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
          className={cn(
            "relative h-12 w-12 flex items-center justify-center transition-all duration-200",
            isEnabled
              ? "bg-emerald-500/20 hover:bg-emerald-500/30"
              : "bg-gray-100 hover:bg-gray-200"
          )}
        >
          {isEnabled ? (
            <Mic className="h-5 w-5 text-emerald-600 relative z-10" />
          ) : (
            <MicOff className="h-5 w-5 text-red-600" />
          )}
        </button>

      {/* Divider */}
      <div className="h-8 w-px bg-gray-300" />

      {/* Right: Dropdown Button */}
      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            className="h-12 px-3 flex items-center gap-2 hover:bg-gray-100 transition-colors text-gray-900 text-sm"
          >
            <span className="max-w-[140px] truncate">
              {selectedDevice?.label || 'Select microphone'}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-600" />
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
    </div>
  );
}
