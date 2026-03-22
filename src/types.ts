export interface Vocabulary {
  word: string;
  reading: string;
  meaning: string;
  example: string;
  exampleReading: string;
  exampleMeaning: string;
}

export interface WordDetail {
  word: string;
  reading: string;
  meaning: string;
  type: string;
  example: {
    japanese: string;
    reading: string;
    chinese: string;
  };
  conjugations?: {
    form: string;
    japanese: string;
    reading: string;
  }[];
}

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface GrammarPoint {
  id: string;
  title: string;
  meaning: string;
  usage: string;
  examples: {
    japanese: string;
    reading: string;
    chinese: string;
  }[];
  practice: {
    chinese: string;
    japanese: string;
  }[];
}
export interface ReadingPassage {
  id: string;
  level: JLPTLevel;
  title: string;
  content: string;
  source?: string;
  question?: {
    text: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  };
}

export interface AnalysisResult {
  translation: string;
  grammarPoints: {
    point: string;
    explanation: string;
  }[];
}

export interface SavedItem {
  id: string;
  text: string;
  translation: string;
  grammarPoints?: {
    point: string;
    explanation: string;
  }[];
  type: 'sentence' | 'grammar';
  timestamp: number;
}

export interface Kana {
  char: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
}

export interface Feedback {
  id: string;
  content: string;
  author?: string;
  createdAt: any; // Firestore Timestamp
  status?: 'pending' | 'reviewed' | 'implemented';
}
