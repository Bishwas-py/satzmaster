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
  // Auto-focus the input when component mounts or when not finished
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
    return germanToEnglishDictionary[cleanWord] || '?';
  };

  // Render word with correct/incorrect styling and translation
  const renderWord = (word: string, index: number) => {
    const typedWord = typedWords[index] || '';
    const isCurrentWord = index === currentWordIndex;
    const isCompleted = index < typedWords.length - 1;
    const isCorrect = typedWord === word;
    
    // Show translation if word is completed correctly, OR if it's the current word and typed correctly
    const shouldShowTranslation = (isCompleted && isCorrect) || (isCurrentWord && isCorrect && typedWord.length === word.length);
    
    let className = 'mx-1 ';
    
    if (isCurrentWord) {
      className += 'bg-yellow-200 text-gray-900 ';
    } else if (isCompleted) {
      className += isCorrect ? 'text-green-800 bg-green-100 ' : 'text-red-800 bg-red-100 ';
    } else {
      className += 'text-gray-800 ';
    }
    
    return (
      <div key={index} className="inline-block mx-1">
        <span className={className + 'px-1 py-0.5 rounded'}>
          {word}
        </span>
        {shouldShowTranslation && (
          <div className="text-center text-sm text-blue-600 mt-1 font-normal">
            {getWordTranslation(word)}
          </div>
        )}
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
        {/* Text Display with Live Translations */}
        <div className="text-3xl leading-relaxed mb-8 p-6 bg-gray-50 rounded min-h-[160px] flex items-start">
          <div className="w-full">
            <div className="flex flex-wrap items-start">
              {targetWords.map((word, index) => renderWord(word, index))}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="Start typing the German text above..."
            className="w-full text-2xl p-4 border-2 border-gray-400 focus:border-gray-700 focus:outline-none bg-white font-mono text-gray-900 placeholder-gray-500 shadow-sm"
            disabled={isFinished}
            autoFocus
          />
          
          {isFinished && (
            <div className="absolute inset-0 bg-green-50 border-2 border-green-400 rounded flex items-center justify-center">
              <span className="text-green-700 font-bold">Perfect! ✓</span>
            </div>
          )}
        </div>

        {/* Real-time Translation Hint */}
        <div className="mt-4 text-sm text-gray-600 text-center">
          ✨ English translations appear below each word as you type them correctly
        </div>
      </div>
    </>
  );
}; 