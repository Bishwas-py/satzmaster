import { useCallback, useEffect, useState } from 'react';

export const useGameStats = (userInput: string, sessionStartTime: number, errors: number, isPaused: boolean = false) => {
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [pausedTime, setPausedTime] = useState(0);
  const [lastPauseStart, setLastPauseStart] = useState<number | null>(null);

  const calculateStats = useCallback(() => {
    // If no session started yet, keep WPM at 0
    if (sessionStartTime === 0) {
      setWpm(0);
      return;
    }
    
    const now = Date.now();
    
    // Handle pause logic
    if (isPaused && lastPauseStart === null) {
      // Just started pausing
      setLastPauseStart(now);
    } else if (!isPaused && lastPauseStart !== null) {
      // Just resumed from pause
      setPausedTime(prev => prev + (now - lastPauseStart));
      setLastPauseStart(null);
    }
    
    // Calculate effective elapsed time (excluding paused time)
    const currentPauseTime = isPaused && lastPauseStart ? (now - lastPauseStart) : 0;
    const totalPausedTime = pausedTime + currentPauseTime;
    const effectiveElapsedTime = (now - sessionStartTime - totalPausedTime) / 1000 / 60; // convert to minutes
    
    const wordsTyped = userInput.trim().split(' ').filter(word => word.length > 0).length;
    const currentWpm = wordsTyped > 0 ? Math.round(wordsTyped / Math.max(effectiveElapsedTime, 0.1)) : 0;
    const totalChars = userInput.length;
    const currentAccuracy = totalChars > 0 ? Math.round(((totalChars - errors) / totalChars) * 100) : 100;
    
    setWpm(Math.max(currentWpm, 0));
    setAccuracy(Math.max(currentAccuracy, 0));
  }, [userInput, sessionStartTime, errors, isPaused, pausedTime, lastPauseStart]);

  // Reset pause tracking when session starts
  useEffect(() => {
    if (sessionStartTime > 0) {
      setPausedTime(0);
      setLastPauseStart(null);
    }
  }, [sessionStartTime]);

  // Real-time updates every second (only when not paused)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        calculateStats();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateStats, isPaused]);

  // Initial calculation and updates when dependencies change
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return { wpm, accuracy };
}; 