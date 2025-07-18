import React from 'react';
import { DifficultyLevel } from '../types';

interface ResultScreenProps {
  wpm: number;
  accuracy: number;
  totalChallenges: number;
  gameMode: 'typing' | 'builder';
  difficulty: DifficultyLevel;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  wpm,
  accuracy,
  totalChallenges,
  gameMode,
  difficulty,
  onRestart,
  onBackToMenu
}) => {
  const getMessage = () => {
    if (accuracy >= 95) return 'Perfekt! Perfect German!';
    if (accuracy >= 85) return 'Sehr gut! Very good work!';
    return 'Gut gemacht! Keep practicing!';
  };

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
              <div className="text-xs text-gray-600 uppercase tracking-wide">
                {gameMode === 'typing' ? 'Sentences' : 'Challenges'}
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 text-sm mb-8">
            {getMessage()}
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onBackToMenu}
            className="w-full bg-gray-900 text-white py-4 text-sm font-semibold tracking-wide uppercase hover:bg-gray-800 transition-colors"
          >
            Try Different Mode
          </button>
          <button
            onClick={onRestart}
            className="w-full bg-gray-200 text-gray-700 py-4 text-sm font-semibold tracking-wide uppercase hover:bg-gray-300 transition-colors"
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
}; 