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
  onInputFocus?: () => void;
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
  onInputFocus,
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
      // Always use the first answer as the target for character-level validation
      const targetSentence = currentChallenge.possibleAnswers[0].german;
      const correctText = targetSentence.toLowerCase();
      const userText = userInput.toLowerCase();
      
      // Check each character position in user input
      for (let i = 0; i < userText.length; i++) {
        if (i < correctText.length && userText[i] !== correctText[i]) {
          // Character is wrong at position i
          setCharacterMistakes(prev => {
            const newMistakes = { ...prev };
            newMistakes[i] = (newMistakes[i] || 0) + 1;
            
            // Only reveal if this is the 4th mistake AND no other character is already revealed
            if (newMistakes[i] === 4 && revealedCharacters.size === 0) {
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
            // Allow new hint if user has moved beyond all previously revealed characters
            else if (newMistakes[i] === 4 && revealedCharacters.size > 0) {
              // Check if current position is beyond all previously revealed characters
              const maxRevealedIndex = Math.max(...Array.from(revealedCharacters));
              const isBeyondRevealed = i > maxRevealedIndex;
              
              // Allow new hint if user is beyond previous hints and we haven't exceeded reasonable limit
              if (isBeyondRevealed && revealedCharacters.size < 5) {
                // Start shake animation and reveal new character
                setShakingCharacters(prevShaking => new Set(prevShaking).add(i));
                setTransitioningCharacters(prev => ({ ...prev, [i]: userInput[i] }));
                
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
            }
            // If this position is already revealed and user types wrong again, shake it
            else if (revealedCharacters.has(i)) {
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

  // Render Monkeytype-style text display for sentence builder
  const renderMonkeytypeBuilder = () => {
    if (!userInput) {
      return (
        <div className="text-3xl leading-relaxed font-mono text-gray-400 p-8 h-24 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg mb-2">Start typing your German sentence...</div>
            <div className="text-base opacity-75">Use the keywords above as your guide</div>
          </div>
        </div>
      );
    }

    // Always use the first answer as the target for visual comparison (consistent with mistake tracking)
    const targetSentence = currentChallenge.possibleAnswers[0].german;
    const userText = userInput;
    
    return (
      <div className="text-3xl leading-relaxed font-mono p-8 select-none min-h-24 flex flex-wrap items-start">
        <div className="w-full flex flex-wrap items-center gap-1">
          {userText.split('').map((char, index) => {
            let className = '';
            let displayChar = char;
            const isRevealed = revealedCharacters.has(index);
            const isShaking = shakingCharacters.has(index);
            const transitioningChar = transitioningCharacters[index];
            
            if (isShaking && transitioningChar) {
              // Show the wrong character shaking in red
              className = 'text-red-500 animate-shake';
              displayChar = transitioningChar;
            } else if (isRevealed && index < targetSentence.length) {
              // Show the correct character in blue for revealed positions
              className = 'text-blue-500';
              displayChar = targetSentence[index]; // Show correct character with original case
            } else if (index < targetSentence.length && userText[index].toLowerCase() === targetSentence[index].toLowerCase()) {
              // Correct character (case insensitive comparison)
              className = 'text-green-500';
            } else {
              // Wrong character
              className = 'text-red-500';
            }
            
            // Handle spaces with visible indicator
            if (displayChar === ' ') {
              return (
                <span key={index} className={className + ' bg-gray-200 mx-1 px-2 rounded flex-shrink-0'}>
                  ⎵
                </span>
              );
            }
            
            return (
              <span key={index} className={className + ' flex-shrink-0'}>
                {displayChar}
              </span>
            );
          })}
          
          {/* Cursor at current position */}
          <span className="w-0.5 h-8 bg-yellow-400 animate-pulse ml-0.5 inline-block transition-all duration-150 ease-out flex-shrink-0"></span>
        </div>
      </div>
    );
  };

  // Render completed words with translations
  const renderCompletedWords = () => {
    if (!userInput) return null;

    const words = userInput.split(' ');
    const completedWords = words.slice(0, -1); // All words except the currently being typed
    
    return (
      <div className="mt-4 flex flex-wrap gap-3">
        {completedWords.map((word, index) => {
          const translation = getWordTranslation(word);
          if (translation === 'translation not found') return null;
          
          return (
            <div key={index} className="text-center">
              <div className="text-sm font-medium text-green-700 mb-1">
                {word}
              </div>
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {translation}
              </div>
            </div>
          );
        })}
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

        {/* Input Area with Monkeytype-style Display */}
        <div className="relative">
          {/* Clean Monkeytype-style Text Display */}
          <div 
            className="min-h-[180px] max-h-[300px] overflow-auto bg-white rounded-lg border border-gray-200 focus-within:border-gray-400 cursor-text mb-4 transition-colors"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Simple progress indicator */}
            {userInput.length > 0 && (
              <div className="absolute top-2 right-2 text-xs text-gray-500 z-10">
                {userInput.length}
              </div>
            )}
            
            {/* Monkeytype-style character display */}
            {renderMonkeytypeBuilder()}
            
            {/* Completion overlay */}
            {isFinished && (
              <div className="absolute inset-0 bg-green-50 border border-green-400 rounded-lg flex flex-col items-center justify-center">
                <span className="text-green-700 font-bold text-lg mb-2">
                  {userInput}
                </span>
                <span className="text-green-600 text-base font-medium mb-2">
                  {translateSentence(userInput)}
                </span>
                <span className="text-green-500 text-sm">
                  Press Enter to continue →
                </span>
              </div>
            )}
          </div>

          {/* Show completed word translations */}
          {renderCompletedWords()}

          {/* Hidden input field for capturing keystrokes */}
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => {
              // Limit input to reasonable length to prevent overflow
              const maxLength = 200;
              if (e.target.value.length <= maxLength) {
                onInputChange(e.target.value);
              }
            }}
            onKeyDown={onKeyPress}
            onFocus={onInputFocus}
            className="absolute -left-9999px opacity-0"
            disabled={isFinished}
            autoFocus
            maxLength={200}
          />

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

        {/* Instructions */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          Green = correct, red = wrong, blue = revealed
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