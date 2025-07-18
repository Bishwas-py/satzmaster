'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Eye, EyeOff, Clock, Zap, Target, BookOpen, Lightbulb } from 'lucide-react';

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

// Sentence building challenges - give key words, expect complete sentences
const sentenceBuilderChallenges = {
  beginner: [
    {
      keyWords: ["Hund", "rennen", "Park"],
      possibleAnswers: [
        "Der Hund rennt im Park",
        "Ein Hund rennt im Park",
        "Mein Hund rennt im Park",
        "Der kleine Hund rennt im Park"
      ],
      hints: [
        "Use 'der/ein/mein' before Hund",
        "Park needs 'im' (in + dem)",
        "Verb comes second in German"
      ],
      pattern: "Article + Noun + Verb + Preposition + Location",
      explanation: "Basic sentence with movement. 'im Park' = 'in the park' (dative case)"
    },
    {
      keyWords: ["ich", "Buch", "lesen"],
      possibleAnswers: [
        "Ich lese ein Buch",
        "Ich lese das Buch",
        "Ich lese mein Buch"
      ],
      hints: [
        "Subject comes first",
        "Add article before Buch",
        "Present tense: ich lese"
      ],
      pattern: "Subject + Verb + Article + Object",
      explanation: "Simple present tense. Remember: ich lese (I read), not 'ich lesen'"
    },
    {
      keyWords: ["Katze", "schlafen", "Sofa"],
      possibleAnswers: [
        "Die Katze schläft auf dem Sofa",
        "Meine Katze schläft auf dem Sofa",
        "Eine Katze schläft auf dem Sofa"
      ],
      hints: [
        "Use 'die/meine/eine' with Katze",
        "'auf dem' = on the (dative)",
        "3rd person: sie schläft"
      ],
      pattern: "Article + Noun + Verb + Preposition + Location",
      explanation: "'auf + dative' for 'on'. Katze is feminine, so 'die Katze schläft'"
    }
  ],
  intermediate: [
    {
      keyWords: ["gestern", "Film", "sehen"],
      possibleAnswers: [
        "Gestern habe ich einen Film gesehen",
        "Ich habe gestern einen Film gesehen",
        "Gestern haben wir einen Film gesehen"
      ],
      hints: [
        "Use perfect tense (haben + past participle)",
        "Past participle: gesehen",
        "'einen' = accusative masculine"
      ],
      pattern: "Time + Auxiliary + Subject + Object + Past Participle",
      explanation: "German perfect tense. Past participle goes to the end of the sentence"
    },
    {
      keyWords: ["weil", "müde", "schlafen"],
      possibleAnswers: [
        "Weil ich müde bin, gehe ich schlafen",
        "Ich gehe schlafen, weil ich müde bin"
      ],
      hints: [
        "'weil' sends verb to end of clause",
        "Main clause: normal word order",
        "Add comma between clauses"
      ],
      pattern: "Subordinate clause + main clause OR main + subordinate",
      explanation: "Subordinating conjunctions like 'weil' change word order - verb goes to the end"
    }
  ],
  advanced: [
    {
      keyWords: ["hätte", "Zeit", "reisen"],
      possibleAnswers: [
        "Hätte ich mehr Zeit, würde ich viel reisen",
        "Wenn ich mehr Zeit hätte, würde ich reisen"
      ],
      hints: [
        "Subjunctive II for hypothetical situations",
        "hätte = would have",
        "würde + infinitive = would do"
      ],
      pattern: "Subjunctive condition + subjunctive result",
      explanation: "Subjunctive II expresses hypothetical or unreal situations"
    }
  ]
};

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
type GameMode = 'menu' | 'typing' | 'builder' | 'result';

export const GermanWordGame = () => {
  const [gameState, setGameState] = useState<GameMode>('menu');
  const [gameMode, setGameMode] = useState<'typing' | 'builder'>('typing');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showPattern, setShowPattern] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setIsCorrect(null);
    setShowHints(false);
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

  const checkSentenceBuilder = (input: string) => {
    if (!currentChallenge) return false;

    const normalizedInput = input.trim().toLowerCase();
    const hasAllKeyWords = currentChallenge.keyWords.every(word =>
      normalizedInput.includes(word.toLowerCase())
    );

    if (!hasAllKeyWords) return false;

    // Check against possible answers
    return currentChallenge.possibleAnswers.some(answer =>
      normalizedInput === answer.toLowerCase()
    );
  };

  const handleInputChange = (value: string) => {
    setUserInput(value);

    if (gameMode === 'typing') {
      // Track errors in real-time for typing mode
      const targetText = currentText!.text;
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

      // Update current word index
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
        // Allow retry - reset the error state and clear input
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

  // Render word with correct/incorrect styling (typing mode only)
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
        <div className="bg-white border border-gray-300 max-w-3xl w-full p-12 shadow-sm">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              German Typer
            </h1>
            <div className="w-20 h-0.5 bg-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm uppercase tracking-wide">
              Learn German through typing & sentence building
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Typing Practice */}
            <div className="border-l-2 border-gray-900 pl-6">
              <h3 className="font-semibold mb-3 text-gray-900 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Typing Practice
              </h3>
              <p className="text-sm text-gray-700 mb-4">Copy German sentences to build muscle memory</p>
              <div className="space-y-3">
                <button
                  onClick={() => startGame('beginner', 'typing')}
                  className="w-full text-left p-3 border border-gray-300 hover:border-gray-600 transition-colors"
                >
                  <div className="font-semibold text-gray-900 text-sm">Anfänger</div>
                  <div className="text-xs text-gray-700 mt-1">Basic patterns</div>
                </button>
                <button
                  onClick={() => startGame('intermediate', 'typing')}
                  className="w-full text-left p-3 border border-gray-300 hover:border-gray-600 transition-colors"
                >
                  <div className="font-semibold text-gray-900 text-sm">Mittelstufe</div>
                  <div className="text-xs text-gray-700 mt-1">Complex grammar</div>
                </button>
                <button
                  onClick={() => startGame('advanced', 'typing')}
                  className="w-full text-left p-3 border border-gray-300 hover:border-gray-600 transition-colors"
                >
                  <div className="font-semibold text-gray-900 text-sm">Fortgeschritten</div>
                  <div className="text-xs text-gray-700 mt-1">Advanced structures</div>
                </button>
              </div>
            </div>

            {/* Sentence Builder */}
            <div className="border-l-2 border-gray-900 pl-6">
              <h3 className="font-semibold mb-3 text-gray-900 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                Sentence Builder
              </h3>
              <p className="text-sm text-gray-700 mb-4">Build sentences from key words</p>
              <div className="space-y-3">
                <button
                  onClick={() => startGame('beginner', 'builder')}
                  className="w-full text-left p-3 border border-gray-300 hover:border-gray-600 transition-colors"
                >
                  <div className="font-semibold text-gray-900 text-sm">Anfänger</div>
                  <div className="text-xs text-gray-700 mt-1">Simple sentences</div>
                </button>
                <button
                  onClick={() => startGame('intermediate', 'builder')}
                  className="w-full text-left p-3 border border-gray-300 hover:border-gray-600 transition-colors"
                >
                  <div className="font-semibold text-gray-900 text-sm">Mittelstufe</div>
                  <div className="text-xs text-gray-700 mt-1">Subordinate clauses</div>
                </button>
                <button
                  onClick={() => startGame('advanced', 'builder')}
                  className="w-full text-left p-3 border border-gray-300 hover:border-gray-600 transition-colors"
                >
                  <div className="font-semibold text-gray-900 text-sm">Fortgeschritten</div>
                  <div className="text-xs text-gray-700 mt-1">Subjunctive mood</div>
                </button>
              </div>
            </div>
          </div>

          <div className="border-l-2 border-gray-900 pl-6">
            <h3 className="font-semibold mb-3 text-gray-900">Controls</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p><kbd className="bg-gray-200 px-2 py-1 text-xs font-mono text-gray-900">Esc</kbd> Toggle explanations/hints</p>
              <p><kbd className="bg-gray-200 px-2 py-1 text-xs font-mono text-gray-900">Enter</kbd> Submit sentence (builder mode)</p>
              <p><kbd className="bg-gray-200 px-2 py-1 text-xs font-mono text-gray-900">Ctrl+R</kbd> Reset current sentence</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result Screen
  if (gameState === 'result') {
    const totalChallenges = gameMode === 'typing'
      ? germanTexts[difficulty].length
      : sentenceBuilderChallenges[difficulty].length;

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
                <div className="text-2xl font-bold text-gray-900">{totalChallenges}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">{gameMode === 'typing' ? 'Sentences' : 'Challenges'}</div>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-8">
              {accuracy >= 95 ? 'Perfekt! Perfect German!' :
                accuracy >= 85 ? 'Sehr gut! Very good work!' :
                  'Gut gemacht! Keep practicing!'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={resetGame}
              className="w-full bg-gray-900 text-white py-4 text-sm font-semibold tracking-wide uppercase hover:bg-gray-800 transition-colors"
            >
              Try Different Mode
            </button>
            <button
              onClick={() => startGame(difficulty, gameMode)}
              className="w-full bg-gray-200 text-gray-700 py-4 text-sm font-semibold tracking-wide uppercase hover:bg-gray-300 transition-colors"
            >
              Practice Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const maxIndex = gameMode === 'typing'
    ? germanTexts[difficulty].length
    : sentenceBuilderChallenges[difficulty].length;

  // Main Game Interface
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
                <span className="font-bold text-gray-900">{currentTextIndex + 1}/{maxIndex}</span>
              </div>
              <div className="flex items-center">
                {gameMode === 'typing' ? <BookOpen className="w-4 h-4 mr-1 text-gray-700" /> : <Lightbulb className="w-4 h-4 mr-1 text-gray-700" />}
                <span className="text-gray-700 font-semibold">
                  {gameMode === 'typing' ? 'Typing Practice' : 'Sentence Builder'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => gameMode === 'typing' ? setShowMeaning(!showMeaning) : setShowHints(!showHints)}
                className="text-gray-700 hover:text-gray-900 transition-colors"
                title={gameMode === 'typing' ? "Toggle meaning" : "Toggle hints"}
              >
                {(gameMode === 'typing' ? showMeaning : showHints) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
        {((gameMode === 'typing' && showMeaning) || (gameMode === 'builder' && showHints)) && (
          <div className="bg-white border border-gray-300 p-6 mb-4 shadow-sm">
            {gameMode === 'typing' && currentText && (
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
            )}

            {gameMode === 'builder' && currentChallenge && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Hints</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {currentChallenge.hints.map((hint, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Pattern</h3>
                  <p className="text-sm text-gray-700 mb-2">{currentChallenge.pattern}</p>
                  <p className="text-xs text-gray-600">{currentChallenge.explanation}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-white border border-gray-300 p-8 shadow-sm">
          {gameMode === 'typing' && currentText && (
            <>
              {/* Text Display */}
              <div className="text-3xl leading-relaxed mb-8 p-6 bg-gray-50 rounded min-h-[120px] flex items-center">
                <div className="w-full">
                  {targetWords.map((word, index) => renderWord(word, index))}
                </div>
              </div>
            </>
          )}

          {gameMode === 'builder' && currentChallenge && (
            <>
              {/* Key Words Display */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Build a sentence using these words:</h3>
                <div className="flex flex-wrap gap-3 p-6 bg-gray-50 rounded">
                  {currentChallenge.keyWords.map((word, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold text-lg">
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Example Display */}
              <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <p className="text-sm text-gray-700">
                  <strong>Example pattern:</strong> {currentChallenge.pattern}
                </p>
              </div>
            </>
          )}

          {/* Input Area */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={gameMode === 'typing' ? "Start typing the German text above..." : "Type your German sentence here..."}
              className="w-full text-2xl p-4 border-2 border-gray-300 focus:border-gray-500 focus:outline-none bg-white font-mono"
              disabled={isFinished}
              autoFocus
            />

            {isFinished && (
              <div className="absolute inset-0 bg-green-50 border-2 border-green-400 rounded flex items-center justify-center">
                <span className="text-green-700 font-bold">Perfect! ✓</span>
              </div>
            )}

            {gameMode === 'builder' && isCorrect === false && (
              <div className="absolute inset-0 bg-red-50 border-2 border-red-400 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="text-red-700 font-bold mb-2">Try again! Check word order and articles</div>
                  <div className="text-red-600 text-sm">Press Enter to retry</div>
                </div>
              </div>
            )}
          </div>

          {/* Submit button for builder mode */}
          {gameMode === 'builder' && !isFinished && (
            <div className="mt-4">
              <button
                onClick={() => {
                  if (isCorrect === false) {
                    // Allow retry
                    setIsCorrect(null);
                    setUserInput('');
                    inputRef.current?.focus();
                  } else {
                    handleBuilderSubmit();
                  }
                }}
                className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                {isCorrect === false ? 'Try Again (Enter)' : 'Check Sentence (Enter)'}
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
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
    </div>
  );
}; 