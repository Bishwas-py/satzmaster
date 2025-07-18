import React from 'react';
import { GermanText } from '../types';

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
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyPress}
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
      </div>
    </>
  );
}; 