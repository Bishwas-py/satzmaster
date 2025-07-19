import { useCallback, useEffect, useState } from 'react';

export const useGameStats = (userInput: string, sessionStartTime: number, errors: number) => {
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const calculateStats = useCallback(() => {
    // If no session started yet, keep WPM at 0
    if (sessionStartTime === 0) {
      setWpm(0);
      return;
    }
    
    const now = Date.now();
    const timeElapsed = (now - sessionStartTime) / 1000 / 60; // convert ms to minutes
    
    const wordsTyped = userInput.trim().split(' ').filter(word => word.length > 0).length;
    const currentWpm = wordsTyped > 0 ? Math.round(wordsTyped / Math.max(timeElapsed, 0.1)) : 0;
    const totalChars = userInput.length;
    const currentAccuracy = totalChars > 0 ? Math.round(((totalChars - errors) / totalChars) * 100) : 100;
    
    setWpm(Math.max(currentWpm, 0));
    setAccuracy(Math.max(currentAccuracy, 0));
  }, [userInput, sessionStartTime, errors]);

  // Real-time updates every second
  useEffect(() => {
    const interval = setInterval(() => {
      calculateStats();
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateStats]);

  // Initial calculation and updates when dependencies change
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return { wpm, accuracy };
}; 