import React, { useState, useEffect, useRef } from 'react';
import { ReadingPassage, JLPTLevel, AnalysisResult, SavedItem } from '../types';
import { analyzeSelectedText } from '../services/gemini';
import { prefetchReading } from '../services/dataService';
import { BookOpen, Search, Bookmark, Loader2, RefreshCw, Trash2, CheckCircle2, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ReadingAnalysis: React.FC = () => {
  const [level, setLevel] = useState<JLPTLevel>('N5');
  const [topic, setTopic] = useState<string>('');
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selection, setSelection] = useState<{ text: string; result: AnalysisResult | null } | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    const saved = localStorage.getItem('sakura_saved_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaved, setShowSaved] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const topics = [
    { value: '', label: '随机题材' },
    { value: 'politics (政治)', label: '政治' },
    { value: 'economy (経済)', label: '经济' },
    { value: 'culture (文化)', label: '文化' },
    { value: 'daily life (生活)', label: '日常生活' },
    { value: 'history (歴史)', label: '历史' },
    { value: 'basic science (基礎科学)', label: '基础科学' },
    { value: 'environment (環境)', label: '环境' },
    { value: 'education (教育)', label: '教育' },
    { value: 'society (社会)', label: '社会' },
    { value: 'art (芸術)', label: '艺术' }
  ];

  useEffect(() => {
    fetchPassage();
  }, [level, topic]);

  useEffect(() => {
    localStorage.setItem('sakura_saved_items', JSON.stringify(savedItems));
  }, [savedItems]);

  const fetchPassage = async (forceRefresh = false) => {
    setLoading(true);
    setSelection(null);
    setShowAnswer(false);
    setSelectedOption(null);
    try {
      const data = await prefetchReading(level, forceRefresh, topic || undefined);
      if (data && data.title === "内容生成失败" && !forceRefresh) {
        // If we got a cached error, try to refresh once automatically
        const freshData = await prefetchReading(level, true, topic || undefined);
        setPassage(freshData);
      } else {
        setPassage(data);
      }
    } catch (error) {
      console.error("Failed to fetch reading passage", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSelection = async () => {
    const selectionObj = window.getSelection();
    const selectedText = selectionObj?.toString().trim();
    
    if (selectedText && passage) {
      setAnalyzing(true);
      setShowSaved(false); // Switch to analysis view if it was showing saved items
      setSelection({ text: selectedText, result: null });
      
      try {
        // 1. Check for offline annotations first
        let result: AnalysisResult | null = null;
        if (passage.annotations) {
          // Exact match
          if (passage.annotations[selectedText]) {
            result = passage.annotations[selectedText];
          } 
          // Loose match (case-insensitive or whitespace-agnostic if needed, but here Japanese is strict)
          else {
            const key = Object.keys(passage.annotations).find(k => 
              k.includes(selectedText) || selectedText.includes(k)
            );
            if (key && (selectedText.length > 5 || key.length > 5)) { // Prevent too short matches
              result = passage.annotations[key];
            }
          }
        }

        if (!result) {
          result = await analyzeSelectedText(selectedText, passage.content);
        }
        
        setSelection({ text: selectedText, result });
      } catch (error) {
        console.error("Analysis failed", error);
        setSelection({ text: selectedText, result: { translation: "解析失败", grammarPoints: [] } });
      } finally {
        setAnalyzing(false);
      }
    } else if (!selectedText && selection) {
      // Optional: Clear selection if clicking empty space? 
      // For now, let's keep it so the user can still see the last analysis.
    }
  };

  const saveItem = (type: 'sentence' | 'grammar', text: string, translation: string, grammarPoints?: any) => {
    const newItem: SavedItem = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      translation,
      grammarPoints,
      type,
      timestamp: Date.now(),
    };
    setSavedItems([newItem, ...savedItems]);
  };

  const removeSavedItem = (id: string) => {
    setSavedItems(savedItems.filter(item => item.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="reading-analysis">
      {/* Left Column: Passage */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20 min-h-[400px] md:min-h-[500px] flex flex-col">
          <div className="flex flex-col gap-2 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sakura-pink/10 rounded-xl">
                  <BookOpen size={20} className="text-sakura-rose" />
                </div>
                <h2 className="text-2xl font-serif italic text-sakura-deep flex items-center gap-2">
                  模拟真题阅读
                  <div className="group relative">
                    <Info size={14} className="text-sakura-rose/30 cursor-help hover:text-sakura-rose transition-colors" />
                    <div className="absolute left-0 top-full mt-2 w-48 p-2 bg-white rounded-xl shadow-xl border border-sakura-pink/20 text-[10px] text-sakura-rose/60 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      💡 选中文章中的任意句子或单词，AI 将为您提供即时的语法解析和翻译。
                    </div>
                  </div>
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <select 
                  value={level} 
                  onChange={(e) => setLevel(e.target.value as JLPTLevel)}
                  className="bg-white border border-sakura-pink/20 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-sakura-pink/40 text-sakura-deep"
                >
                  {['N5', 'N4', 'N3', 'N2', 'N1'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-white border border-sakura-pink/20 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-sakura-pink/40 text-sakura-deep"
                >
                  {topics.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <button onClick={() => fetchPassage(true)} className="p-2 hover:bg-sakura-pink/10 rounded-full transition-all text-sakura-rose">
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sakura-pink/5 rounded-xl border border-sakura-pink/10">
              <Sparkles size={12} className="text-sakura-rose animate-pulse" />
              <p className="text-[10px] md:text-xs text-sakura-rose/60 font-serif italic">
                涂黑选中文字即可查看 AI 深度解析
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-sakura-pink/40 gap-4">
              <Loader2 className="animate-spin w-10 h-10" />
              <p className="font-serif italic">正在加载阅读材料...</p>
            </div>
          ) : passage && passage.content ? (
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-sakura-deep mb-6 text-center">{passage.title}</h3>
              <div 
                className="text-base md:text-lg leading-relaxed text-sakura-deep font-serif whitespace-pre-wrap selection:bg-sakura-rose selection:text-white cursor-text"
                onMouseUp={handleTextSelection}
                onTouchEnd={handleTextSelection}
              >
                {passage.content}
              </div>

              {/* MCQ Section */}
              {passage.question && (
                <div className="mt-12 p-6 bg-sakura-light/50 rounded-2xl border border-sakura-pink/10">
                  <div className="flex items-center gap-2 mb-4 text-sakura-deep">
                    <div className="w-6 h-6 bg-sakura-rose text-white rounded-full flex items-center justify-center text-xs font-bold">Q</div>
                    <h4 className="font-bold">主旨理解</h4>
                  </div>
                  <p className="text-sakura-deep mb-6 font-medium">{passage.question.text}</p>
                  <div className="space-y-3">
                    {passage.question.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedOption(index);
                          setShowAnswer(true);
                        }}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                          showAnswer 
                            ? index === passage.question!.answerIndex
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : selectedOption === index
                                ? 'bg-rose-50 border-rose-200 text-rose-700'
                                : 'bg-white border-sakura-pink/10 text-sakura-deep/60'
                            : 'bg-white border-sakura-pink/10 hover:border-sakura-rose text-sakura-deep hover:shadow-sm'
                        }`}
                      >
                        <span className="font-mono font-bold mt-0.5">{String.fromCharCode(65 + index)}.</span>
                        <span>{option}</span>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {showAnswer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 pt-6 border-t border-sakura-pink/10"
                      >
                        <div className="flex items-center gap-2 mb-2 text-emerald-600 font-bold">
                          <CheckCircle2 size={18} />
                          <span>正确答案：{String.fromCharCode(65 + passage.question!.answerIndex)}</span>
                        </div>
                        <p className="text-sm text-sakura-deep/70 leading-relaxed bg-white/50 p-4 rounded-xl italic">
                          {passage.question.explanation}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-sakura-pink/40 gap-4">
              <BookOpen size={48} className="opacity-20" />
              <p className="font-serif italic">未能加载阅读材料，请尝试刷新</p>
              <button 
                onClick={() => fetchPassage(true)}
                className="px-6 py-2 bg-sakura-rose text-white rounded-full hover:bg-sakura-rose/90 transition-all shadow-lg shadow-sakura-pink/20"
              >
                重新生成
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Analysis & Saved */}
      <div className="space-y-6">
        {/* Analysis Panel */}
        <div className="p-6 bg-sakura-deep text-white rounded-3xl shadow-xl min-h-[300px] shadow-sakura-pink/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Search size={18} className="text-sakura-pink/30" />
              <h3 className="text-sm font-mono uppercase tracking-widest text-sakura-pink/30">Analysis</h3>
            </div>
            <button 
              onClick={() => setShowSaved(!showSaved)}
              className="text-xs flex items-center gap-1 text-sakura-pink/50 hover:text-white transition-all"
            >
              <Bookmark size={14} />
              {showSaved ? '查看解析' : `收藏夹 (${savedItems.length})`}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showSaved ? (
              <motion.div 
                key="saved"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h4 className="text-lg font-serif italic mb-4">我的收藏</h4>
                {savedItems.length === 0 ? (
                  <p className="text-sakura-pink/20 text-sm italic">暂无收藏内容</p>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                    {savedItems.map(item => (
                      <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 group">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${item.type === 'sentence' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'}`}>
                            {item.type === 'sentence' ? '句子' : '语法'}
                          </span>
                          <button onClick={() => removeSavedItem(item.id)} className="opacity-0 group-hover:opacity-100 text-sakura-pink/30 hover:text-sakura-rose transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-medium mb-1">{item.text}</p>
                        <p className="text-xs text-sakura-pink/60">{item.translation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : selection ? (
              <motion.div 
                key="analysis"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-sakura-pink/30 uppercase tracking-widest">Selected</span>
                    {selection.result && (
                      <button 
                        onClick={() => {
                          const isSaved = savedItems.some(item => item.text === selection.text && item.type === 'sentence');
                          if (isSaved) {
                            const item = savedItems.find(item => item.text === selection.text && item.type === 'sentence');
                            if (item) removeSavedItem(item.id);
                          } else {
                            saveItem('sentence', selection.text, selection.result!.translation, selection.result!.grammarPoints);
                          }
                        }}
                        className={`${savedItems.some(item => item.text === selection.text && item.type === 'sentence') ? 'text-yellow-400' : 'text-sakura-pink/30'} hover:text-yellow-400 transition-all`}
                      >
                        <Bookmark size={16} fill={savedItems.some(item => item.text === selection.text && item.type === 'sentence') ? 'currentColor' : 'none'} />
                      </button>
                    )}
                  </div>
                  <p className="text-lg font-serif italic leading-snug">{selection.text}</p>
                </div>

                {analyzing ? (
                  <div className="flex items-center gap-3 text-sakura-pink/30 py-8">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm italic">AI 正在解析中...</span>
                  </div>
                ) : selection.result ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div>
                      <span className="text-[10px] text-sakura-pink/30 uppercase tracking-widest block mb-2">Translation</span>
                      <p className="text-sm text-white/80 leading-relaxed">{selection.result.translation}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-sakura-pink/30 uppercase tracking-widest block mb-3">Grammar Points</span>
                      <div className="space-y-4">
                        {selection.result.grammarPoints?.map((gp, i) => (
                          <div key={i} className="relative pl-4 border-l border-white/10">
                            <div className="flex justify-between items-center mb-1">
                              <h5 className="text-sm font-bold text-emerald-400">{gp.point}</h5>
                              <button 
                                onClick={() => {
                                  const isSaved = savedItems.some(item => item.text === gp.point && item.type === 'grammar');
                                  if (isSaved) {
                                    const item = savedItems.find(item => item.text === gp.point && item.type === 'grammar');
                                    if (item) removeSavedItem(item.id);
                                  } else {
                                    saveItem('grammar', gp.point, gp.explanation);
                                  }
                                }}
                                className={`${savedItems.some(item => item.text === gp.point && item.type === 'grammar') ? 'text-yellow-400' : 'text-sakura-pink/20'} hover:text-yellow-400 transition-all`}
                              >
                                <Bookmark size={14} fill={savedItems.some(item => item.text === gp.point && item.type === 'grammar') ? 'currentColor' : 'none'} />
                              </button>
                            </div>
                            <p className="text-xs text-sakura-pink/60 leading-relaxed">{gp.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-sakura-pink/10 text-center py-20">
                <Search size={40} className="mb-4 opacity-20" />
                <p className="text-sm italic">请在左侧文章中选中文字</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
