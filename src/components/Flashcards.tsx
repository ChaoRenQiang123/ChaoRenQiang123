import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Vocabulary, JLPTLevel } from '../types';
import { generateVocabulary } from '../services/aiService';
import { RefreshCw, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';

export const Flashcards: React.FC = () => {
  const [level, setLevel] = useState<JLPTLevel>('N3');
  const [cards, setCards] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCards = async (newLevel: JLPTLevel = level) => {
    setLoading(true);
    const data = await generateVocabulary(newLevel);
    setCards(data);
    setCurrentIndex(0);
    setIsFlipped(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleLevelChange = (newLevel: JLPTLevel) => {
    setLevel(newLevel);
    fetchCards(newLevel);
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20 h-full flex flex-col" id="flashcards">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif italic text-sakura-deep">AI 单词卡片</h2>
        <div className="flex gap-1 bg-sakura-pink/10 p-1 rounded-full overflow-x-auto no-scrollbar">
          {(['N3', 'N2', 'N1'] as JLPTLevel[]).map((l) => (
            <button
              key={l}
              onClick={() => handleLevelChange(l)}
              className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${level === l ? 'bg-white shadow-sm text-sakura-rose font-bold' : 'text-sakura-rose/40 hover:text-sakura-rose'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-sakura-pink">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-sm font-serif italic">正在生成卡片...</p>
          </div>
        ) : cards.length > 0 ? (
          <>
            <div className="relative w-full max-w-sm aspect-[3/4] perspective-1000">
              <motion.div
                className="w-full h-full relative preserve-3d cursor-pointer"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white border-2 border-sakura-pink/10 rounded-3xl flex flex-col items-center justify-center p-8 shadow-sm">
                  <span className="text-sm text-sakura-rose/30 font-mono mb-4">WORD</span>
                  <h3 className="text-5xl font-bold text-sakura-deep mb-2">{cards[currentIndex].word}</h3>
                  <p className="text-sakura-rose/60 font-serif italic">{cards[currentIndex].reading}</p>
                  <div className="mt-auto text-sakura-pink text-xs flex items-center gap-2">
                    <BookOpen size={14} />
                    点击翻面查看释义
                  </div>
                </div>

                {/* Back */}
                <div 
                  className="absolute inset-0 backface-hidden bg-sakura-deep border-2 border-sakura-rose/20 rounded-3xl flex flex-col items-center justify-center p-8 shadow-sm text-white"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <span className="text-sm text-sakura-pink/40 font-mono mb-4">MEANING</span>
                  <p className="text-2xl font-medium mb-8 text-center">{cards[currentIndex].meaning}</p>
                  
                  <div className="w-full border-t border-white/10 pt-6">
                    <span className="text-[10px] text-sakura-pink/40 uppercase tracking-widest block mb-2">Example</span>
                    <p className="text-sm text-white mb-1">{cards[currentIndex].example}</p>
                    <p className="text-xs text-sakura-pink/60 mb-2 italic">{cards[currentIndex].exampleReading}</p>
                    <p className="text-xs text-white/60">{cards[currentIndex].exampleMeaning}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={prevCard}
                disabled={currentIndex === 0}
                className={`p-3 rounded-full border transition-all ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed border-sakura-pink/10' : 'border-sakura-pink/20 hover:bg-sakura-pink/10 active:scale-95 text-sakura-rose'}`}
              >
                <ChevronLeft />
              </button>
              <span className="text-sakura-rose/40 font-mono text-sm">
                {currentIndex + 1} / {cards.length}
              </span>
              <button
                onClick={nextCard}
                disabled={currentIndex === cards.length - 1}
                className={`p-3 rounded-full border transition-all ${currentIndex === cards.length - 1 ? 'opacity-30 cursor-not-allowed border-sakura-pink/10' : 'border-sakura-pink/20 hover:bg-sakura-pink/10 active:scale-95 text-sakura-rose'}`}
              >
                <ChevronRight />
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={() => fetchCards()}
            className="px-6 py-3 bg-sakura-rose text-white rounded-full hover:bg-sakura-rose/90 transition-all flex items-center gap-2 shadow-lg shadow-sakura-pink/20"
          >
            <RefreshCw size={18} />
            加载卡片
          </button>
        )}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
