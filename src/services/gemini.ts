import { Type, Modality } from "@google/genai";
import { Vocabulary, JLPTLevel, ReadingPassage, AnalysisResult, GrammarPoint, WordDetail } from "../types";

// Helper to call Gemini API via backend proxy
const callGeminiApi = async (params: { model?: string; contents: any; config?: any }) => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || "Failed to fetch from Gemini proxy");
    }

    return await response.json();
  } catch (error) {
    console.error("Gemini API Proxy Error:", error);
    throw error;
  }
};

// Helper to extract JSON from model response
const extractJson = (text: string) => {
  if (!text) return null;
  // Remove markdown code blocks if present
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response:", e, "Original text:", text);
    return null;
  }
};

export const generateWordDetail = async (word: string, reading: string, meaning: string): Promise<WordDetail | null> => {
  try {
    const data = await callGeminiApi({
      model: "gemini-1.5-flash",
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
            type: { type: Type.STRING, description: "Word type, e.g., '动词', 'い形容词', 'な形容词', '名词'" },
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
                  form: { type: Type.STRING, description: "e.g., 'て形', '否定形', '使役形', '被动形'" },
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

    return extractJson(data.text);
  } catch (e) {
    console.error("Failed to parse word detail", e);
    return null;
  }
};

// Simple in-memory cache for audio data to improve performance on repeated requests
const audioCache = new Map<string, string>();

export const generateAudio = async (text: string): Promise<string | null> => {
  if (!text || !text.trim()) return null;
  
  // Check cache first
  if (audioCache.has(text)) {
    return audioCache.get(text) || null;
  }

  try {
    const data = await callGeminiApi({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Please read this Japanese text clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    
    if (audioData) {
      audioCache.set(text, audioData);
    }
    
    return audioData;
  } catch (e) {
    console.error("Failed to generate audio", e);
    return null;
  }
};

export const generateVocabulary = async (level: JLPTLevel): Promise<Vocabulary[]> => {
  try {
    const data = await callGeminiApi({
      model: "gemini-1.5-flash",
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
      },
    });

    return extractJson(data.text) || [];
  } catch (e) {
    console.error("Failed to parse vocabulary", e);
    return [];
  }
};

export const generateVocabularyList = async (level: JLPTLevel, page: number): Promise<Vocabulary[]> => {
  try {
    const data = await callGeminiApi({
      model: "gemini-1.5-flash",
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
      },
    });

    return extractJson(data.text) || [];
  } catch (e) {
    console.error("Failed to parse vocabulary list", e);
    return [];
  }
};

export const translateBiDirectional = async (text: string, direction: 'zh-ja' | 'ja-zh'): Promise<{ translated: string; furigana?: string }> => {
  const isToJapanese = direction === 'zh-ja';
  const prompt = isToJapanese 
    ? `Translate this text to Japanese and provide the furigana (reading) for the Japanese text. Text: "${text}"`
    : `Translate this Japanese text to Chinese. Text: "${text}"`;

  try {
    const data = await callGeminiApi({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translated: { type: Type.STRING, description: isToJapanese ? "The Japanese translation" : "The Chinese translation" },
            furigana: { type: Type.STRING, description: "The Japanese text with furigana in brackets, e.g., 漢字[かんじ]. Only provide if translating to Japanese." },
          },
          required: ["translated"],
        },
      },
    });

    return extractJson(data.text) || { translated: "" };
  } catch (e) {
    console.error("Failed to parse translation", e);
    return { translated: "" };
  }
};

export const translateWithFurigana = async (text: string): Promise<{ translated: string; furigana: string }> => {
  try {
    const data = await callGeminiApi({
      model: "gemini-1.5-flash",
      contents: `Translate this text to Japanese and provide the furigana (reading) for the Japanese text. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translated: { type: Type.STRING, description: "The Japanese translation" },
            furigana: { type: Type.STRING, description: "The Japanese text with furigana in brackets, e.g., 漢字[かんじ]" },
          },
          required: ["translated", "furigana"],
        },
      },
    });

    return extractJson(data.text) || { translated: "", furigana: "" };
  } catch (e) {
    console.error("Failed to parse translation", e);
    return { translated: "", furigana: "" };
  }
};

export const generateGrammarPoints = async (level: JLPTLevel): Promise<GrammarPoint[]> => {
  try {
    const data = await callGeminiApi({
      model: "gemini-1.5-flash",
      contents: `List 10 common JLPT ${level} grammar points. For each point, provide its title, meaning (in Chinese), usage explanation (in Chinese), 3 example sentences (Japanese, reading, and Chinese translation), and 2 practice questions (Chinese sentence as prompt, and the correct Japanese translation/usage).`,
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
      },
    });

    const parsed = extractJson(data.text) || [];
    return parsed.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
    }));
  } catch (e) {
    console.error("Failed to parse grammar points", e);
    return [];
  }
};

export const generateReadingPassage = async (level: JLPTLevel, topic?: string): Promise<ReadingPassage> => {
  const topics = [
    "politics (政治)", "economy (経済)", "culture (文化)", "daily life (生活)", 
    "history (历史)", "basic science (基础科学)", "environment (环境)", 
    "education (教育)", "society (社会)", "art (艺术)"
  ];
  const selectedTopic = topic || topics[Math.floor(Math.random() * topics.length)];

  try {
    const data = await callGeminiApi({
      model: "gemini-1.5-flash",
      contents: `Generate a realistic JLPT ${level} level reading comprehension passage. 
      The topic should be related to ${selectedTopic}. It should be similar to actual exam questions in style and difficulty. 
      Provide a title, the full text in Japanese, and one multiple-choice question about the main idea (主旨) of the passage with 4 options (A, B, C, D) in Japanese, the index of the correct answer (0-3), and a brief explanation in Chinese.`,
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
                text: { type: Type.STRING, description: "The question text in Japanese" },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "4 options in Japanese"
                },
                answerIndex: { type: Type.INTEGER, description: "Correct answer index (0-3)" },
                explanation: { type: Type.STRING, description: "Explanation in Chinese" }
              },
              required: ["text", "options", "answerIndex", "explanation"]
            }
          },
          required: ["title", "content", "question"],
        },
      },
    });

    const parsed = extractJson(data.text) || { title: "", content: "" };
    return {
      id: Math.random().toString(36).substr(2, 9),
      level,
      ...parsed,
      source: `JLPT ${level} Simulation`
    };
  } catch (e) {
    console.error("Failed to parse reading passage", e);
    return {
      id: Math.random().toString(36).substr(2, 9),
      level,
      title: "Error",
      content: "Failed to load content",
      source: "Error"
    } as ReadingPassage;
  }
};

export const analyzeSelectedText = async (text: string, context: string): Promise<AnalysisResult> => {
  try {
    const data = await callGeminiApi({
      model: "gemini-1.5-flash",
      contents: `Analyze the following Japanese text selected from a reading passage. 
      Context: "${context}"
      Selected Text: "${text}"
      Provide a Chinese translation and explain the key grammar points involved in Chinese.`,
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
      },
    });

    return extractJson(data.text) || { translation: "", grammarPoints: [] };
  } catch (e) {
    console.error("Failed to parse analysis", e);
    return { translation: "", grammarPoints: [] };
  }
};

export const generateKanaExamples = async (kana: string): Promise<Vocabulary[]> => {
  const isKatakana = /[\u30A0-\u30FF]/.test(kana);
  const prompt = `Generate 3 common Japanese vocabulary words that MUST contain the specific character "${kana}". 
    CRITICAL: The character "${kana}" MUST appear in the word exactly as written. 
    ${isKatakana 
      ? `Since "${kana}" is a Katakana character, the words MUST be Katakana words (loanwords/Gairaigo). Do NOT use Hiragana words for Katakana characters.` 
      : `Since "${kana}" is a Hiragana character, the words MUST be Hiragana words or Kanji words containing this Hiragana.`
    }
    For each word, provide its reading (hiragana), meaning (Chinese), and an example sentence with its reading and meaning.`;

  try {
    const data = await callGeminiApi({
      model: "gemini-1.5-flash",
      contents: prompt,
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
      },
    });

    return extractJson(data.text) || [];
  } catch (e) {
    console.error("Failed to parse kana examples", e);
    return [];
  }
};
