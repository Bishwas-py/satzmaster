import React from 'react';
import { GermanText } from '../types';
import { germanToEnglishDictionary } from '../data/germanTexts';

interface TypingModeProps {
  currentText: GermanText;
  userInput: string;
  typedWords: string[];
  targetWords: string[];
  currentWordIndex: number;
  isFinished: boolean;
  showMeaning: boolean;
  onInputChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const TypingMode: React.FC<TypingModeProps> = ({
  currentText,
  userInput,
  typedWords,
  targetWords,
  currentWordIndex,
  isFinished,
  showMeaning,
  onInputChange,
  onKeyPress,
  inputRef
}) => {
  // Auto-focus the hidden input when component mounts or when not finished
  React.useEffect(() => {
    if (!isFinished && inputRef.current) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isFinished, inputRef, currentText.text]);

  // Get English translation for a German word
  const getWordTranslation = (germanWord: string): string => {
    // Remove punctuation for dictionary lookup
    const cleanWord = germanWord.replace(/[.,!?;:]$/, '');
    
    // First try exact case match (important for Sie vs sie, etc.)
    if (germanToEnglishDictionary[cleanWord]) {
      return germanToEnglishDictionary[cleanWord];
    }
    
    // If no exact match, try lowercase (for words like Ich, Das, etc.)
    return germanToEnglishDictionary[cleanWord.toLowerCase()] || '?';
  };

  // Render character-by-character with Monkeytype-style feedback
  const renderMonkeytypeText = () => {
    const targetText = currentText.text;
    const userText = userInput;
    
    return (
      <div className="text-3xl leading-relaxed font-mono">
        {targetText.split('').map((char, index) => {
          let className = 'relative ';
          let displayChar = char;
          
          if (index < userText.length) {
            // Character has been typed
            if (userText[index] === char) {
              // Correct character
              className += 'text-green-600 bg-green-100 ';
            } else {
              // Wrong character
              className += 'text-red-600 bg-red-200 ';
            }
          } else if (index === userText.length) {
            // Current cursor position
            className += 'text-gray-800 bg-yellow-300 animate-pulse ';
          } else {
            // Not yet typed
            className += 'text-gray-400 ';
          }
          
          // Handle spaces with visible indicator
          if (char === ' ') {
            return (
              <span key={index} className={className + 'px-1'}>
                {index === userText.length ? '⎵' : ' '}
              </span>
            );
          }
          
          return (
            <span key={index} className={className + 'px-0.5 rounded'}>
              {displayChar}
            </span>
          );
        })}
      </div>
    );
  };

  // Render word translations below completed words
  const renderWordTranslations = () => {
    const words = currentText.text.split(' ');
    const userWords = userInput.split(' ');
    
    return (
      <div className="mt-6 flex flex-wrap gap-4">
        {words.map((word, index) => {
          const userWord = userWords[index] || '';
          const isWordComplete = userWords.length > index && userWords[index] === word;
          
          if (!isWordComplete) return null;
          
          return (
            <div key={index} className="text-center">
              <div className="text-sm font-medium text-green-700 mb-1">
                {word}
              </div>
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {getWordTranslation(word)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
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

      {/* Main Content Area */}
      <div className="bg-white border border-gray-300 p-8 shadow-sm">
        {/* Monkeytype-style Text Display */}
        <div className="relative">
          <div 
            className="min-h-[200px] p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 focus-within:border-gray-500 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Click to focus instruction */}
            {userInput.length === 0 && (
              <div className="absolute top-2 left-2 text-xs text-gray-500">
                Click here and start typing...
              </div>
            )}
            
            {/* Progress bar */}
            <div className="absolute top-2 right-2 text-xs text-gray-500">
              {userInput.length}/{currentText.text.length}
            </div>
            
            {/* Monkeytype-style character display */}
            <div className="pt-6">
              {renderMonkeytypeText()}
            </div>
            
            {/* Completion overlay */}
            {isFinished && (
              <div className="absolute inset-0 bg-green-50 border-2 border-green-400 rounded-lg flex items-center justify-center">
                <span className="text-green-700 font-bold text-xl">Perfect! ✓</span>
              </div>
            )}
          </div>
          
          {/* Word translations */}
          {renderWordTranslations()}
        </div>

        {/* Hidden input field for capturing keystrokes */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyPress}
          className="absolute -left-9999px opacity-0"
          disabled={isFinished}
          autoFocus
        />

        {/* Instructions */}
        <div className="mt-4 text-sm text-gray-600 text-center">
          ✨ Type the German text above. Correct characters turn green, mistakes turn red.
        </div>
      </div>
    </>
  );
}; 