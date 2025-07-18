import React from 'react';
import { Zap, Target, BookOpen, Lightbulb, Eye, EyeOff, RotateCcw, Home } from 'lucide-react';

interface StatsHeaderProps {
  wpm: number;
  accuracy: number;
  currentIndex: number;
  maxIndex: number;
  gameMode: 'typing' | 'builder';
  showHelp: boolean;
  onToggleHelp: () => void;
  onReset: () => void;
  onHome: () => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  wpm,
  accuracy,
  currentIndex,
  maxIndex,
  gameMode,
  showHelp,
  onToggleHelp,
  onReset,
  onHome
}) => {
  return (
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
            <span className="font-bold text-gray-900">{currentIndex + 1}/{maxIndex}</span>
          </div>
          <div className="flex items-center">
            {gameMode === 'typing' ? 
              <BookOpen className="w-4 h-4 mr-1 text-gray-700" /> : 
              <Lightbulb className="w-4 h-4 mr-1 text-gray-700" />
            }
            <span className="text-gray-700 font-semibold">
              {gameMode === 'typing' ? 'Typing Practice' : 'Sentence Builder'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleHelp}
            className="text-gray-700 hover:text-gray-900 transition-colors"
            title={gameMode === 'typing' ? "Toggle meaning" : "Toggle hints"}
          >
            {showHelp ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onReset}
            className="text-gray-700 hover:text-gray-900 transition-colors"
            title="Reset sentence"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onHome}
            className="text-gray-700 hover:text-gray-900 transition-colors"
            title="Back to menu"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}; 