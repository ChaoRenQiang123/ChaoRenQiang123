import * as gemini from './gemini';
import * as kimi from './kimi';
import { AIProvider, JLPTLevel, Vocabulary, WordDetail, ReadingPassage, AnalysisResult, GrammarPoint } from '../types';

export const getProvider = (): AIProvider => {
  return (localStorage.getItem('sakura_ai_provider') as AIProvider) || 'gemini';
};

export const setProvider = (provider: AIProvider) => {
  localStorage.setItem('sakura_ai_provider', provider);
  if (provider === 'gemini') {
    gemini.refreshGeminiClient();
  }
};

export const isAiEnabled = () => {
  const provider = getProvider();
  if (provider === 'gemini') return gemini.isAiEnabled();
  return true; // Kimi is through proxy, assuming server key exists
};

export const generateWordDetail = async (word: string, reading: string, meaning: string): Promise<WordDetail | null> => {
  const provider = getProvider();
  if (provider === 'kimi') return kimi.generateWordDetailKimi(word, reading, meaning);
  return gemini.generateWordDetail(word, reading, meaning);
};

export const translateBiDirectional = async (text: string, direction: 'zh-ja' | 'ja-zh'): Promise<{ translated: string; furigana?: string }> => {
  const provider = getProvider();
  if (provider === 'kimi') return kimi.translateKimi(text, direction);
  return gemini.translateBiDirectional(text, direction);
};

export const generateGrammarPoints = async (level: JLPTLevel, page: number = 1): Promise<GrammarPoint[]> => {
  const provider = getProvider();
  if (provider === 'kimi') return kimi.generateGrammarKimi(level, page);
  return gemini.generateGrammarPoints(level, page);
};

export const generateReadingPassage = async (level: JLPTLevel, topic?: string): Promise<ReadingPassage> => {
  const provider = getProvider();
  if (provider === 'kimi') {
    const res = await kimi.generateReadingKimi(level, topic || "Japanese culture");
    if (res) return res;
  }
  return gemini.generateReadingPassage(level, topic);
};

export const analyzeSelectedText = async (text: string, context: string): Promise<AnalysisResult> => {
  const provider = getProvider();
  if (provider === 'kimi') {
    const res = await kimi.analyzeReadingKimi(text, context);
    return res || { translation: "解析失败", grammarPoints: [] };
  }
  return gemini.analyzeSelectedText(text, context);
};

export const generateVocabulary = async (level: JLPTLevel): Promise<Vocabulary[]> => {
  const provider = getProvider();
  if (provider === 'kimi') return kimi.generateVocabularyKimi(level);
  return gemini.generateVocabulary(level);
};

// Vocabulary list and kana examples are less critical, can keep Gemini or add Kimi later
export const generateVocabularyList = async (level: JLPTLevel, page: number): Promise<Vocabulary[]> => {
  return gemini.generateVocabularyList(level, page);
};

export const generateKanaExamples = async (kana: string): Promise<Vocabulary[]> => {
  return gemini.generateKanaExamples(kana);
};

export const generateAudio = gemini.generateAudio; // Audio is Gemini specfic TTS
