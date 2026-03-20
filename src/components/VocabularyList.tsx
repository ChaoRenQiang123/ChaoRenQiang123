import React, { useState, useEffect } from 'react';
import { Vocabulary, JLPTLevel } from '../types';
import { generateVocabularyList } from '../services/gemini';
import { RefreshCw, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VocabularyList: React.FC = () => {
  const [level, setLevel] = useState<JLPTLevel>('N3');
  const [words, setWords] = useState<Vocabulary[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchWords = async (newLevel: JLPTLevel = level, newPage: number = page, forceRefresh: boolean = false) => {
    const cacheKey = `sakura_vocab_v2_${newLevel}_${newPage}`;
    
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          setWords(JSON.parse(cachedData));
          return;
        } catch (e) {
          console.error("Failed to parse cached vocabulary", e);
        }
      }
    }

    setLoading(true);
    const data = await generateVocabularyList(newLevel, newPage);
    if (data && data.length > 0) {
      setWords(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWords();
  }, [level, page]);

  const handleLevelChange = (newLevel: JLPTLevel) => {
    setLevel(newLevel);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchWords(level, page, true);
  };

  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20 h-full flex flex-col" id="vocabulary-list">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sakura-pink/10 rounded-xl">
            <List size={20} className="text-sakura-rose" />
          </div>
          <h2 className="text-2xl font-serif italic text-sakura-deep">核心单词表</h2>
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

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-sakura-pink">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-sm font-serif italic">正在获取单词列表...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
            <AnimatePresence mode="popLayout">
              {words.map((item, index) => (
                <motion.div
                  key={`${item.word}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.01 }}
                  className="flex items-center justify-between p-3 border-b border-sakura-pink/5 hover:bg-sakura-pink/5 rounded-lg transition-colors group"
                >
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-sakura-deep group-hover:text-sakura-rose transition-colors">{item.word}</span>
                    <span className="text-xs text-sakura-rose/40 font-serif italic">{item.reading}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-stone-600">{item.meaning}</span>
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
