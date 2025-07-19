import { useCallback, useEffect, useState } from 'react';

export const useGameStats = (userInput: string, activeTypingTime: number, errors: number) => {
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const calculateStats = useCallback(() => {
    if (activeTypingTime === 0) return;
    
    const timeElapsed = activeTypingTime / 1000 / 60; // convert ms to minutes
    const wordsTyped = userInput.trim().split(' ').filter(word => word.length > 0).length;
    const currentWpm = Math.round(wordsTyped / Math.max(timeElapsed, 0.1));
    const totalChars = userInput.length;
    const currentAccuracy = totalChars > 0 ? Math.round(((totalChars - errors) / totalChars) * 100) : 100;
    
    setWpm(currentWpm);
    setAccuracy(Math.max(currentAccuracy, 0));
  }, [userInput, activeTypingTime, errors]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return { wpm, accuracy };
}; 