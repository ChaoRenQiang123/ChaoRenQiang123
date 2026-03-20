import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, ChevronRight, Loader2, RefreshCw, CheckCircle2, Volume2 } from 'lucide-react';
import { GrammarPoint, JLPTLevel } from '../types';
import { generateGrammarPoints, generateAudio } from '../services/gemini';
import { playRawAudio } from '../utils/audio';

export const GrammarLearning: React.FC = () => {
  const [level, setLevel] = useState<JLPTLevel>('N5');
  const [grammarPoints, setGrammarPoints] = useState<GrammarPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<GrammarPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGrammar();
  }, [level]);

  useEffect(() => {
    if (selectedPoint && window.innerWidth < 1024) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedPoint]);

  const fetchGrammar = async () => {
    setLoading(true);
    const data = await generateGrammarPoints(level);
    setGrammarPoints(data);
    setLoading(false);
  };

  const handlePlayAudio = async (text: string) => {
    if (playingAudio === text) return;
    setPlayingAudio(text);
    const base64 = await generateAudio(text);
    if (base64) {
      try {
        await playRawAudio(base64);
      } catch (error) {
        console.error("Failed to play audio", error);
      } finally {
        setPlayingAudio(null);
      }
    } else {
      setPlayingAudio(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="grammar-learning">
      {/* Left Column: Grammar List */}
      <div className="lg:col-span-1 space-y-6">
        <div className="p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sakura-pink/10 rounded-xl">
                <Book size={20} className="text-sakura-rose" />
              </div>
              <h2 className="text-xl font-serif italic text-sakura-deep">语法目录</h2>
            </div>
            <div className="flex gap-1 bg-sakura-pink/10 p-1 rounded-full">
              {(['N5', 'N4', 'N3'] as JLPTLevel[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${level === l ? 'bg-white shadow-sm text-sakura-rose font-bold' : 'text-sakura-rose/40 hover:text-sakura-rose'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-sakura-pink/40 gap-4 py-20">
              <Loader2 className="animate-spin w-8 h-8" />
              <p className="text-sm italic">正在整理语法点...</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[600px] pr-2 no-scrollbar">
              {grammarPoints.map((gp) => (
                <button
                  key={gp.id}
                  onClick={() => setSelectedPoint(gp)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedPoint?.id === gp.id ? 'bg-sakura-rose text-white border-sakura-rose shadow-lg shadow-sakura-pink/20' : 'bg-white border-sakura-pink/5 hover:border-sakura-pink/20 text-sakura-deep'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold mb-1">{gp.title}</h3>
                      <p className={`text-xs ${selectedPoint?.id === gp.id ? 'text-white/70' : 'text-sakura-rose/60'}`}>{gp.meaning}</p>
                    </div>
                    <ChevronRight size={18} className={selectedPoint?.id === gp.id ? 'text-white' : 'text-sakura-pink/30'} />
                  </div>
                </button>
              ))}
              <button 
                onClick={fetchGrammar}
                className="w-full py-3 mt-4 border-2 border-dashed border-sakura-pink/20 rounded-2xl text-sakura-pink/40 hover:text-sakura-rose hover:border-sakura-rose/40 transition-all text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                换一批语法
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Grammar Detail */}
      <div className="lg:col-span-2 space-y-6" ref={detailRef}>
        <AnimatePresence mode="wait">
          {selectedPoint ? (
            <motion.div
              key={selectedPoint.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 md:p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20 min-h-[400px] md:min-h-[600px]"
            >
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-sakura-deep">{selectedPoint.title}</h2>
                  <span className="px-3 py-1 bg-sakura-pink/10 text-sakura-rose text-xs font-bold rounded-full uppercase tracking-widest">
                    {level}
                  </span>
                </div>
                <div className="p-4 bg-sakura-light/30 rounded-2xl border border-sakura-pink/10">
                  <p className="text-sakura-rose font-medium mb-2">【含义】</p>
                  <p className="text-sakura-deep/80">{selectedPoint.meaning}</p>
                </div>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-sakura-rose/40 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sakura-rose" />
                    用法说明
                  </h3>
                  <p className="text-sakura-deep/80 leading-relaxed whitespace-pre-wrap">{selectedPoint.usage}</p>
                </section>

                <section>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-sakura-rose/40 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sakura-rose" />
                    典型例句
                  </h3>
                  <div className="space-y-4">
                    {selectedPoint.examples.map((ex, i) => (
                      <div key={i} className="group p-4 bg-white rounded-2xl border border-sakura-pink/5 hover:border-sakura-pink/20 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-lg font-medium text-sakura-deep mb-1">{ex.japanese}</p>
                            <p className="text-xs text-sakura-rose/40 font-serif italic mb-2">{ex.reading}</p>
                            <p className="text-sm text-sakura-rose/70">{ex.chinese}</p>
                          </div>
                          <button 
                            onClick={() => handlePlayAudio(ex.japanese)}
                            className={`p-2 rounded-full transition-all ${playingAudio === ex.japanese ? 'bg-sakura-rose text-white' : 'bg-sakura-pink/5 text-sakura-rose/40 hover:bg-sakura-pink/10 hover:text-sakura-rose'}`}
                          >
                            <Volume2 size={16} className={playingAudio === ex.japanese ? 'animate-pulse' : ''} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-sakura-rose/40 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sakura-rose" />
                    练习题
                  </h3>
                  <div className="space-y-4">
                    {selectedPoint.practice.map((p, i) => (
                      <div key={i} className="p-6 bg-sakura-deep text-white rounded-2xl shadow-lg shadow-sakura-pink/10">
                        <div className="flex items-center gap-2 mb-3 text-sakura-pink/40">
                          <CheckCircle2 size={14} />
                          <span className="text-[10px] uppercase tracking-widest font-mono">Practice {i + 1}</span>
                        </div>
                        <p className="text-lg font-serif italic mb-4">“{p.chinese}”</p>
                        <details className="group">
                          <summary className="text-xs text-sakura-pink/30 hover:text-white cursor-pointer transition-all list-none flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px]">?</span>
                            点击查看参考答案
                          </summary>
                          <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="text-emerald-400 font-medium">{p.japanese}</p>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-sakura-pink/10 py-40">
              <Book size={80} className="mb-6 opacity-20" />
              <p className="text-xl font-serif italic">请从左侧选择一个语法点开始学习</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
