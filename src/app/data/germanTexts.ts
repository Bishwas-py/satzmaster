import germanTextsData from './germanTexts.json';
import sentenceBuilderChallengesData from './sentenceBuilderChallenges.json';
import germanToEnglishDictionaryData from './germanToEnglishDictionary.json';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// German to English word translations for real-time feedback
export const germanToEnglishDictionary: Record<string, string> = germanToEnglishDictionaryData;

export const germanTexts = germanTextsData;
export const sentenceBuilderChallenges = sentenceBuilderChallengesData; 