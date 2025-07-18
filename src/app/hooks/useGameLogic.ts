import { useState, useEffect, useCallback } from 'react';
import { GameState, Challenge, FallingWord, WordPhase, UserProgress, GameSettings } from '../types/game';
import { challenges } from '../data/challenges';
import { useLocalStorage } from './useLocalStorage';

const defaultProgress: UserProgress = {
  highScore: 0,
  totalGamesPlayed: 0,
  averageScore: 0,
  bestLevel: 1,
  lastPlayedDate: new Date().toISOString(),
  streakDays: 0
};

const defaultSettings: GameSettings = {
  soundEnabled: true,
  animationsEnabled: true,
  difficultyLevel: 'normal',
  fontSize: 'medium',
  colorScheme: 'auto',
  showHints: true,
  gameSpeed: 'normal'
};

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [userSentence, setUserSentence] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [wordPhase, setWordPhase] = useState<WordPhase>('appearing');
  const [timeLeft, setTimeLeft] = useState(10);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [usedHints, setUsedHints] = useState<string[]>([]);

  // Persistent data
  const [progress, setProgress] = useLocalStorage<UserProgress>('gameProgress', defaultProgress);
  const [settings, setSettings] = useLocalStorage<GameSettings>('gameSettings', defaultSettings);

  const maxHints = 5;

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setCurrentRound(1);
    setCurrentLevel(1);
    setUserSentence('');
    setFeedback('');
    setShowFeedback(false);
    setHintsUsed(0);
    setUsedHints([]);
    generateNewChallenge();
  };

  const generateNewChallenge = useCallback(() => {
    const level = Math.min(3, Math.floor(score / 200) + 1);
    setCurrentLevel(level);
    
    const availableChallenges = challenges.filter(c => c.difficulty <= level);
    const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
    
    const shuffledWords = [...randomChallenge.scrambled].sort(() => Math.random() - 0.5);
    
    setCurrentChallenge({ ...randomChallenge, scrambled: shuffledWords });
    
    // Better word positioning with proper spacing
    const words = shuffledWords.map((word, index) => {
      const totalWords = shuffledWords.length;
      const containerWidth = 90; // Use 90% of screen width for better mobile support
      const startPosition = 5; // Start at 5% from left edge
      
      let leftPosition;
      if (totalWords === 1) {
        leftPosition = 50; // Center single word
      } else if (totalWords === 2) {
        leftPosition = startPosition + (index * 45); // 5%, 50%
      } else if (totalWords === 3) {
        leftPosition = startPosition + (index * 30); // 5%, 35%, 65%
      } else {
        // For 4+ words, distribute evenly
        const spacing = containerWidth / (totalWords + 1);
        leftPosition = spacing + (index * spacing);
      }
      
      return {
        id: index,
        word,
        left: Math.min(Math.max(leftPosition, 5), 85), // Ensure words stay within bounds
        phase: 'appearing' as const
      };
    });
    
    setFallingWords(words);
    setWordPhase('appearing');
    setTimeLeft(10);
    setUsedHints([]); // Reset hints for new challenge
    
    setTimeout(() => setWordPhase('staying'), 1000);
    setTimeout(() => setWordPhase('falling'), 8000);
  }, [score]);

  const checkAnswer = () => {
    if (!currentChallenge) return;
    
    const userAnswer = userSentence.trim();
    const correctAnswer = currentChallenge.correct;
    
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      const points = 50 * currentChallenge.difficulty + (currentLevel * 25);
      setScore(prev => prev + points);
      setFeedback(`Richtig! +${points} Punkte! 🎉`);
      setShowFeedback(true);
      
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        setUserSentence('');
        setShowFeedback(false);
        generateNewChallenge();
      }, 2500);
    } else {
      setLives(prev => prev - 1);
      setFeedback(`Korrekte Antwort: "${correctAnswer}"`);
      setShowFeedback(true);
      
      if (lives <= 1) {
        setTimeout(() => {
          setGameState('gameOver');
          updateProgress();
        }, 3000);
      } else {
        setTimeout(() => {
          setUserSentence('');
          setShowFeedback(false);
          generateNewChallenge();
        }, 4000);
      }
    }
  };

  const useHint = (hintType: string) => {
    const hintCosts = { firstLetter: 1, wordCount: 1, grammarTip: 2 };
    const cost = hintCosts[hintType as keyof typeof hintCosts] || 1;
    
    if (hintsUsed + cost <= maxHints && !usedHints.includes(hintType)) {
      setHintsUsed(prev => prev + cost);
      setUsedHints(prev => [...prev, hintType]);
    }
  };

  const skipChallenge = () => {
    setScore(prev => Math.max(0, prev - 10)); // Penalty for skipping
    setUserSentence('');
    setUsedHints([]);
    generateNewChallenge();
  };

  const updateProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastPlayed = progress.lastPlayedDate.split('T')[0];
    
    let newStreakDays = progress.streakDays;
    if (today !== lastPlayed) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastPlayed === yesterdayStr) {
        newStreakDays += 1;
      } else {
        newStreakDays = 1;
      }
    }

    const newTotalGames = progress.totalGamesPlayed + 1;
    const newAverageScore = ((progress.averageScore * progress.totalGamesPlayed) + score) / newTotalGames;

    setProgress({
      highScore: Math.max(progress.highScore, score),
      totalGamesPlayed: newTotalGames,
      averageScore: newAverageScore,
      bestLevel: Math.max(progress.bestLevel, currentLevel),
      lastPlayedDate: new Date().toISOString(),
      streakDays: newStreakDays
    });
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setLives(3);
    setCurrentRound(1);
    setCurrentLevel(1);
    setUserSentence('');
    setFeedback('');
    setShowFeedback(false);
    setCurrentChallenge(null);
    setFallingWords([]);
    setHintsUsed(0);
    setUsedHints([]);
  };

  // Timer countdown
  useEffect(() => {
    if (gameState === 'playing' && wordPhase === 'staying' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, wordPhase, timeLeft]);

  // Auto-generate new challenge when round changes
  useEffect(() => {
    if (gameState === 'playing' && currentRound > 1) {
      generateNewChallenge();
    }
  }, [currentRound, gameState, generateNewChallenge]);

  return {
    gameState,
    score,
    lives,
    currentRound,
    fallingWords,
    userSentence,
    feedback,
    showFeedback,
    currentLevel,
    currentChallenge,
    wordPhase,
    timeLeft,
    hintsUsed,
    maxHints,
    usedHints,
    progress,
    settings,
    startGame,
    checkAnswer,
    resetGame,
    setUserSentence,
    useHint,
    skipChallenge,
    setSettings
  };
}; 