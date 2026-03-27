import { JLPTLevel, Vocabulary, GrammarPoint, ReadingPassage } from "../types";
import { generateVocabularyList, generateGrammarPoints, generateReadingPassage, generateKanaExamples } from "./gemini";

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

export const prefetchReading = async (level: JLPTLevel = 'N3', forceRefresh: boolean = false, topic?: string): Promise<ReadingPassage | null> => {
  const cacheKey = `reading_passage_cache_${level}_${topic || 'random'}`;
  return fetchWithCache(cacheKey, () => generateReadingPassage(level, topic), forceRefresh);
};

export const prefetchKanaExamples = async (kana: string, forceRefresh: boolean = false): Promise<Vocabulary[]> => {
  const cacheKey = `kana_examples_cache_v3_${kana}`;
  return fetchWithCache(cacheKey, () => generateKanaExamples(kana), forceRefresh);
};

export type PreloadProgress = {
  total: number;
  completed: number;
  percentage: number;
  currentTask: string;
};

export const preloadWithProgress = async (onProgress: (progress: PreloadProgress) => void) => {
  const allTasks: { name: string; fn: () => Promise<any> }[] = [];

  // 1. Vocabulary (N5-N3, first 3 pages each)
  // Prioritize N5 and N4 first pages
  (['N5', 'N4', 'N3'] as JLPTLevel[]).forEach(level => {
    [1, 2, 3].forEach(page => {
      allTasks.push({
        name: `加载 ${level} 词汇 - 第 ${page} 页`,
        fn: () => prefetchVocabulary(level, page)
      });
    });
  });

  // 2. Grammar (N5-N3)
  (['N5', 'N4', 'N3'] as JLPTLevel[]).forEach(level => {
    allTasks.push({
      name: `加载 ${level} 核心语法`,
      fn: () => prefetchGrammar(level)
    });
  });

  // 3. Reading (N5-N3)
  (['N5', 'N4', 'N3'] as JLPTLevel[]).forEach(level => {
    allTasks.push({
      name: `加载 ${level} 模拟阅读`,
      fn: () => prefetchReading(level)
    });
  });

  // 4. Kana Examples (All vowels and common consonants)
  const commonKana = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の'];
  commonKana.forEach(kana => {
    allTasks.push({
      name: `加载假名示例: ${kana}`,
      fn: () => prefetchKanaExamples(kana)
    });
  });

  // Split tasks into Essential (first half) and Background (second half)
  const essentialTasks = allTasks.slice(0, Math.ceil(allTasks.length / 2));
  const backgroundTasks = allTasks.slice(Math.ceil(allTasks.length / 2));

  const total = essentialTasks.length;
  let completed = 0;

  // Execute essential tasks with concurrency
  const batchSize = 3;
  for (let i = 0; i < essentialTasks.length; i += batchSize) {
    const batch = essentialTasks.slice(i, i + batchSize);
    await Promise.all(batch.map(async (task) => {
      try {
        await task.fn();
      } catch (e) {
        console.error(`Preload failed for ${task.name}`, e);
      }
      completed++;
      onProgress({
        total,
        completed,
        percentage: Math.round((completed / total) * 100),
        currentTask: task.name
      });
    }));
  }

  // Start background tasks without awaiting
  (async () => {
    // Wait for the app to transition to main view first
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    for (let i = 0; i < backgroundTasks.length; i += batchSize) {
      const batch = backgroundTasks.slice(i, i + batchSize);
      await Promise.all(batch.map(async (task) => {
        try {
          await task.fn();
        } catch (e) {
          console.error(`Background load failed for ${task.name}`, e);
        }
      }));
      // Small delay between batches to avoid network congestion
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  })();
};
