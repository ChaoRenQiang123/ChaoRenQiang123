import React, { useState, useEffect } from 'react';
import { Vocabulary, JLPTLevel, WordDetail } from '../types';
import { generateWordDetail } from '../services/gemini';
import { prefetchVocabulary } from '../services/dataService';
import { RefreshCw, ChevronLeft, ChevronRight, List, X, Info, BookOpen, Loader2, Search as SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VocabularyList: React.FC = () => {
  const [level, setLevel] = useState<JLPTLevel>('N5');
  const [words, setWords] = useState<Vocabulary[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWords = async (newLevel: JLPTLevel = level, newPage: number = page, forceRefresh: boolean = false) => {
    setLoading(true);
    try {
      const data = await prefetchVocabulary(newLevel, newPage, forceRefresh);
      if (data && data.length > 0) {
        setWords(data);
        // Pre-fetch next page
        prefetchVocabulary(newLevel, newPage + 1);
      }
    } catch (error) {
      console.error("Failed to fetch vocabulary", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [level, page]);

  const handleLevelChange = (newLevel: JLPTLevel) => {
    setLevel(newLevel);
    setPage(1);
    setSearchQuery('');
  };

  const handleRefresh = () => {
    fetchWords(level, page, true);
  };

  const handleWordClick = async (word: Vocabulary) => {
    // 先清除之前的选择，确保状态转换平滑
    setSelectedWord(null);
    setDetailLoading(false);

    // 如果单词已经包含本地详细信息（来自静态数据包或已缓存的结果），直接呈现
    if (word.example && word.exampleReading && word.exampleMeaning) {
      setSelectedWord({
        word: word.word,
        reading: word.reading,
        meaning: word.meaning,
        type: '核心词汇',
        example: {
          japanese: word.example,
          reading: word.exampleReading,
          chinese: word.exampleMeaning
        },
        conjugations: []
      });
      return;
    }

    // 否则，启动 AI 分析
    setDetailLoading(true);
    try {
      const detail = await generateWordDetail(word.word, word.reading, word.meaning);
      if (detail) {
        setSelectedWord(detail);
      }
    } catch (error) {
      console.error("Failed to fetch word detail", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredWords = words.filter(item => 
    item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reading.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20 h-full flex flex-col relative" id="vocabulary-list">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sakura-pink/10 rounded-xl">
            <List size={20} className="text-sakura-rose" />
          </div>
          <h2 className="text-2xl font-serif italic text-sakura-deep">核心单词表</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-sakura-pink/40" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索单词、读音或释义..."
              className="w-full pl-10 pr-4 py-2 bg-sakura-pink/5 border border-sakura-pink/10 rounded-full text-sm focus:outline-none focus:border-sakura-pink/40 text-sakura-deep placeholder:text-sakura-pink/30 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sakura-pink/40 hover:text-sakura-rose"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-sakura-pink/10 p-1 rounded-full">
              {(['N5', 'N4', 'N3'] as JLPTLevel[]).map((l) => (
                <button
                  key={l}
                  onClick={() => handleLevelChange(l)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-all ${level === l ? 'bg-white shadow-sm text-sakura-rose font-bold' : 'text-sakura-rose/40 hover:text-sakura-rose'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleRefresh}
              disabled={loading}
              title="重新生成当前页"
              className="p-2 hover:bg-sakura-pink/10 rounded-full transition-all text-sakura-rose disabled:opacity-30"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-sakura-pink">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-sm font-serif italic">正在获取单词列表...</p>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-sakura-pink/40">
            <SearchIcon size={40} className="opacity-20" />
            <p className="text-sm font-serif italic">未找到匹配的单词</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
            <AnimatePresence mode="popLayout">
              {filteredWords.map((item, index) => (
                <motion.div
                  key={`${item.word}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => handleWordClick(item)}
                  className="flex items-center justify-between p-3 border-b border-sakura-pink/5 hover:bg-sakura-pink/5 rounded-lg transition-colors group cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-sakura-deep group-hover:text-sakura-rose transition-colors">{item.word}</span>
                    <span className="text-xs text-sakura-rose/40 font-serif italic">{item.reading}</span>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-sm text-stone-600">{item.meaning}</span>
                    <Info size={14} className="text-sakura-pink/20 group-hover:text-sakura-rose transition-colors" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-sakura-pink/10 flex items-center justify-center gap-6">
        <button
          onClick={() => setPage(prev => Math.max(1, prev - 1))}
          disabled={page === 1 || loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${page === 1 || loading ? 'opacity-30 cursor-not-allowed border-sakura-pink/10' : 'border-sakura-pink/20 hover:bg-sakura-pink/10 text-sakura-rose'}`}
        >
          <ChevronLeft size={18} />
          上一页
        </button>
        <span className="text-sakura-rose/40 font-mono text-sm">
          第 {page} 页
        </span>
        <button
          onClick={() => setPage(prev => prev + 1)}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${loading ? 'opacity-30 cursor-not-allowed border-sakura-pink/10' : 'border-sakura-pink/20 hover:bg-sakura-pink/10 text-sakura-rose'}`}
        >
          下一页
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Word Detail Modal */}
      <AnimatePresence>
        {(selectedWord || detailLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md rounded-3xl p-8 flex flex-col"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sakura-pink/10 rounded-xl">
                  <BookOpen size={24} className="text-sakura-rose" />
                </div>
                <h3 className="text-2xl font-serif italic text-sakura-deep">单词详情</h3>
              </div>
              <button 
                onClick={() => setSelectedWord(null)}
                className="p-2 hover:bg-sakura-pink/10 rounded-full transition-all text-sakura-rose"
              >
                <X size={24} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-sakura-pink">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="font-serif italic text-lg">AI 正在分析单词...</p>
              </div>
            ) : selectedWord && (
              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8">
                <div className="flex flex-col md:flex-row md:items-end gap-4 border-b border-sakura-pink/10 pb-6">
                  <div className="flex flex-col">
                    <span className="text-xs text-sakura-rose/60 font-mono uppercase tracking-widest mb-1">单词</span>
                    <span className="text-4xl font-bold text-sakura-deep">{selectedWord.word}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-sakura-rose/60 font-mono uppercase tracking-widest mb-1">读音</span>
                    <span className="text-xl text-sakura-rose font-serif italic">{selectedWord.reading}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-sakura-rose/60 font-mono uppercase tracking-widest mb-1">词性</span>
                    <span className="px-3 py-0.5 bg-sakura-pink/10 text-sakura-rose text-sm rounded-full font-medium">{selectedWord.type}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-mono uppercase tracking-widest text-sakura-pink/40 mb-4">释义</h4>
                  <p className="text-xl text-stone-700">{selectedWord.meaning}</p>
                </div>

                <div>
                  <h4 className="text-sm font-mono uppercase tracking-widest text-sakura-pink/40 mb-4">例句</h4>
                  <div className="bg-sakura-pink/5 p-6 rounded-2xl border border-sakura-pink/10">
                    <p className="text-xl font-serif text-sakura-deep mb-2">{selectedWord.example.japanese}</p>
                    <p className="text-sm text-sakura-rose/60 italic mb-4">{selectedWord.example.reading}</p>
                    <p className="text-stone-600">{selectedWord.example.chinese}</p>
                  </div>
                </div>

                {selectedWord.conjugations && selectedWord.conjugations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-mono uppercase tracking-widest text-sakura-pink/40 mb-4">活用变形</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedWord.conjugations.map((conj, i) => (
                        <div key={i} className="p-4 bg-white border border-sakura-pink/10 rounded-xl shadow-sm flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-sakura-rose/40 font-bold mb-1">{conj.form}</span>
                            <span className="text-lg font-bold text-sakura-deep">{conj.japanese}</span>
                          </div>
                          <span className="text-xs text-sakura-rose/60 font-serif italic">{conj.reading}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 183, 197, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 183, 197, 0.4);
        }
      `}</style>
    </div>
  );
};
