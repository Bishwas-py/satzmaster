import { useCallback, useEffect, useState } from 'react';

export const useGameStats = (userInput: string, startTime: number, errors: number) => {
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const calculateStats = useCallback(() => {
    if (startTime === 0) return;
    
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
    const wordsTyped = userInput.trim().split(' ').filter(word => word.length > 0).length;
    const currentWpm = Math.round(wordsTyped / Math.max(timeElapsed, 0.1));
    const totalChars = userInput.length;
    const currentAccuracy = totalChars > 0 ? Math.round(((totalChars - errors) / totalChars) * 100) : 100;
    
    setWpm(currentWpm);
    setAccuracy(Math.max(currentAccuracy, 0));
  }, [userInput, startTime, errors]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return { wpm, accuracy };
}; 