'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GameMode, DifficultyLevel } from '../types';
import { germanTexts, sentenceBuilderChallenges } from '../data/germanTexts';
import { useGameStats } from '../hooks/useGameStats';
import { MenuScreen } from './MenuScreen';
import { StatsHeader } from './StatsHeader';
import { TypingMode } from './TypingMode';
import { SentenceBuilderMode } from './SentenceBuilderMode';
import { ResultScreen } from './ResultScreen';

// Fisher-Yates shuffle algorithm for true randomization
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const GermanWordGame = () => {
  const [gameState, setGameState] = useState<GameMode>('menu');
  const [gameMode, setGameMode] = useState<'typing' | 'builder'>('typing');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [activeTypingTime, setActiveTypingTime] = useState<number>(0);
  const [lastTypingTime, setLastTypingTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledTexts, setShuffledTexts] = useState<any[]>([]);
  const [shuffledChallenges, setShuffledChallenges] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [completionTimeoutId, setCompletionTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { wpm, accuracy } = useGameStats(userInput, activeTypingTime, errors);

  // Initialize shuffled content when difficulty or mode changes
  useEffect(() => {
    if (gameMode === 'typing') {
      const originalTexts = germanTexts[difficulty];
      setShuffledTexts(shuffleArray(originalTexts));
    } else {
      const originalChallenges = sentenceBuilderChallenges[difficulty];
      setShuffledChallenges(shuffleArray(originalChallenges));
    }
  }, [difficulty, gameMode]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Only handle global shortcuts when in game (not menu or result)
      if (gameState !== 'typing' && gameState !== 'builder') return;

      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        resetCurrentSentence();
      }
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        nextSentence();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (gameMode === 'typing') {
          setShowMeaning(!showMeaning);
        } else {
          setShowHints(!showHints);
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  }, [gameState, gameMode, showMeaning, showHints]); // Dependencies for the shortcuts

  const currentText = gameMode === 'typing' && shuffledTexts.length > 0
    ? shuffledTexts[currentTextIndex]
    : null;

  const currentChallenge = gameMode === 'builder' && shuffledChallenges.length > 0
    ? shuffledChallenges[currentTextIndex]
    : null;

  const targetWords = currentText ? currentText.text.split(' ') : [];
  const typedWords = userInput.split(' ');

  // Adaptive difficulty suggestion based on performance
  const suggestDifficulty = (): DifficultyLevel => {
    if (accuracy >= 95 && wpm >= 30 && completedCount >= 5) {
      if (difficulty === 'beginner') return 'intermediate';
      if (difficulty === 'intermediate') return 'advanced';
    }
    return difficulty;
  };

  const startGame = (selectedDifficulty: DifficultyLevel, mode: 'typing' | 'builder') => {
    setDifficulty(selectedDifficulty);
    setGameMode(mode);
    setGameState(mode);
    setCurrentTextIndex(0);
    setUserInput('');
    setCurrentWordIndex(0);
    setErrors(0);
    setStartTime(Date.now());
    setActiveTypingTime(0);
    setLastTypingTime(Date.now());
    setIsFinished(false);
    setIsCorrect(null);
    setShowHints(false);
    setCompletedCount(0);

    // Shuffle content immediately when starting
    if (mode === 'typing') {
      setShuffledTexts(shuffleArray(germanTexts[selectedDifficulty]));
    } else {
      setShuffledChallenges(shuffleArray(sentenceBuilderChallenges[selectedDifficulty]));
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const checkSentenceBuilder = (input: string) => {
    if (!currentChallenge) return false;

    // Normalize input: trim, lowercase, and normalize spaces
    const normalizedInput = input.trim().toLowerCase().replace(/\s+/g, ' ');

    // Instead of checking for exact key words, just check against possible answers
    // This is better because German words have different forms (rennen -> rennt)
    const isExactMatch = currentChallenge.possibleAnswers.some((answer: { german: string; english: string }) => {
      const normalizedAnswer = answer.german.toLowerCase().trim().replace(/\s+/g, ' ');
      return normalizedInput === normalizedAnswer;
    });

    return isExactMatch;
  };

  const getNextChallenge = () => {
    const maxIndex = gameMode === 'typing' ? shuffledTexts.length : shuffledChallenges.length;

    if (currentTextIndex + 1 < maxIndex) {
      // Continue with next item in shuffled list
      setCurrentTextIndex(prev => prev + 1);
      return true;
    } else {
      // Completed all items, suggest difficulty progression or end session
      const suggestedDifficulty = suggestDifficulty();
      if (suggestedDifficulty !== difficulty && completedCount >= 8) {
        // Could show a modal here suggesting level up
        console.log(`Consider advancing to ${suggestedDifficulty}!`);
      }
      return false;
    }
  };

  const handleInputFocus = () => {
    // Reset timing when user focuses back to input (e.g., after a pause)
    setLastTypingTime(Date.now());
  };

  const handleInputChange = (value: string) => {
    // Update active typing time (only when actually typing)
    const now = Date.now();
    if (!isFinished) {
      setActiveTypingTime(prev => prev + (now - lastTypingTime));
    }
    setLastTypingTime(now);

    setUserInput(value);

    if (gameMode === 'typing') {
      const targetText = currentText!.text;
      let errorCount = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== targetText[i]) {
          errorCount++;
        }
      }
      setErrors(errorCount);

      if (value === targetText) {
        setIsFinished(true);
        setCompletedCount(prev => prev + 1);
        setTimeout(() => {
          if (getNextChallenge()) {
            setUserInput('');
            setCurrentWordIndex(0);
            setIsFinished(false);
            setErrors(0);
            // Reset timing for next sentence
            setActiveTypingTime(0);
            setLastTypingTime(Date.now());
            // Improved auto-focus with longer timeout
            setTimeout(() => inputRef.current?.focus(), 150);
          } else {
            setGameState('result');
          }
        }, 1500);
      }

      const words = value.split(' ');
      setCurrentWordIndex(Math.min(words.length - 1, targetWords.length - 1));
    }
  };

  const proceedToNextChallenge = () => {
    if (completionTimeoutId) {
      clearTimeout(completionTimeoutId);
      setCompletionTimeoutId(null);
    }

    if (getNextChallenge()) {
      setUserInput('');
      setIsFinished(false);
      setIsCorrect(null);
      setShowHints(false);
      // Reset timing for next challenge
      setActiveTypingTime(0);
      setLastTypingTime(Date.now());
      // Auto-focus the input for the next challenge
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setGameState('result');
    }
  };

  const handleBuilderSubmit = () => {
    if (!currentChallenge) return;

    const correct = checkSentenceBuilder(userInput);
    setIsCorrect(correct);

    if (correct) {
      setIsFinished(true);
      setCompletedCount(prev => prev + 1);
      const timeoutId = setTimeout(() => {
        proceedToNextChallenge();
      }, 5000);
      setCompletionTimeoutId(timeoutId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (gameMode === 'typing') {
        setShowMeaning(!showMeaning);
      } else {
        setShowHints(!showHints);
      }
    }
    if (e.key === 'Enter' && gameMode === 'builder') {
      e.preventDefault();
      if (isFinished) {
        // Skip the completion display and proceed to next challenge
        proceedToNextChallenge();
      } else if (isCorrect === false) {
        setIsCorrect(null);
        setUserInput('');
        inputRef.current?.focus();
      } else {
        handleBuilderSubmit();
      }
    }
  };

  const resetCurrentSentence = () => {
    if (completionTimeoutId) {
      clearTimeout(completionTimeoutId);
      setCompletionTimeoutId(null);
    }
    setUserInput('');
    setCurrentWordIndex(0);
    setErrors(0);
    setIsFinished(false);
    setIsCorrect(null);
    setShowHints(false);
    // Reset timing
    setActiveTypingTime(0);
    setLastTypingTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const nextSentence = () => {
    if (getNextChallenge()) {
      resetCurrentSentence();
    }
  };

  const resetGame = () => {
    if (completionTimeoutId) {
      clearTimeout(completionTimeoutId);
      setCompletionTimeoutId(null);
    }
    setGameState('menu');
    setCompletedCount(0);
  };

  // Reshuffle current difficulty content
  const reshuffleContent = () => {
    if (gameMode === 'typing') {
      setShuffledTexts(shuffleArray(germanTexts[difficulty]));
    } else {
      setShuffledChallenges(shuffleArray(sentenceBuilderChallenges[difficulty]));
    }
    setCurrentTextIndex(0);
    resetCurrentSentence();
  };

  // Menu Screen
  if (gameState === 'menu') {
    return <MenuScreen onStartGame={startGame} />;
  }

  // Result Screen
  if (gameState === 'result') {
    const totalChallenges = completedCount;
    const suggestedDifficulty = suggestDifficulty();

    return (
      <ResultScreen
        wpm={wpm}
        accuracy={accuracy}
        totalChallenges={totalChallenges}
        gameMode={gameMode}
        difficulty={difficulty}
        onRestart={() => startGame(difficulty, gameMode)}
        onBackToMenu={resetGame}
      />
    );
  }

  const maxIndex = gameMode === 'typing' ? shuffledTexts.length : shuffledChallenges.length;

  // Main Game Interface
  return (
    <div className="min-h-screen bg-gray-50 p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        <StatsHeader
          wpm={wpm}
          accuracy={accuracy}
          currentIndex={currentTextIndex}
          maxIndex={maxIndex}
          gameMode={gameMode}
          showHelp={gameMode === 'typing' ? showMeaning : showHints}
          onToggleHelp={() => gameMode === 'typing' ? setShowMeaning(!showMeaning) : setShowHints(!showHints)}
          onReset={resetCurrentSentence}
          onHome={resetGame}
        />

        {gameMode === 'typing' && currentText && (
          <TypingMode
            currentText={currentText}
            userInput={userInput}
            typedWords={typedWords}
            targetWords={targetWords}
            currentWordIndex={currentWordIndex}
            isFinished={isFinished}
            showMeaning={showMeaning}
            onInputChange={handleInputChange}
            onKeyPress={handleKeyPress}
            inputRef={inputRef}
          />
        )}

        {gameMode === 'builder' && currentChallenge && (
          <SentenceBuilderMode
            currentChallenge={currentChallenge}
            userInput={userInput}
            isFinished={isFinished}
            isCorrect={isCorrect}
            showHints={showHints}
            onInputChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onSubmit={handleBuilderSubmit}
            inputRef={inputRef}
            onInputFocus={handleInputFocus}
          />
        )}

        {/* Enhanced Controls */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600 bg-white border border-gray-300 p-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <span>Press Esc to toggle {gameMode === 'typing' ? 'explanations' : 'hints'}</span>
            <span>Ctrl+R to restart</span>
            <span>Ctrl+N for next</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Completed: {completedCount}</span>
            <span>Current: {currentTextIndex + 1}/{maxIndex}</span>
            {currentTextIndex + 1 < maxIndex && (
              <button
                onClick={nextSentence}
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Skip →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 