'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface MicrophonePermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissionState: 'prompt' | 'denied' | 'granted';
  onRetry?: () => void;
}

export function MicrophonePermissionDialog({
  open,
  onOpenChange,
  permissionState,
  onRetry,
}: MicrophonePermissionDialogProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return {
        browser: 'Chrome',
        steps: [
          'Click the lock icon or camera icon in the address bar',
          'Find "Microphone" in the permissions list',
          'Change it to "Allow"',
          'The page will refresh automatically',
        ],
      };
    } else if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        steps: [
          'Click the lock icon in the address bar',
          'Click "Clear This Permission"',
          'Refresh the page and allow microphone access',
        ],
      };
    } else if (userAgent.includes('safari')) {
      return {
        browser: 'Safari',
        steps: [
          'Go to Safari → Settings for This Website',
          'Change "Microphone" to "Allow"',
          'The page will refresh automatically',
        ],
      };
    } else if (userAgent.includes('edg')) {
      return {
        browser: 'Edge',
        steps: [
          'Click the lock icon in the address bar',
          'Find "Microphone" in the permissions',
          'Change it to "Allow"',
          'The page will refresh automatically',
        ],
      };
    }

    return {
      browser: 'your browser',
      steps: [
        'Click the site settings icon in the address bar',
        'Find microphone permissions',
        'Change the setting to "Allow"',
        'Refresh the page',
      ],
    };
  };

  const instructions = getBrowserInstructions();

  if (permissionState === 'denied') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <AlertCircle className="h-6 w-6" />
              <DialogTitle>Microphone Access Denied</DialogTitle>
            </div>
            <DialogDescription className="text-left space-y-3">
              <p>
                To use the voice agent, you need to enable microphone access in your browser settings.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-semibold text-foreground">
                  Instructions for {instructions.browser}:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {instructions.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefresh}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600"
            >
              I've Enabled It - Refresh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Permission prompt state
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Mic className="h-6 w-6" />
            <DialogTitle>Microphone Access Required</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3">
            <p>
              The voice agent needs access to your microphone to hear you speak.
            </p>
            <p className="text-sm text-muted-foreground">
              Click "Allow" when your browser asks for microphone permission.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600"
            >
              Request Permission
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
