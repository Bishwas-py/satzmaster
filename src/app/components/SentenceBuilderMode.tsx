import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { SentenceBuilderChallenge } from '../types';
import { germanToEnglishDictionary } from '../data/germanTexts';

interface SentenceBuilderModeProps {
  currentChallenge: SentenceBuilderChallenge;
  userInput: string;
  isFinished: boolean;
  isCorrect: boolean | null;
  showHints: boolean;
  onInputChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSubmit: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const SentenceBuilderMode: React.FC<SentenceBuilderModeProps> = ({
  currentChallenge,
  userInput,
  isFinished,
  isCorrect,
  showHints,
  onInputChange,
  onKeyPress,
  onSubmit,
  inputRef
}) => {
  // Track character-level mistakes and revealed characters
  const [characterMistakes, setCharacterMistakes] = React.useState<Record<number, number>>({});
  const [revealedCharacters, setRevealedCharacters] = React.useState<Set<number>>(new Set());
  const [lastInput, setLastInput] = React.useState('');
  const [shakingCharacters, setShakingCharacters] = React.useState<Set<number>>(new Set());
  const [transitioningCharacters, setTransitioningCharacters] = React.useState<Record<number, string>>({});

  // Auto-focus the input when component mounts or when not finished
  React.useEffect(() => {
    if (!isFinished && inputRef.current) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isFinished, inputRef, currentChallenge.keyWords]);

  // Reset character tracking when challenge changes
  React.useEffect(() => {
    setCharacterMistakes({});
    setRevealedCharacters(new Set());
    setLastInput('');
    setShakingCharacters(new Set());
    setTransitioningCharacters({});
  }, [currentChallenge]);

  // Track character-level mistakes
  React.useEffect(() => {
    if (userInput !== lastInput && userInput.length > 0) {
      const bestMatch = getBestMatch(userInput);
      const correctText = bestMatch.toLowerCase();
      const userText = userInput.toLowerCase();
      
      // Check each character position
      for (let i = 0; i < userText.length; i++) {
        if (i < correctText.length && userText[i] !== correctText[i]) {
          // Character is wrong at position i
          setCharacterMistakes(prev => {
            const newMistakes = { ...prev };
            newMistakes[i] = (newMistakes[i] || 0) + 1;
            
            // If this is the 4th mistake at this position, reveal it
            if (newMistakes[i] === 4) {
              // Start shake animation and reveal after
              setShakingCharacters(prevShaking => new Set(prevShaking).add(i));
              setTransitioningCharacters(prev => ({ ...prev, [i]: userInput[i] }));
              
              // After 400ms, stop shaking and reveal correct character
              setTimeout(() => {
                setShakingCharacters(prevShaking => {
                  const newShaking = new Set(prevShaking);
                  newShaking.delete(i);
                  return newShaking;
                });
                setRevealedCharacters(prevRevealed => new Set(prevRevealed).add(i));
                setTransitioningCharacters(prev => {
                  const newTransitioning = { ...prev };
                  delete newTransitioning[i];
                  return newTransitioning;
                });
              }, 400);
            }
            // If this position is already revealed and user types wrong again, shake it
            else if (newMistakes[i] > 4 || revealedCharacters.has(i)) {
              setShakingCharacters(prevShaking => new Set(prevShaking).add(i));
              setTransitioningCharacters(prev => ({ ...prev, [i]: userInput[i] }));
              
              // After 400ms, stop shaking and go back to showing correct character
              setTimeout(() => {
                setShakingCharacters(prevShaking => {
                  const newShaking = new Set(prevShaking);
                  newShaking.delete(i);
                  return newShaking;
                });
                setTransitioningCharacters(prev => {
                  const newTransitioning = { ...prev };
                  delete newTransitioning[i];
                  return newTransitioning;
                });
              }, 400);
            }
            
            return newMistakes;
          });
        }
      }
      
      setLastInput(userInput);
    }
  }, [userInput, lastInput, revealedCharacters]);

  // Get English translation for a German word
  const getWordTranslation = (germanWord: string): string => {
    // Remove punctuation for dictionary lookup
    const cleanWord = germanWord.replace(/[.,!?;:]$/, '');

    // First try exact case match (important for Sie vs sie, etc.)
    if (germanToEnglishDictionary[cleanWord]) {
      return germanToEnglishDictionary[cleanWord];
    }

    // If no exact match, try lowercase (for words like Ich, Das, etc.)
    return germanToEnglishDictionary[cleanWord.toLowerCase()] || 'translation not found';
  };

  const handleRetry = () => {
    onInputChange('');
    inputRef.current?.focus();
  };

  // Get the best matching target answer for real-time validation
  const getBestMatch = (input: string) => {
    const firstAnswer = currentChallenge.possibleAnswers[0];
    if (!input.trim()) {
      return firstAnswer.german;
    }

    // Find the answer that matches the most characters from the beginning
    let bestMatch = firstAnswer.german;
    let maxMatchLength = 0;

    for (const answer of currentChallenge.possibleAnswers) {
      const matchLength = getMatchLength(input.toLowerCase(), answer.german.toLowerCase());
      if (matchLength > maxMatchLength) {
        maxMatchLength = matchLength;
        bestMatch = answer.german;
      }
    }

    return bestMatch;
  };

  // Get how many characters match from the beginning
  const getMatchLength = (input: string, target: string) => {
    let matchLength = 0;
    for (let i = 0; i < Math.min(input.length, target.length); i++) {
      if (input[i] === target[i]) {
        matchLength++;
      } else {
        break;
      }
    }
    return matchLength;
  };

  // Translate a complete German sentence to English using the JSON data
  const translateSentence = (germanSentence: string): string => {
    // Find the matching answer in the current challenge
    for (const answer of currentChallenge.possibleAnswers) {
      if (answer.german === germanSentence) {
        return answer.english;
      }
    }
    
    // If no exact match found, return a default message
    return "Translation not available";
  };

  // Render the input with real-time validation styling
  const renderValidationDisplay = () => {
    if (!userInput) return null;

    const bestMatch = getBestMatch(userInput);
    const matchLength = getMatchLength(userInput.toLowerCase(), bestMatch.toLowerCase());

    return (
      <div className="absolute inset-0 pointer-events-none font-mono text-2xl p-4 flex items-center z-5">
        <div className="flex">
          {/* Correct characters */}
          <span className="text-green-700 bg-green-100 px-0.5 rounded">
            {userInput.substring(0, matchLength)}
          </span>
          {/* Incorrect characters */}
          {matchLength < userInput.length && (
            <span className="text-red-700 bg-red-100 px-0.5 rounded">
              {userInput.substring(matchLength)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Tooltip.Provider delayDuration={300}>
      {/* Learning Panel */}
      {showHints && (
        <div className="bg-white border border-gray-300 p-6 mb-4 shadow-sm">
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
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white border border-gray-300 p-8 shadow-sm">
        {/* Key Words Display */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Build a sentence using these words:</h3>
          <div className="p-4 bg-gray-50 rounded border">
            <div className="flex flex-wrap gap-2">
              {currentChallenge.keyWords.map((word, index) => (
                <Tooltip.Root key={index}>
                  <Tooltip.Trigger asChild>
                    <span className="bg-white border border-gray-300 px-3 py-1 text-gray-900 font-mono text-sm cursor-help hover:bg-gray-50 hover:border-gray-400 transition-colors">
                      {word}
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-mono shadow-lg border border-gray-700 z-50"
                      sideOffset={5}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">{word}</span>
                        <span className="text-gray-500">=</span>
                        <span className="text-white">{getWordTranslation(word)}</span>
                      </div>
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </div>
          </div>
        </div>

        {/* Example Display */}
        <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-sm text-gray-700">
            <strong>Example pattern:</strong> {currentChallenge.pattern}
          </p>
        </div>

        {/* Input Area with Real-time Validation */}
        <div className="relative">
          {/* Show validation preview above input */}
          {userInput && (
            <div className="mb-2 p-2 bg-gray-50 rounded border font-mono text-lg">
              <div className="flex flex-wrap">
                {userInput.split('').map((char, index) => {
                  const bestMatch = getBestMatch(userInput);
                  const correctText = bestMatch.toLowerCase();
                  const userText = userInput.toLowerCase();
                  const matchLength = getMatchLength(userText, correctText);
                  const isCorrect = index < matchLength && userText[index] === correctText[index];
                  const isRevealed = revealedCharacters.has(index);
                  const isShaking = shakingCharacters.has(index);
                  const transitioningChar = transitioningCharacters[index];

                  let className = 'px-0.5 rounded mx-0.5 transition-all duration-300 ';
                  let displayChar = char;

                  if (isShaking && transitioningChar) {
                    // Show the wrong character shaking in red
                    className += 'text-red-700 bg-red-100 animate-shake font-bold ';
                    displayChar = transitioningChar;
                  } else if (isRevealed && !isCorrect && index < correctText.length) {
                    // Show the correct character in blue for revealed positions
                    className += 'text-blue-700 bg-blue-100 font-bold ';
                    displayChar = bestMatch[index]; // Show correct character with original case
                  } else if (isCorrect) {
                    className += 'text-green-700 bg-green-100 ';
                  } else {
                    className += 'text-red-700 bg-red-100 ';
                  }

                  return (
                    <span key={index} className={className}>
                      {displayChar === ' ' ? '␣' : displayChar}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input field */}
          <div className="relative">
            {/* Actual input field */}
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder="Type your German sentence here..."
              className="w-full text-2xl p-4 border-2 border-gray-400 focus:border-gray-700 focus:outline-none font-mono text-gray-900 placeholder-gray-500 shadow-sm"
              disabled={isFinished}
              autoFocus
            />
          </div>

          {isFinished && (
            <div className="absolute bottom-0 left-0 right-0 bg-green-50 border-2 border-green-400 rounded flex flex-col items-center justify-center p-4">
              <span className="text-green-700 font-bold mb-2">✓ Complete!</span>
              <span className="text-green-600 text-lg font-medium">
                {translateSentence(userInput)}
              </span>
            </div>
          )}

          {isCorrect === false && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-50 border-2 border-red-400 rounded flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-red-700 font-bold mb-2">
                  Try again! Check word order and articles
                  {Object.keys(characterMistakes).length > 0 && (
                    <span className="text-red-600 text-sm ml-2">
                      ({Object.values(characterMistakes).reduce((sum, val) => sum + val, 0)} character mistakes)
                    </span>
                  )}
                </div>
                <div className="text-red-600 text-sm">Press Enter to retry</div>
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        {!isFinished && (
          <div className="mt-4">
            <button
              onClick={() => {
                if (isCorrect === false) {
                  handleRetry();
                } else {
                  onSubmit();
                }
              }}
              className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              {isCorrect === false ? 'Try Again (Enter)' : 'Check Sentence (Enter)'}
            </button>
          </div>
        )}
      </div>
    </Tooltip.Provider>
  );
}; 