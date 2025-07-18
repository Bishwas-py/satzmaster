export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type GameMode = 'menu' | 'typing' | 'builder' | 'result';

export interface GermanText {
  text: string;
  translation: string;
  pattern: string;
  explanation: string;
}

export interface SentenceBuilderChallenge {
  keyWords: string[];
  possibleAnswers: string[];
  hints: string[];
  pattern: string;
  explanation: string;
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  errors: number;
  startTime: number;
} 