import { useState, useEffect, useRef } from 'react';

// Wake Lock API support
interface WakeLockSentinel {
  release(): Promise<void>;
}

declare global {
  interface Navigator {
    wakeLock?: {
      request(type: 'screen'): Promise<WakeLockSentinel>;
    };
  }
}

export interface TimerState {
  seconds: number;
  isRunning: boolean;
  isResting: boolean;
}

export const useTimer = (initialSeconds: number = 0) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Request wake lock to keep screen active during timer
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock!.request('screen');
        console.log('Wake lock activated - screen will stay on during timer');
      }
    } catch (err) {
      console.log('Wake lock not supported or failed:', err);
    }
  };

  // Release wake lock
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake lock released');
      } catch (err) {
        console.log('Failed to release wake lock:', err);
      }
    }
  };
  const start = () => {
    console.log('Timer started');
    setIsRunning(true);
    requestWakeLock(); // Keep screen active when timer starts
  };

  const pause = () => {
    console.log('Timer paused');
    setIsRunning(false);
    releaseWakeLock(); // Allow screen to sleep when paused
  };

  const reset = (newSeconds?: number) => {
    console.log('Timer reset to:', newSeconds ?? initialSeconds);
    setSeconds(newSeconds ?? initialSeconds);
    setIsRunning(false);
    setIsResting(false);
    releaseWakeLock(); // Allow screen to sleep when reset
  };

  const startRest = (restSeconds: number) => {
    console.log('Rest timer started for', restSeconds, 'seconds');
    setSeconds(restSeconds);
    setIsResting(true);
    setIsRunning(true);
    requestWakeLock(); // Keep screen active during rest timer
  };

  useEffect(() => {
    console.log('Timer effect - isRunning:', isRunning, 'isResting:', isResting, 'seconds:', seconds);
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => {
          console.log('Timer tick - prev seconds:', prev, 'isResting:', isResting);
          if (isResting) {
            // For rest timer, count down
            if (prev <= 1) {
              console.log('Rest timer completed');
              setIsRunning(false);
              setIsResting(false);
              releaseWakeLock(); // Allow screen to sleep when rest is complete
              // Play notification sound or vibrate
              if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
              }
              // Try to show notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Rest Complete!', {
                  body: 'Time to continue your workout',
                  icon: '/icon-192.png'
                });
              }
              return 0;
            }
            return prev - 1;
          } else {
            // For workout timer, count up
            return prev + 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isResting]);

  // Clean up wake lock on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, []);

  // Handle visibility change (when app goes to background/foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        // App went to background while timer is running
        console.log('App went to background, timer continues running');
      } else if (!document.hidden && isRunning) {
        // App came back to foreground while timer is running
        console.log('App came back to foreground, timer still running');
        requestWakeLock(); // Re-request wake lock if needed
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning]);
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    seconds,
    isRunning,
    isResting,
    start,
    pause,
    reset,
    startRest,
    formatTime: () => formatTime(seconds)
  };
};