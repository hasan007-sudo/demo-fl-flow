'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mic } from 'lucide-react';
import { Track } from 'livekit-client';

interface TrackDeviceSelectProps {
  source: 'microphone' | 'camera' | 'screen_share';
  onSelect?: (deviceId: string) => void;
  compact?: boolean;
}

export function TrackDeviceSelect({
  source,
  onSelect,
  compact = false,
}: TrackDeviceSelectProps) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permissions first to get device labels
        await navigator.mediaDevices.getUserMedia({ audio: source === 'microphone' });

        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const kind =
          source === 'microphone'
            ? 'audioinput'
            : source === 'camera'
              ? 'videoinput'
              : 'screen_share';

        const filteredDevices = deviceList.filter(
          (device) => device.kind === kind
        );
        setDevices(filteredDevices);

        // Get the currently active device from the room
        // Only call getActiveDevice for audioinput/videoinput, not screen_share
        if (room && filteredDevices.length > 0 && (kind === 'audioinput' || kind === 'videoinput')) {
          const activeDevice = await room.getActiveDevice(kind);
          if (activeDevice) {
            setSelectedDeviceId(activeDevice);
          } else if (!selectedDeviceId) {
            setSelectedDeviceId(filteredDevices[0].deviceId);
          }
        } else if (filteredDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(filteredDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error getting devices:', error);
      }
    };

    getDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      getDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [source, room]);

  const handleDeviceChange = useCallback(
    async (deviceId: string) => {
      setSelectedDeviceId(deviceId);
      onSelect?.(deviceId);

      if (source === 'microphone' && localParticipant && room) {
        try {
          // Switch to the new audio device using LiveKit's API
          await room.switchActiveDevice('audioinput', deviceId);
          console.log('Switched to audio device:', deviceId);
        } catch (error) {
          console.error('Error switching device:', error);
        }
      }
    },
    [source, onSelect, localParticipant, room]
  );

  if (source !== 'microphone') {
    return null; // Only show microphone selector in audio-only mode
  }

  if (devices.length === 0) {
    return null; // Don't show if no devices available
  }

  return (
    <Select value={selectedDeviceId} onValueChange={handleDeviceChange}>
      <SelectTrigger
        className={compact
          ? "w-[200px] h-10 bg-slate-700/50 border-slate-600/50 hover:bg-slate-700 text-white text-xs"
          : "w-full"
        }
      >
        {compact && <Mic className="mr-2 h-4 w-4 text-slate-300" />}
        <SelectValue placeholder="Select microphone" />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-700">
        {devices.map((device) => (
          <SelectItem
            key={device.deviceId}
            value={device.deviceId}
            className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
          >
            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
