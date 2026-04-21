import { JLPTLevel, Vocabulary, GrammarPoint, ReadingPassage } from "../types";
import { generateVocabularyList, generateGrammarPoints, generateReadingPassage, generateKanaExamples } from "./gemini";
import { KANA_STATIC_DATA } from "../data/kana_static";
import { VOCAB_STATIC_DATA } from "../data/vocab_static";
import { GRAMMAR_STATIC_DATA } from "../data/grammar_static";
import { READING_STATIC_DATA } from "../data/reading_static";

// Track ongoing fetches to prevent redundant calls
const ongoingFetches: Record<string, Promise<any>> = {};

const fetchWithCache = async <T>(
  cacheKey: string, 
  fetchFn: () => Promise<T>, 
  forceRefresh: boolean = false,
  staticData?: T
): Promise<T> => {
  if (!forceRefresh) {
    // 1. Check static embedded data first
    if (staticData) {
      console.log(`Using static data for ${cacheKey}`);
      return staticData;
    }

    // 2. Then check local storage cache
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

export const prefetchVocabulary = async (level: JLPTLevel = 'N5', page: number = 1, forceRefresh: boolean = false): Promise<Vocabulary[]> => {
  const cacheKey = `sakura_vocab_v2_${level}_${page}`;
  const staticData = VOCAB_STATIC_DATA[level]?.[page];
  return fetchWithCache(cacheKey, () => generateVocabularyList(level, page), forceRefresh, staticData);
};

export const prefetchGrammar = async (level: JLPTLevel = 'N5', page: number = 1, forceRefresh: boolean = false): Promise<GrammarPoint[]> => {
  const cacheKey = `grammar_cache_v2_${level}_${page}`;
  const staticData = GRAMMAR_STATIC_DATA[level]?.[page];
  return fetchWithCache(cacheKey, () => generateGrammarPoints(level, page), forceRefresh, staticData);
};

export const prefetchReading = async (level: JLPTLevel = 'N5', forceRefresh: boolean = false, topic?: string, staticIndex?: number): Promise<ReadingPassage | null> => {
  const cacheKey = `reading_passage_cache_${level}_${topic || 'random'}_index_${staticIndex || 0}`;
  // For static reading, we pick based on the provided index or default to 0
  const staticData = (!topic && READING_STATIC_DATA[level]?.length > (staticIndex || 0)) 
    ? READING_STATIC_DATA[level][staticIndex || 0] 
    : undefined;
  
  return fetchWithCache(cacheKey, () => generateReadingPassage(level, topic), forceRefresh, staticData);
};

export const prefetchKanaExamples = async (kana: string, forceRefresh: boolean = false): Promise<Vocabulary[]> => {
  const cacheKey = `kana_examples_cache_v3_${kana}`;
  const staticData = KANA_STATIC_DATA[kana];
  return fetchWithCache(cacheKey, () => generateKanaExamples(kana), forceRefresh, staticData as any);
};

export type PreloadProgress = {
  total: number;
  completed: number;
  percentage: number;
  currentTask: string;
};

export const preloadWithProgress = async (onProgress: (progress: PreloadProgress) => void) => {
  const essentialTasks: { name: string; fn: () => Promise<any> }[] = [];
  const backgroundTasks: { name: string; fn: () => Promise<any> }[] = [];

  // 1. Essential: Only N5 first page and basic grammar (to show something immediately)
  essentialTasks.push({
    name: "加载 N5 核心词汇",
    fn: () => prefetchVocabulary('N5', 1)
  });
  essentialTasks.push({
    name: "加载 N5 核心语法",
    fn: () => prefetchGrammar('N5')
  });

  // 2. Background: Other levels and more pages
  (['N4', 'N3'] as JLPTLevel[]).forEach(level => {
    backgroundTasks.push({
      name: `后台准备 ${level} 资源`,
      fn: async () => {
        await prefetchVocabulary(level, 1);
        await prefetchGrammar(level);
      }
    });
  });

  // 3. Background: Reading passages (one for each level)
  (['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).forEach(level => {
    backgroundTasks.push({
      name: `优化 ${level} 阅读体验`,
      fn: () => prefetchReading(level)
    });
  });

  const total = essentialTasks.length;
  let completed = 0;

  // Execute essential tasks sequentially to be safe
  for (const task of essentialTasks) {
    try {
      await task.fn();
    } catch (e) {
      console.error(`Essential preload failed: ${task.name}`, e);
    }
    completed++;
    onProgress({
      total,
      completed,
      percentage: Math.round((completed / total) * 100),
      currentTask: task.name
    });
  }

  // Start background tasks with significant delays to stay under 15 RPM
  (async () => {
    // Wait for the app to settle
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    for (const task of backgroundTasks) {
      try {
        await task.fn();
        // Wait 4 seconds between each background task to ensure we don't hit 15 RPM
        await new Promise(resolve => setTimeout(resolve, 4000));
      } catch (e) {
        console.warn(`Background task skipped: ${task.name}`);
      }
    }
  })();
};
