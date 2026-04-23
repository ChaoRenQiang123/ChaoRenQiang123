import { Vocabulary, JLPTLevel, ReadingPassage, AnalysisResult, GrammarPoint, WordDetail } from "../types";

// Helper to interact with the backend Kimi proxy
const fetchKimi = async (messages: any[], responseFormat?: any) => {
  const customKey = localStorage.getItem('sakura_custom_kimi_key');
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (customKey) {
    headers['x-api-key'] = customKey;
  }

  const response = await fetch("/api/kimi", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "moonshot-v1-8k",
      messages,
      response_format: responseFormat, // Moonshot supports json_object in some models
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to call Kimi API");
  }

  return await response.json();
};

export const generateWordDetailKimi = async (word: string, reading: string, meaning: string): Promise<WordDetail | null> => {
  try {
    const systemPrompt = `Analyze the Japanese word "${word}" (reading: ${reading}, meaning: ${meaning}). 
      1. Identify its word type (e.g., Verb, Adjective, Noun).
      2. Provide a natural example sentence in Japanese, its reading, and Chinese translation.
      3. If it's a verb or adjective, provide common conjugations. 
         For verbs, include: て形, 否定形, 过去形, 礼貌形, 使役形, 被动形, 可能形, 假定形 (only if applicable).
         Use Chinese labels for all conjugation forms.
      Return the result in JSON format with fields: word, reading, meaning, type, example (object with japanese, reading, chinese), and conjugations (array of objects with form, japanese, reading).`;

    const data = await fetchKimi([
      { role: "system", content: "You are a Japanese language expert. Always respond in valid JSON." },
      { role: "user", content: systemPrompt }
    ]);

    const content = data.choices[0].message.content;
    return JSON.parse(extractJson(content));
  } catch (e) {
    console.error("Kimi word detail failed:", e);
    return null;
  }
};

// Helper to extract JSON (same as gemini.ts)
const extractJson = (text: string) => {
  if (!text) return "";
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
  
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  const firstBracket = jsonStr.indexOf('[');
  const lastBracket = jsonStr.lastIndexOf(']');
  
  if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    return jsonStr.substring(firstBrace, lastBrace + 1);
  } else if (firstBracket !== -1 && lastBracket !== -1) {
    return jsonStr.substring(firstBracket, lastBracket + 1);
  }
  return jsonStr;
};

export const translateKimi = async (text: string, direction: 'zh-ja' | 'ja-zh'): Promise<{ translated: string; furigana?: string }> => {
  const isToJapanese = direction === 'zh-ja';
  const systemPrompt = isToJapanese 
    ? `Translate this text to Japanese and provide the furigana (reading) for the Japanese text. Return JSON with 'translated' and 'furigana' (format: 漢字[かんじ]).`
    : `Translate this Japanese text to Chinese. Return JSON with 'translated' field.`;

  try {
    const data = await fetchKimi([
      { role: "system", content: "You are a professional translator. Always respond in JSON." },
      { role: "user", content: `${systemPrompt} Text: "${text}"` }
    ]);
    const content = data.choices[0].message.content;
    return JSON.parse(extractJson(content));
  } catch (e) {
    console.error("Kimi translate failed:", e);
    return { translated: "翻译失败" };
  }
};

export const generateGrammarKimi = async (level: JLPTLevel, page: number): Promise<GrammarPoint[]> => {
  try {
    const data = await fetchKimi([
      { role: "system", content: "You are a JLPT exam expert. Always respond in JSON." },
      { role: "user", content: `List 10 common JLPT ${level} grammar points (Page ${page}). For each point, provide its title, meaning (in Chinese), usage explanation (in Chinese), 3 example sentences (Japanese, reading, and Chinese translation), and 2 practice questions (Chinese sentence as prompt, and the correct Japanese translation/usage). Return as a JSON array.` }
    ]);
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(extractJson(content));
    return parsed.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
    }));
  } catch (e) {
    console.error("Kimi grammar failed:", e);
    return [];
  }
};

export const generateReadingKimi = async (level: JLPTLevel, topic: string): Promise<ReadingPassage | null> => {
  try {
    const data = await fetchKimi([
      { role: "system", content: "You are a JLPT exam creator. Always respond in JSON." },
      { role: "user", content: `Generate a realistic JLPT ${level} level reading comprehension passage. Topic: ${topic}. Include title, content, and a multiple-choice question with options, answerIndex (0-3), and explanation in Chinese.` }
    ]);
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(extractJson(content));
    return {
      id: Math.random().toString(36).substr(2, 9),
      level,
      ...parsed,
      source: `Kimi JLPT ${level} Simulation`
    };
  } catch (e) {
    console.error("Kimi reading failed:", e);
    return null;
  }
};

export const analyzeReadingKimi = async (text: string, context: string): Promise<AnalysisResult | null> => {
  try {
    const data = await fetchKimi([
      { role: "system", content: "You are a Japanese linguist. Always respond in JSON." },
      { role: "user", content: `Analyze the following Japanese text: "${text}" in the context of "${context}". Provide translation in Chinese and identify key grammar points with point name and explanation.` }
    ]);
    const content = data.choices[0].message.content;
    return JSON.parse(extractJson(content));
  } catch (e) {
    console.error("Kimi analyze failed:", e);
    return null;
  }
};

export const generateVocabularyKimi = async (level: JLPTLevel): Promise<Vocabulary[]> => {
  try {
    const data = await fetchKimi([
      { role: "system", content: "You are a Japanese educator. Always respond in JSON." },
      { role: "user", content: `Generate 5 common Japanese vocabulary words for JLPT ${level} level. Include meaning in Chinese, and an example sentence with reading and Chinese meaning. Return as a JSON array with fields: word, reading, meaning, example, exampleReading, exampleMeaning.` }
    ]);
    const content = data.choices[0].message.content;
    return JSON.parse(extractJson(content));
  } catch (e) {
    console.error("Kimi vocabulary failed:", e);
    return [];
  }
};
