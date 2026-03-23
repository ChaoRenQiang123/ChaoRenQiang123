import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, BookOpen, Volume2 } from 'lucide-react';
import { Kana, Vocabulary } from '../types';
import { generateKanaExamples, generateAudio } from '../services/gemini';
import { playRawAudio } from '../utils/audio';

const hiragana: Kana[] = [
  { char: 'あ', romaji: 'a', type: 'hiragana' }, { char: 'い', romaji: 'i', type: 'hiragana' }, { char: 'う', romaji: 'u', type: 'hiragana' }, { char: 'え', romaji: 'e', type: 'hiragana' }, { char: 'お', romaji: 'o', type: 'hiragana' },
  { char: 'か', romaji: 'ka', type: 'hiragana' }, { char: 'き', romaji: 'ki', type: 'hiragana' }, { char: 'く', romaji: 'ku', type: 'hiragana' }, { char: 'け', romaji: 'ke', type: 'hiragana' }, { char: 'こ', romaji: 'ko', type: 'hiragana' },
  { char: 'さ', romaji: 'sa', type: 'hiragana' }, { char: 'し', romaji: 'shi', type: 'hiragana' }, { char: 'す', romaji: 'su', type: 'hiragana' }, { char: 'せ', romaji: 'se', type: 'hiragana' }, { char: 'そ', romaji: 'so', type: 'hiragana' },
  { char: 'た', romaji: 'ta', type: 'hiragana' }, { char: 'ち', romaji: 'chi', type: 'hiragana' }, { char: 'つ', romaji: 'tsu', type: 'hiragana' }, { char: 'て', romaji: 'te', type: 'hiragana' }, { char: 'と', romaji: 'to', type: 'hiragana' },
  { char: 'な', romaji: 'na', type: 'hiragana' }, { char: 'に', romaji: 'ni', type: 'hiragana' }, { char: 'ぬ', romaji: 'nu', type: 'hiragana' }, { char: 'ね', romaji: 'ne', type: 'hiragana' }, { char: 'の', romaji: 'no', type: 'hiragana' },
  { char: 'は', romaji: 'ha', type: 'hiragana' }, { char: 'ひ', romaji: 'hi', type: 'hiragana' }, { char: 'ふ', romaji: 'fu', type: 'hiragana' }, { char: 'へ', romaji: 'he', type: 'hiragana' }, { char: 'ほ', romaji: 'ho', type: 'hiragana' },
  { char: 'ま', romaji: 'ma', type: 'hiragana' }, { char: 'み', romaji: 'mi', type: 'hiragana' }, { char: 'む', romaji: 'mu', type: 'hiragana' }, { char: 'め', romaji: 'me', type: 'hiragana' }, { char: 'も', romaji: 'mo', type: 'hiragana' },
  { char: 'や', romaji: 'ya', type: 'hiragana' }, { char: '', romaji: '', type: 'hiragana' }, { char: 'ゆ', romaji: 'yu', type: 'hiragana' }, { char: '', romaji: '', type: 'hiragana' }, { char: 'よ', romaji: 'yo', type: 'hiragana' },
  { char: 'ら', romaji: 'ra', type: 'hiragana' }, { char: 'り', romaji: 'ri', type: 'hiragana' }, { char: 'る', romaji: 'ru', type: 'hiragana' }, { char: 'れ', romaji: 're', type: 'hiragana' }, { char: 'ろ', romaji: 'ro', type: 'hiragana' },
  { char: 'わ', romaji: 'wa', type: 'hiragana' }, { char: '', romaji: '', type: 'hiragana' }, { char: '', romaji: '', type: 'hiragana' }, { char: '', romaji: '', type: 'hiragana' }, { char: 'を', romaji: 'wo', type: 'hiragana' },
  { char: 'ん', romaji: 'n', type: 'hiragana' }
];

const katakana: Kana[] = [
  { char: 'ア', romaji: 'a', type: 'katakana' }, { char: 'イ', romaji: 'i', type: 'katakana' }, { char: 'ウ', romaji: 'u', type: 'katakana' }, { char: 'エ', romaji: 'e', type: 'katakana' }, { char: 'オ', romaji: 'o', type: 'katakana' },
  { char: 'カ', romaji: 'ka', type: 'katakana' }, { char: 'キ', romaji: 'ki', type: 'katakana' }, { char: 'ク', romaji: 'ku', type: 'katakana' }, { char: 'ケ', romaji: 'ke', type: 'katakana' }, { char: 'コ', romaji: 'ko', type: 'katakana' },
  { char: 'サ', romaji: 'sa', type: 'katakana' }, { char: 'シ', romaji: 'shi', type: 'katakana' }, { char: 'ス', romaji: 'su', type: 'katakana' }, { char: 'セ', romaji: 'se', type: 'katakana' }, { char: 'ソ', romaji: 'so', type: 'katakana' },
  { char: 'タ', romaji: 'ta', type: 'katakana' }, { char: 'チ', romaji: 'chi', type: 'katakana' }, { char: 'ツ', romaji: 'tsu', type: 'katakana' }, { char: 'テ', romaji: 'te', type: 'katakana' }, { char: 'ト', romaji: 'to', type: 'katakana' },
  { char: 'ナ', romaji: 'na', type: 'katakana' }, { char: 'ニ', romaji: 'ni', type: 'katakana' }, { char: 'ヌ', romaji: 'nu', type: 'katakana' }, { char: 'ネ', romaji: 'ne', type: 'katakana' }, { char: 'ノ', romaji: 'no', type: 'katakana' },
  { char: 'ハ', romaji: 'ha', type: 'katakana' }, { char: 'ヒ', romaji: 'hi', type: 'katakana' }, { char: 'フ', romaji: 'fu', type: 'katakana' }, { char: 'ヘ', romaji: 'he', type: 'katakana' }, { char: 'ホ', romaji: 'ho', type: 'katakana' },
  { char: 'マ', romaji: 'ma', type: 'katakana' }, { char: 'ミ', romaji: 'mi', type: 'katakana' }, { char: 'ム', romaji: 'mu', type: 'katakana' }, { char: 'メ', romaji: 'me', type: 'katakana' }, { char: 'モ', romaji: 'mo', type: 'katakana' },
  { char: 'ヤ', romaji: 'ya', type: 'katakana' }, { char: '', romaji: '', type: 'katakana' }, { char: 'ユ', romaji: 'yu', type: 'katakana' }, { char: '', romaji: '', type: 'katakana' }, { char: 'ヨ', romaji: 'yo', type: 'katakana' },
  { char: 'ラ', romaji: 'ra', type: 'katakana' }, { char: 'リ', romaji: 'ri', type: 'katakana' }, { char: 'ル', romaji: 'ru', type: 'katakana' }, { char: 'レ', romaji: 're', type: 'katakana' }, { char: 'ロ', romaji: 'ro', type: 'katakana' },
  { char: 'ワ', romaji: 'wa', type: 'katakana' }, { char: '', romaji: '', type: 'katakana' }, { char: '', romaji: '', type: 'katakana' }, { char: '', romaji: '', type: 'katakana' }, { char: 'ヲ', romaji: 'wo', type: 'katakana' },
  { char: 'ン', romaji: 'n', type: 'katakana' }
];

export const KanaChart: React.FC = () => {
  const [type, setType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [selectedKana, setSelectedKana] = useState<Kana | null>(null);
  const [examples, setExamples] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const data = type === 'hiragana' ? hiragana : katakana;

  const handleKanaClick = async (kana: Kana) => {
    if (!kana.char) return;
    setSelectedKana(kana);
    setLoading(true);
    setExamples([]);
    const result = await generateKanaExamples(kana.char);
    setExamples(result);
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

  const highlightKana = (text: string, kana: string) => {
    if (!kana) return text;
    const parts = text.split(new RegExp(`(${kana})`, 'g'));
    return parts.map((part, i) => 
      part === kana ? <strong key={i} className="text-sakura-rose font-black">{part}</strong> : part
    );
  };

  return (
    <div className="p-3 md:p-4 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20 relative" id="kana-chart">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-serif italic text-sakura-deep">五十音图</h2>
        <div className="flex gap-1 bg-sakura-pink/10 p-1 rounded-full">
          <button
            onClick={() => setType('hiragana')}
            className={`px-3 py-1 rounded-full text-[10px] md:text-xs transition-all ${type === 'hiragana' ? 'bg-white shadow-sm text-sakura-rose font-bold' : 'text-sakura-rose/40 hover:text-sakura-rose'}`}
          >
            平假名
          </button>
          <button
            onClick={() => setType('katakana')}
            className={`px-3 py-1 rounded-full text-[10px] md:text-xs transition-all ${type === 'katakana' ? 'bg-white shadow-sm text-sakura-rose font-bold' : 'text-sakura-rose/40 hover:text-sakura-rose'}`}
          >
            片假名
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1 md:gap-2">
        {data.map((item, index) => (
          <div
            key={index}
            onClick={() => handleKanaClick(item)}
            className={`h-12 md:h-14 flex flex-col items-center justify-center rounded-xl border transition-all ${item.char ? 'bg-white border-sakura-pink/10 hover:border-sakura-pink/40 hover:bg-sakura-pink/5 cursor-pointer active:scale-95' : 'border-transparent opacity-0'}`}
          >
            <span className="text-lg md:text-xl font-medium text-sakura-deep leading-none">{item.char}</span>
            <span className="text-[8px] md:text-[9px] uppercase tracking-wider text-sakura-rose/30 font-mono mt-0.5">{item.romaji}</span>
          </div>
        ))}
      </div>

      {/* Kana Examples Modal */}
      <AnimatePresence>
        {selectedKana && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedKana(null)}
              className="absolute inset-0 bg-sakura-deep/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-sakura-pink/20"
            >
              <div className="p-4 md:p-6 border-b border-sakura-pink/10 flex justify-between items-center bg-sakura-light/50">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-16 h-16 bg-sakura-rose rounded-xl md:rounded-2xl flex items-center justify-center text-white text-2xl md:text-4xl font-bold shadow-lg shadow-sakura-pink/20">
                    {selectedKana.char}
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-sakura-deep">{selectedKana.romaji.toUpperCase()}</h3>
                    <p className="text-[10px] text-sakura-rose/60 uppercase tracking-widest font-mono">{selectedKana.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedKana(null)}
                  className="p-2 hover:bg-sakura-pink/10 rounded-full transition-all text-sakura-rose/40 hover:text-sakura-rose"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-2 mb-4 text-sakura-rose">
                  <BookOpen size={18} />
                  <span className="text-sm font-bold uppercase tracking-wider">常用单词示例</span>
                </div>

                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4 text-sakura-pink/40">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm italic font-serif">AI 正在联想单词...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {examples.map((ex, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-sakura-light/30 rounded-2xl border border-sakura-pink/10"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-3">
                            <div>
                              <h4 className="text-xl font-bold text-sakura-deep">
                                {highlightKana(ex.word, selectedKana.char)}
                              </h4>
                              <p className="text-xs text-sakura-rose/60 font-serif italic">
                                {highlightKana(ex.reading, selectedKana.char)}
                              </p>
                            </div>
                            <button
                              onClick={() => handlePlayAudio(ex.word)}
                              disabled={playingAudio === ex.word}
                              className={`p-1.5 rounded-full transition-all ${playingAudio === ex.word ? 'bg-sakura-rose text-white' : 'hover:bg-sakura-pink/10 text-sakura-rose/40 hover:text-sakura-rose'}`}
                            >
                              <Volume2 size={16} className={playingAudio === ex.word ? 'animate-pulse' : ''} />
                            </button>
                          </div>
                          <span className="text-sm font-medium text-sakura-rose bg-white px-3 py-1 rounded-full shadow-sm border border-sakura-pink/5">
                            {ex.meaning}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-sakura-pink/5">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm text-sakura-deep/80 leading-relaxed">{ex.example}</p>
                              <p className="text-[10px] text-sakura-rose/40 mt-1 italic leading-relaxed">{ex.exampleReading}</p>
                              <p className="text-xs text-sakura-rose/60 mt-1">{ex.exampleMeaning}</p>
                            </div>
                            <button
                              onClick={() => handlePlayAudio(ex.example)}
                              disabled={playingAudio === ex.example}
                              className={`p-1.5 rounded-full transition-all ${playingAudio === ex.example ? 'bg-sakura-rose text-white' : 'hover:bg-sakura-pink/10 text-sakura-rose/40 hover:text-sakura-rose'}`}
                            >
                              <Volume2 size={14} className={playingAudio === ex.example ? 'animate-pulse' : ''} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
