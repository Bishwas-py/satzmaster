import React from 'react';
import { SentenceBuilderChallenge } from '../types';

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
  const handleRetry = () => {
    onInputChange('');
    inputRef.current?.focus();
  };

  return (
    <>
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

        {/* Input Area */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="Type your German sentence here..."
            className="w-full text-2xl p-4 border-2 border-gray-300 focus:border-gray-500 focus:outline-none bg-white font-mono"
            disabled={isFinished}
            autoFocus
          />
          
          {isFinished && (
            <div className="absolute inset-0 bg-green-50 border-2 border-green-400 rounded flex items-center justify-center">
              <span className="text-green-700 font-bold">Perfect! ✓</span>
            </div>
          )}
          
          {isCorrect === false && (
            <div className="absolute inset-0 bg-red-50 border-2 border-red-400 rounded flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-700 font-bold mb-2">Try again! Check word order and articles</div>
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
    </>
  );
}; 