'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Eye, EyeOff, Clock, Zap, Target, BookOpen } from 'lucide-react';

// German sentences organized by patterns and difficulty
const germanTexts = {
  beginner: [
    {
      text: "Ich bin müde heute",
      translation: "I am tired today",
      pattern: "Subject + Verb + Adjective + Time",
      explanation: "Basic sentence structure: Ich (I) + bin (am) + müde (tired) + heute (today)"
    },
    {
      text: "Das Haus ist groß",
      translation: "The house is big", 
      pattern: "Article + Noun + Verb + Adjective",
      explanation: "Der/Die/Das + Noun + ist/sind + Adjective is a fundamental German pattern"
    },
    {
      text: "Ich trinke Kaffee am Morgen",
      translation: "I drink coffee in the morning",
      pattern: "Subject + Verb + Object + Time phrase",
      explanation: "Notice 'am Morgen' (in the morning) - German uses 'am' with time periods"
    },
    {
      text: "Die Katze schläft auf dem Sofa",
      translation: "The cat sleeps on the sofa",
      pattern: "Article + Noun + Verb + Preposition + Dative",
      explanation: "auf + dem (dative) - prepositions change the case of nouns in German"
    }
  ],
  intermediate: [
    {
      text: "Ich habe gestern ein Buch gelesen",
      translation: "I read a book yesterday",
      pattern: "Perfect tense: haben/sein + past participle",
      explanation: "German perfect tense: habe (helper) + gelesen (past participle) at the end"
    },
    {
      text: "Weil es regnet, bleibe ich zu Hause",
      translation: "Because it's raining, I stay at home",
      pattern: "Subordinate clause + main clause",
      explanation: "'Weil' sends the verb to the end. Notice comma before main clause."
    },
    {
      text: "Der Mann, den ich gesehen habe, ist mein Lehrer",
      translation: "The man whom I saw is my teacher",
      pattern: "Relative clause with accusative",
      explanation: "'den' is accusative because the man is the object of 'gesehen habe'"
    }
  ],
  advanced: [
    {
      text: "Hätte ich mehr Zeit gehabt, wäre ich nach Deutschland gefahren",
      translation: "If I had had more time, I would have gone to Germany",
      pattern: "Subjunctive II - unreal conditional",
      explanation: "Hätte + past participle, wäre + past participle - expressing unreal past situations"
    },
    {
      text: "Nachdem er das Studium abgeschlossen hatte, begann er zu arbeiten",
      translation: "After he had finished his studies, he began to work",
      pattern: "Plusquamperfekt + simple past",
      explanation: "'Nachdem' with plusquamperfekt (had + past participle) for completed past actions"
    }
  ]
};

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export const GermanWordGame = () => {
  const [gameState, setGameState] = useState<'menu' | 'typing' | 'result'>('menu');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showPattern, setShowPattern] = useState(true);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentText = germanTexts[difficulty][currentTextIndex];
  const targetWords = currentText.text.split(' ');
  const typedWords = userInput.split(' ');

  const startTyping = (selectedDifficulty: DifficultyLevel) => {
    setDifficulty(selectedDifficulty);
    setGameState('typing');
    setCurrentTextIndex(0);
    setUserInput('');
    setCurrentWordIndex(0);
    setErrors(0);
    setStartTime(Date.now());
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

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

  const handleInputChange = (value: string) => {
    setUserInput(value);
    
    // Track errors in real-time
    const targetText = currentText.text;
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== targetText[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);

    // Check if finished
    if (value === targetText) {
      setIsFinished(true);
      setTimeout(() => {
        if (currentTextIndex + 1 < germanTexts[difficulty].length) {
          // Next sentence
          setCurrentTextIndex(prev => prev + 1);
          setUserInput('');
          setCurrentWordIndex(0);
          setIsFinished(false);
          setErrors(0);
          inputRef.current?.focus();
        } else {
          // All sentences completed
          setGameState('result');
        }
      }, 1500);
    }

    // Update current word index
    const words = value.split(' ');
    setCurrentWordIndex(Math.min(words.length - 1, targetWords.length - 1));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowMeaning(!showMeaning);
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
    inputRef.current?.focus();
  };

  const nextSentence = () => {
    if (currentTextIndex + 1 < germanTexts[difficulty].length) {
      setCurrentTextIndex(prev => prev + 1);
      resetCurrentSentence();
    }
  };

  const resetGame = () => {
    setGameState('menu');
  };

  // Render word with correct/incorrect styling
  const renderWord = (word: string, index: number) => {
    const typedWord = typedWords[index] || '';
    const isCurrentWord = index === currentWordIndex;
    const isCompleted = index < typedWords.length - 1;
    const isCorrect = typedWord === word;
    
    let className = 'mx-1 ';
    
    if (isCurrentWord) {
      className += 'bg-yellow-200 text-gray-900 ';
    } else if (isCompleted) {
      className += isCorrect ? 'text-green-800 bg-green-100 ' : 'text-red-800 bg-red-100 ';
    } else {
      className += 'text-gray-800 ';
    }
    
    return (
      <span key={index} className={className + 'px-1 py-0.5 rounded'}>
        {word}
      </span>
    );
  };

  // Menu Screen
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 font-mono">
        <div className="bg-white border border-gray-300 max-w-2xl w-full p-12 shadow-sm">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              German Typer
            </h1>
            <div className="w-20 h-0.5 bg-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm uppercase tracking-wide">
              Learn German through typing
            </p>
          </div>
          
          <div className="space-y-8 mb-12">
            <div className="border-l-2 border-gray-900 pl-6">
              <h3 className="font-semibold mb-3 text-gray-900">Choose Your Level</h3>
              <div className="space-y-4">
                <button
                  onClick={() => startTyping('beginner')}
                  className="w-full text-left p-4 border border-gray-300 hover:border-gray-600 transition-colors"
                >
                  <div className="font-semibold text-gray-900">Anfänger (Beginner)</div>
                  <div className="text-sm text-gray-700 mt-1">
                    Basic sentence patterns, present tense, simple vocabulary
                  </div>
                </button>
                
                <button
                  onClick={() => startTyping('intermediate')}
                  className="w-full text-left p-4 border border-gray-300 hover:border-gray-600 transition-colors"
                >
                  <div className="font-semibold text-gray-900">Mittelstufe (Intermediate)</div>
                  <div className="text-sm text-gray-700 mt-1">
                    Past tense, subordinate clauses, relative pronouns
                  </div>
                </button>
                
                <button
                  onClick={() => startTyping('advanced')}
                  className="w-full text-left p-4 border border-gray-300 hover:border-gray-600 transition-colors"
                >
                  <div className="font-semibold text-gray-900">Fortgeschritten (Advanced)</div>
                  <div className="text-sm text-gray-700 mt-1">
                    Subjunctive, complex grammar, advanced structures
                  </div>
                </button>
              </div>
            </div>

            <div className="border-l-2 border-gray-900 pl-6">
              <h3 className="font-semibold mb-3 text-gray-900">Controls</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><kbd className="bg-gray-200 px-2 py-1 text-xs font-mono text-gray-900">Esc</kbd> Toggle meaning/explanation</p>
                <p><kbd className="bg-gray-200 px-2 py-1 text-xs font-mono text-gray-900">Ctrl+R</kbd> Reset current sentence</p>
                <p><kbd className="bg-gray-200 px-2 py-1 text-xs font-mono text-gray-900">Tab</kbd> Next sentence</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result Screen
  if (gameState === 'result') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 font-mono">
        <div className="bg-white border border-gray-300 max-w-lg w-full p-12 shadow-sm">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Completed!</h1>
            <div className="w-16 h-0.5 bg-gray-900 mx-auto mb-8"></div>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{wpm}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">WPM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{accuracy}%</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{germanTexts[difficulty].length}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">Sentences</div>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm mb-8">
              {accuracy >= 95 ? 'Perfekt! Perfect German typing!' : 
               accuracy >= 85 ? 'Sehr gut! Very good work!' : 
               'Gut gemacht! Keep practicing!'}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={resetGame}
              className="w-full bg-gray-900 text-white py-4 text-sm font-semibold tracking-wide uppercase hover:bg-gray-800 transition-colors"
            >
              Try Different Level
            </button>
            <button
              onClick={() => startTyping(difficulty)}
              className="w-full bg-gray-200 text-gray-700 py-4 text-sm font-semibold tracking-wide uppercase hover:bg-gray-300 transition-colors"
            >
              Practice Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Typing Interface
  return (
    <div className="min-h-screen bg-gray-50 p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Stats Header */}
        <div className="bg-white border border-gray-300 p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1 text-gray-700" />
                <span className="text-gray-700 mr-2">WPM:</span>
                <span className="font-bold text-gray-900">{wpm}</span>
              </div>
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-1 text-gray-700" />
                <span className="text-gray-700 mr-2">Accuracy:</span>
                <span className="font-bold text-gray-900">{accuracy}%</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1 text-gray-700" />
                <span className="text-gray-700 mr-2">Progress:</span>
                <span className="font-bold text-gray-900">{currentTextIndex + 1}/{germanTexts[difficulty].length}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMeaning(!showMeaning)}
                className="text-gray-700 hover:text-gray-900 transition-colors"
                title="Toggle meaning"
              >
                {showMeaning ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={resetCurrentSentence}
                className="text-gray-700 hover:text-gray-900 transition-colors"
                title="Reset sentence"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Learning Panel */}
        {showMeaning && (
          <div className="bg-white border border-gray-300 p-6 mb-4 shadow-sm">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Meaning</h3>
                <p className="text-gray-800">{currentText.translation}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pattern</h3>
                <p className="text-sm text-gray-700 mb-2">{currentText.pattern}</p>
                <p className="text-xs text-gray-600">{currentText.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Typing Area */}
        <div className="bg-white border border-gray-300 p-8 shadow-sm">
          {/* Text Display */}
          <div className="text-3xl leading-relaxed mb-8 p-6 bg-gray-50 rounded min-h-[120px] flex items-center">
            <div className="w-full">
              {targetWords.map((word, index) => renderWord(word, index))}
            </div>
          </div>

          {/* Input Area */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Start typing the German text above..."
              className="w-full text-2xl p-4 border-2 border-gray-300 focus:border-gray-500 focus:outline-none bg-white font-mono"
              disabled={isFinished}
              autoFocus
            />
            
            {isFinished && (
              <div className="absolute inset-0 bg-green-50 border-2 border-green-400 rounded flex items-center justify-center">
                <span className="text-green-700 font-bold">Perfect! ✓</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <div>
              <span>Press Esc to toggle explanations</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Sentence {currentTextIndex + 1} of {germanTexts[difficulty].length}</span>
              {currentTextIndex + 1 < germanTexts[difficulty].length && (
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
    </div>
  );
}; 