export interface Challenge {
  scrambled: string[];
  correct: string;
  translation: string;
  difficulty: number;
}

export interface FallingWord {
  id: number;
  word: string;
  left: number;
  phase: 'appearing' | 'staying' | 'falling';
}

export type GameState = 'menu' | 'playing' | 'gameOver';

export type WordPhase = 'appearing' | 'staying' | 'falling';

export interface GameStats {
  score: number;
  lives: number;
  currentRound: number;
  currentLevel: number;
  timeLeft: number;
}

export interface UserProgress {
  highScore: number;
  totalGamesPlayed: number;
  averageScore: number;
  bestLevel: number;
  lastPlayedDate: string;
  streakDays: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  difficultyLevel: 'easy' | 'normal' | 'hard';
  fontSize: 'small' | 'medium' | 'large';
  colorScheme: 'light' | 'dark' | 'auto';
  showHints: boolean;
  gameSpeed: 'slow' | 'normal' | 'fast';
}

export interface HintSystem {
  showFirstLetter: boolean;
  showWordCount: boolean;
  showGrammarTip: boolean;
  hintsUsed: number;
  maxHints: number;
} 