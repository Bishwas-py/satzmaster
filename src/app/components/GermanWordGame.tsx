'use client';

import React, { useState, useRef } from 'react';
import { GameMode, DifficultyLevel } from '../types';
import { germanTexts, sentenceBuilderChallenges } from '../data/germanTexts';
import { useGameStats } from '../hooks/useGameStats';
import { MenuScreen } from './MenuScreen';
import { StatsHeader } from './StatsHeader';
import { TypingMode } from './TypingMode';
import { SentenceBuilderMode } from './SentenceBuilderMode';
import { ResultScreen } from './ResultScreen';

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
  const [isFinished, setIsFinished] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { wpm, accuracy } = useGameStats(userInput, startTime, errors);

  const currentText = gameMode === 'typing' 
    ? germanTexts[difficulty][currentTextIndex]
    : null;
  
  const currentChallenge = gameMode === 'builder' 
    ? sentenceBuilderChallenges[difficulty][currentTextIndex] 
    : null;

  const targetWords = currentText ? currentText.text.split(' ') : [];
  const typedWords = userInput.split(' ');

  const startGame = (selectedDifficulty: DifficultyLevel, mode: 'typing' | 'builder') => {
    setDifficulty(selectedDifficulty);
    setGameMode(mode);
    setGameState(mode);
    setCurrentTextIndex(0);
    setUserInput('');
    setCurrentWordIndex(0);
    setErrors(0);
    setStartTime(Date.now());
    setIsFinished(false);
    setIsCorrect(null);
    setShowHints(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const checkSentenceBuilder = (input: string) => {
    if (!currentChallenge) return false;
    
    const normalizedInput = input.trim().toLowerCase();
    const hasAllKeyWords = currentChallenge.keyWords.every(word => 
      normalizedInput.includes(word.toLowerCase())
    );
    
    if (!hasAllKeyWords) return false;
    
    return currentChallenge.possibleAnswers.some(answer => 
      normalizedInput === answer.toLowerCase()
    );
  };

  const handleInputChange = (value: string) => {
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
        setTimeout(() => {
          const maxIndex = germanTexts[difficulty].length;
          if (currentTextIndex + 1 < maxIndex) {
            setCurrentTextIndex(prev => prev + 1);
            setUserInput('');
            setCurrentWordIndex(0);
            setIsFinished(false);
            setErrors(0);
            inputRef.current?.focus();
          } else {
            setGameState('result');
          }
        }, 1500);
      }

      const words = value.split(' ');
      setCurrentWordIndex(Math.min(words.length - 1, targetWords.length - 1));
    }
  };

  const handleBuilderSubmit = () => {
    if (!currentChallenge) return;
    
    const correct = checkSentenceBuilder(userInput);
    setIsCorrect(correct);
    
    if (correct) {
      setIsFinished(true);
      setTimeout(() => {
        const maxIndex = sentenceBuilderChallenges[difficulty].length;
        if (currentTextIndex + 1 < maxIndex) {
          setCurrentTextIndex(prev => prev + 1);
          setUserInput('');
          setIsFinished(false);
          setIsCorrect(null);
          setShowHints(false);
          inputRef.current?.focus();
        } else {
          setGameState('result');
        }
      }, 2000);
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
      if (isCorrect === false) {
        setIsCorrect(null);
        setUserInput('');
        inputRef.current?.focus();
      } else {
        handleBuilderSubmit();
      }
    }
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      resetCurrentSentence();
    }
  };

  const resetCurrentSentence = () => {
    setUserInput('');
    setCurrentWordIndex(0);
    setErrors(0);
    setIsFinished(false);
    setIsCorrect(null);
    setShowHints(false);
    inputRef.current?.focus();
  };

  const nextSentence = () => {
    const maxIndex = gameMode === 'typing' 
      ? germanTexts[difficulty].length 
      : sentenceBuilderChallenges[difficulty].length;
    
    if (currentTextIndex + 1 < maxIndex) {
      setCurrentTextIndex(prev => prev + 1);
      resetCurrentSentence();
    }
  };

  const resetGame = () => {
    setGameState('menu');
  };

  // Menu Screen
  if (gameState === 'menu') {
    return <MenuScreen onStartGame={startGame} />;
  }

  // Result Screen
  if (gameState === 'result') {
    const totalChallenges = gameMode === 'typing' 
      ? germanTexts[difficulty].length 
      : sentenceBuilderChallenges[difficulty].length;

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

  const maxIndex = gameMode === 'typing' 
    ? germanTexts[difficulty].length 
    : sentenceBuilderChallenges[difficulty].length;

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
          />
        )}

        {/* Controls */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600 bg-white border border-gray-300 p-4 shadow-sm">
          <div>
            <span>Press Esc to toggle {gameMode === 'typing' ? 'explanations' : 'hints'}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Challenge {currentTextIndex + 1} of {maxIndex}</span>
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