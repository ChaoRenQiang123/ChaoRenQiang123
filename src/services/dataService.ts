import { JLPTLevel, Vocabulary, GrammarPoint, ReadingPassage } from "../types";
import { generateVocabularyList, generateGrammarPoints, generateReadingPassage } from "./gemini";

// Track ongoing fetches to prevent redundant calls
const ongoingFetches: Record<string, Promise<any>> = {};

const fetchWithCache = async <T>(
  cacheKey: string, 
  fetchFn: () => Promise<T>, 
  forceRefresh: boolean = false
): Promise<T> => {
  if (!forceRefresh) {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        console.error(`Failed to parse cache for ${cacheKey}`, e);
      }
    }
  }

  // If there's already an ongoing fetch for this key, return that promise
  if (ongoingFetches[cacheKey]) {
    return ongoingFetches[cacheKey];
  }

  const fetchPromise = fetchFn().then(data => {
    if (data && (!Array.isArray(data) || data.length > 0)) {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
    delete ongoingFetches[cacheKey];
    return data;
  }).catch(err => {
    delete ongoingFetches[cacheKey];
    throw err;
  });

  ongoingFetches[cacheKey] = fetchPromise;
  return fetchPromise;
};

export const prefetchVocabulary = async (level: JLPTLevel = 'N3', page: number = 1, forceRefresh: boolean = false): Promise<Vocabulary[]> => {
  const cacheKey = `sakura_vocab_v2_${level}_${page}`;
  return fetchWithCache(cacheKey, () => generateVocabularyList(level, page), forceRefresh);
};

export const prefetchGrammar = async (level: JLPTLevel = 'N5', forceRefresh: boolean = false): Promise<GrammarPoint[]> => {
  const cacheKey = `grammar_cache_${level}`;
  return fetchWithCache(cacheKey, () => generateGrammarPoints(level), forceRefresh);
};

export const prefetchReading = async (level: JLPTLevel = 'N3', forceRefresh: boolean = false): Promise<ReadingPassage | null> => {
  const cacheKey = `reading_passage_cache_${level}`;
  return fetchWithCache(cacheKey, () => generateReadingPassage(level), forceRefresh);
};

export const startPreloading = () => {
  // Preload default levels for each category
  prefetchVocabulary('N3', 1);
  prefetchGrammar('N5');
  prefetchReading('N3');
};
