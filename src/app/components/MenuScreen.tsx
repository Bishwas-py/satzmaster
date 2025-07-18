import React from 'react';
import { BookOpen, Lightbulb } from 'lucide-react';
import { DifficultyLevel } from '../types';

interface MenuScreenProps {
  onStartGame: (difficulty: DifficultyLevel, mode: 'typing' | 'builder') => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ onStartGame }) => {
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
                onClick={() => onStartGame('beginner', 'typing')}
                className="w-full text-left p-3 border border-gray-300 hover:border-gray-600 transition-colors"
              >
                <div className="font-semibold text-gray-900 text-sm">Anfänger</div>
                <div className="text-xs text-gray-700 mt-1">Basic patterns</div>
              </button>
              <button
                onClick={() => onStartGame('intermediate', 'typing')}
                className="w-full text-left p-3 border border-gray-300 hover:border-gray-600 transition-colors"
              >
                <div className="font-semibold text-gray-900 text-sm">Mittelstufe</div>
                <div className="text-xs text-gray-700 mt-1">Complex grammar</div>
              </button>
              <button
                onClick={() => onStartGame('advanced', 'typing')}
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
                onClick={() => onStartGame('beginner', 'builder')}
                className="w-full text-left p-3 border border-gray-300 hover:border-gray-600 transition-colors"
              >
                <div className="font-semibold text-gray-900 text-sm">Anfänger</div>
                <div className="text-xs text-gray-700 mt-1">Simple sentences</div>
              </button>
              <button
                onClick={() => onStartGame('intermediate', 'builder')}
                className="w-full text-left p-3 border border-gray-300 hover:border-gray-600 transition-colors"
              >
                <div className="font-semibold text-gray-900 text-sm">Mittelstufe</div>
                <div className="text-xs text-gray-700 mt-1">Subordinate clauses</div>
              </button>
              <button
                onClick={() => onStartGame('advanced', 'builder')}
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
}; 