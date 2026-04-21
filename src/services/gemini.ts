import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Vocabulary, JLPTLevel, ReadingPassage, AnalysisResult, GrammarPoint, WordDetail } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Simple cache for requests
const geminiCache = {
  get: (key: string) => {
    const cached = localStorage.getItem(`gemini_cache_${key}`);
    if (cached) {
      try {
        const { timestamp, data } = JSON.parse(cached);
        // Cache for 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  set: (key: string, data: any) => {
    try {
      localStorage.setItem(`gemini_cache_${key}`, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    } catch (e) {
      // Clear old cache if it's full
      if (e.name === 'QuotaExceededError') {
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('gemini_cache_')) localStorage.removeItem(k);
        });
      }
    }
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const safeGenerateContent = async (params: any, retryCount = 0): Promise<any> => {
  try {
    return await ai.models.generateContent(params);
  } catch (e: any) {
    const message = e?.message || String(e);
    const status = e?.status || (e?.error?.status) || "";
    const code = e?.code || (e?.error?.code) || 0;
    
    const isQuota = message.includes("quota") || message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || code === 429 || status === "RESOURCE_EXHAUSTED";
    const isNetworkError = message.includes("xhr error") || message.includes("Rpc failed") || message.includes("fetch") || status === "UNKNOWN" || code === 500;
    
    if (isQuota || isNetworkError) {
      if (retryCount < 2) {
        // Exponential backoff
        await sleep(2000 * (retryCount + 1));
        return safeGenerateContent(params, retryCount + 1);
      }
      if (isQuota) throw new Error("QUOTA_EXCEEDED");
      if (isNetworkError) throw new Error("NETWORK_ERROR");
    }
    throw e;
  }
};

// Model configuration
const savedModel = localStorage.getItem('sakura_gemini_model');
// Force gemini-3-flash-preview for now as it's the most reliable and recommended
let currentGeminiModel = 'gemini-3-flash-preview';

// Still keep the setter for future use, but we'll ignore the saved value for a bit to ensure stability
export const setGeminiModel = (model: string) => {
  currentGeminiModel = model;
  localStorage.setItem('sakura_gemini_model', model);
};

export const getGeminiModel = () => currentGeminiModel;

// Helper to extract JSON from model response
const extractJson = (text: string) => {
  if (!text) return null;
  
  // Try to find JSON in markdown blocks first
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
  let jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // Fallback: try to find the first { and last } or [ and ]
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    const firstBracket = jsonStr.indexOf('[');
    const lastBracket = jsonStr.lastIndexOf(']');
    
    let candidate = "";
    if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      candidate = jsonStr.substring(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1 && lastBracket !== -1) {
      candidate = jsonStr.substring(firstBracket, lastBracket + 1);
    }
    
    if (candidate) {
      try {
        return JSON.parse(candidate);
      } catch (innerE) {
        console.error("Failed to parse extracted JSON candidate:", innerE, "Candidate:", candidate);
      }
    }
    
    console.error("Failed to parse JSON from Gemini response:", e, "Original text:", text);
    return null;
  }
};

export const generateWordDetail = async (word: string, reading: string, meaning: string): Promise<WordDetail | null> => {
  const cacheKey = `word_detail_${word}_${reading}`;
  const cached = geminiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await safeGenerateContent({
      model: currentGeminiModel,
      contents: `Analyze the Japanese word "${word}" (reading: ${reading}, meaning: ${meaning}). 
      1. Identify its word type (e.g., Verb, Adjective, Noun).
      2. Provide a natural example sentence in Japanese, its reading, and Chinese translation.
      3. If it's a verb or adjective, provide common conjugations. 
         For verbs, include: て形, 否定形, 过去形, 礼貌形, 使役形, 被动形, 可能形, 假定形 (only if applicable).
         Use Chinese labels for all conjugation forms.
      Return the result in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            reading: { type: Type.STRING },
            meaning: { type: Type.STRING },
            type: { type: Type.STRING },
            example: {
              type: Type.OBJECT,
              properties: {
                japanese: { type: Type.STRING },
                reading: { type: Type.STRING },
                chinese: { type: Type.STRING },
              },
              required: ["japanese", "reading", "chinese"],
            },
            conjugations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  form: { type: Type.STRING },
                  japanese: { type: Type.STRING },
                  reading: { type: Type.STRING },
                },
                required: ["form", "japanese", "reading"],
              },
            },
          },
          required: ["word", "reading", "meaning", "type", "example"],
        },
      },
    });

    const parsed = extractJson(response.text);
    if (parsed) geminiCache.set(cacheKey, parsed);
    return parsed;
  } catch (e: any) {
    if (e.message === "QUOTA_EXCEEDED" || e.message === "NETWORK_ERROR") {
      // Fallback: Return a basic structure even without AI
      const fallback: WordDetail = {
        word,
        reading,
        meaning,
        type: "词汇",
        example: {
          japanese: "（AI 分析失败，暂无例句）",
          reading: "",
          chinese: "AI 分析失败，可能是由于网络连接问题导致。"
        }
      };
      return fallback;
    }
    console.error("Failed to generate word detail", e);
    return null;
  }
};

const audioCache = new Map<string, string>();

export const generateAudio = async (text: string): Promise<string | null> => {
  if (!text || !text.trim()) return null;
  if (audioCache.has(text)) return audioCache.get(text) || null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Please read this Japanese text clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) audioCache.set(text, audioData);
    return audioData;
  } catch (e) {
    console.error("Failed to generate audio", e);
    return null;
  }
};

export const generateVocabulary = async (level: JLPTLevel): Promise<Vocabulary[]> => {
  const cacheKey = `vocab_basic_${level}`;
  const cached = geminiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await safeGenerateContent({
      model: currentGeminiModel,
      contents: `Generate 5 common Japanese vocabulary words for JLPT ${level} level. Provide the meaning in Chinese, and an example sentence with its reading and Chinese meaning.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              reading: { type: Type.STRING },
              meaning: { type: Type.STRING },
              example: { type: Type.STRING },
              exampleReading: { type: Type.STRING },
              exampleMeaning: { type: Type.STRING },
            },
            required: ["word", "reading", "meaning", "example", "exampleReading", "exampleMeaning"],
          },
        },
      }
    });

    const parsed = extractJson(response.text);
    const vocabArray = Array.isArray(parsed) ? parsed : [];
    if (vocabArray.length > 0) geminiCache.set(cacheKey, vocabArray);
    return vocabArray;
  } catch (e: any) {
    if (e.message === "QUOTA_EXCEEDED" || e.message === "NETWORK_ERROR") return [];
    console.error("Failed to generate vocabulary", e);
    return [];
  }
};

export const generateVocabularyList = async (level: JLPTLevel, page: number): Promise<Vocabulary[]> => {
  const cacheKey = `vocab_list_${level}_${page}`;
  const cached = geminiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await safeGenerateContent({
      model: currentGeminiModel,
      contents: `Generate a list of 50 common Japanese vocabulary words for JLPT ${level} level. 
      The words MUST be ordered by their frequency of appearance in the JLPT exam and daily life (most frequent words first). 
      For page ${page}, please provide the ${ (page - 1) * 50 + 1 }th to ${ page * 50 }th most frequent words for this level.
      Provide the word, its reading (hiragana), and its concise Chinese meaning. 
      Do not include example sentences. Ensure the words are appropriate for the ${level} level.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              reading: { type: Type.STRING },
              meaning: { type: Type.STRING },
            },
            required: ["word", "reading", "meaning"],
          },
        },
      }
    });

    const parsed = extractJson(response.text);
    const vocabArray = Array.isArray(parsed) ? parsed : [];
    if (vocabArray.length > 0) geminiCache.set(cacheKey, vocabArray);
    return vocabArray;
  } catch (e: any) {
    if (e.message === "QUOTA_EXCEEDED" || e.message === "NETWORK_ERROR") return [];
    console.error("Failed to generate vocabulary list", e);
    return [];
  }
};

export const translateBiDirectional = async (text: string, direction: 'zh-ja' | 'ja-zh'): Promise<{ translated: string; furigana?: string }> => {
  const cacheKey = `translate_${direction}_${text}`;
  const cached = geminiCache.get(cacheKey);
  if (cached) return cached;

  const isToJapanese = direction === 'zh-ja';
  const prompt = isToJapanese 
    ? `Translate this text to Japanese and provide the furigana (reading) for the Japanese text. Text: "${text}"`
    : `Translate this Japanese text to Chinese. Text: "${text}"`;

  try {
    const response = await safeGenerateContent({
      model: currentGeminiModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translated: { type: Type.STRING },
            furigana: { type: Type.STRING, description: "Only for Japanese text, use format: 漢字[かんじ]" },
          },
          required: ["translated"],
        },
      }
    });

    const parsed = extractJson(response.text);
    if (parsed) geminiCache.set(cacheKey, parsed);
    return parsed || { translated: "翻译失败" };
  } catch (e: any) {
    if (e.message === "QUOTA_EXCEEDED" || e.message === "NETWORK_ERROR") return { translated: "服务繁忙，请稍后再试" };
    console.error("Failed to translate", e);
    return { translated: "翻译失败" };
  }
};

export const translateWithFurigana = async (text: string): Promise<{ translated: string; furigana: string }> => {
  const cacheKey = `translate_furigana_${text}`;
  const cached = geminiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await safeGenerateContent({
      model: currentGeminiModel, 
      contents: `Translate this text to Japanese and provide the furigana (reading) for the Japanese text. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translated: { type: Type.STRING },
            furigana: { type: Type.STRING, description: "Use format: 漢字[かんじ]" },
          },
          required: ["translated", "furigana"],
        },
      }
    });

    const parsed = extractJson(response.text);
    if (parsed) geminiCache.set(cacheKey, parsed);
    return parsed || { translated: "翻译失败", furigana: "" };
  } catch (e: any) {
    if (e.message === "QUOTA_EXCEEDED" || e.message === "NETWORK_ERROR") return { translated: "服务暂时不可用", furigana: "" };
    console.error("Failed to translate with furigana", e);
    return { translated: "翻译失败", furigana: "" };
  }
};

export const generateGrammarPoints = async (level: JLPTLevel, page: number = 1): Promise<GrammarPoint[]> => {
  const cacheKey = `grammar_points_${level}_${page}`;
  const cached = geminiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await safeGenerateContent({
      model: currentGeminiModel,
      contents: `List 10 common JLPT ${level} grammar points (Page ${page}). For each point, provide its title, meaning (in Chinese), usage explanation (in Chinese), 3 example sentences (Japanese, reading, and Chinese translation), and 2 practice questions (Chinese sentence as prompt, and the correct Japanese translation/usage). Ensure these points are different from previous pages if applicable.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              meaning: { type: Type.STRING },
              usage: { type: Type.STRING },
              examples: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    japanese: { type: Type.STRING },
                    reading: { type: Type.STRING },
                    chinese: { type: Type.STRING },
                  },
                  required: ["japanese", "reading", "chinese"],
                },
              },
              practice: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    chinese: { type: Type.STRING },
                    japanese: { type: Type.STRING },
                  },
                  required: ["chinese", "japanese"],
                },
              },
            },
            required: ["title", "meaning", "usage", "examples", "practice"],
          },
        },
      }
    });

    const parsed = extractJson(response.text);
    const grammarArray = Array.isArray(parsed) ? parsed : [];
    const result = grammarArray.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
    }));
    if (result.length > 0) geminiCache.set(cacheKey, result);
    return result;
  } catch (e: any) {
    if (e.message === "QUOTA_EXCEEDED" || e.message === "NETWORK_ERROR") return [];
    console.error("Failed to generate grammar points", e);
    return [];
  }
};

export const generateReadingPassage = async (level: JLPTLevel, topic?: string): Promise<ReadingPassage> => {
  const topics = ["culture (文化)", "daily life (生活)", "society (社会)", "education (教育)", "environment (環境)"];
  const selectedTopic = topic || topics[Math.floor(Math.random() * topics.length)];
  const cacheKey = `reading_${level}_${selectedTopic}`;
  const cached = geminiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await safeGenerateContent({
      model: currentGeminiModel,
      contents: `You are a JLPT exam creator. Generate a realistic JLPT ${level} level reading comprehension passage. 
      Topic: ${selectedTopic}. 
      Requirements:
      1. The text should be appropriate for ${level} level in terms of vocabulary and grammar.
      2. Provide a title for the passage.
      3. Provide a multiple-choice question (MCQ) about the main idea or a specific detail.
      4. The MCQ must have 4 options (A, B, C, D) in Japanese.
      5. Provide the index of the correct answer (0 for A, 1 for B, 2 for C, 3 for D).
      6. Provide a clear explanation in Chinese for why that answer is correct.
      
      Return the result strictly in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            question: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                answerIndex: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
              },
              required: ["text", "options", "answerIndex", "explanation"],
            },
          },
          required: ["title", "content", "question"],
        },
      }
    });

    const parsed = extractJson(response.text);
    if (!parsed || !parsed.content) throw new Error("Invalid response format");

    const result = {
      id: Math.random().toString(36).substr(2, 9),
      level,
      ...parsed,
      source: `JLPT ${level} Simulation`
    };
    geminiCache.set(cacheKey, result);
    return result;
  } catch (e: any) {
    if (e.message === "QUOTA_EXCEEDED" || e.message === "NETWORK_ERROR") {
      return {
        id: "error-quota",
        level,
        title: "服务不可用",
        content: e.message === "QUOTA_EXCEEDED" ? "API 配额已超出限制，请稍后再试。" : "网络连接异常，无法访问 AI 服务，请检查网络后重试。",
        source: "System Error"
      } as ReadingPassage;
    }
    console.error("Failed to generate reading passage", e);
    // Return a more descriptive error object that the UI can handle
    return {
      id: "error-" + Date.now(),
      level,
      title: "内容生成失败",
      content: "抱歉，AI 暂时无法生成阅读内容。这可能是由于网络波动或 API 限制导致的。请点击下方的“重新生成”按钮重试。",
      source: "System Error"
    } as ReadingPassage;
  }
};

export const analyzeSelectedText = async (text: string, context: string): Promise<AnalysisResult> => {
  const cacheKey = `analyze_${text}`;
  const cached = geminiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await safeGenerateContent({
      model: currentGeminiModel,
      contents: `Analyze the following Japanese text selected from a reading passage. 
      Context: "${context}"
      Selected Text: "${text}"
      
      Tasks:
      1. Provide a natural Chinese translation of the selected text.
      2. Identify the key Japanese grammar points (语法点) used in this specific sentence.
      3. For each grammar point, provide:
         - "point": The grammar point name in Japanese (e.g., "~ている", "~はずだ").
         - "explanation": A detailed explanation in Chinese covering its meaning and usage in this context.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: { type: Type.STRING },
            grammarPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  point: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["point", "explanation"],
              },
            },
          },
          required: ["translation", "grammarPoints"],
        },
      }
    });

    const parsed = extractJson(response.text);
    const result = {
      translation: parsed?.translation || "解析失败",
      grammarPoints: Array.isArray(parsed?.grammarPoints) ? parsed.grammarPoints : []
    };
    if (parsed) geminiCache.set(cacheKey, result);
    return result;
  } catch (e: any) {
    if (e.message === "QUOTA_EXCEEDED" || e.message === "NETWORK_ERROR") {
      return { translation: "AI 服务暂时无法访问，请稍后再试", grammarPoints: [] };
    }
    console.error("Failed to analyze text", e);
    return { translation: "解析失败", grammarPoints: [] };
  }
};

export const generateKanaExamples = async (kana: string): Promise<Vocabulary[]> => {
  const cacheKey = `kana_examples_${kana}`;
  const cached = geminiCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await safeGenerateContent({
      model: currentGeminiModel,
      contents: `Generate 3 common Japanese vocabulary words that MUST contain the specific character "${kana}". Provide reading, meaning, and example.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              reading: { type: Type.STRING },
              meaning: { type: Type.STRING },
              example: { type: Type.STRING },
              exampleReading: { type: Type.STRING },
              exampleMeaning: { type: Type.STRING },
            },
            required: ["word", "reading", "meaning", "example", "exampleReading", "exampleMeaning"],
          },
        },
      }
    });

    const parsed = extractJson(response.text);
    const kanaArray = Array.isArray(parsed) ? parsed : [];
    if (kanaArray.length > 0) geminiCache.set(cacheKey, kanaArray);
    return kanaArray;
  } catch (e: any) {
    if (e.message === "QUOTA_EXCEEDED" || e.message === "NETWORK_ERROR") return [];
    console.error("Failed to generate kana examples", e);
    return [];
  }
};
