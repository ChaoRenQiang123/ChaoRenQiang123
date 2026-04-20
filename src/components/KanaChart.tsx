import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, BookOpen, Volume2, PencilLine, Sparkles, Info } from 'lucide-react';
import { Kana, Vocabulary } from '../types';
import { prefetchKanaExamples } from '../services/dataService';
import { generateAudio } from '../services/gemini';
import { playRawAudio } from '../utils/audio';
import { WritingCanvas } from './WritingCanvas';

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

const dakuonHiragana: Kana[] = [
  { char: 'が', romaji: 'ga', type: 'hiragana' }, { char: 'ぎ', romaji: 'gi', type: 'hiragana' }, { char: 'ぐ', romaji: 'gu', type: 'hiragana' }, { char: 'げ', romaji: 'ge', type: 'hiragana' }, { char: 'ご', romaji: 'go', type: 'hiragana' },
  { char: 'ざ', romaji: 'za', type: 'hiragana' }, { char: 'じ', romaji: 'ji', type: 'hiragana' }, { char: 'ず', romaji: 'zu', type: 'hiragana' }, { char: 'ぜ', romaji: 'ze', type: 'hiragana' }, { char: 'ぞ', romaji: 'zo', type: 'hiragana' },
  { char: 'だ', romaji: 'da', type: 'hiragana' }, { char: 'ぢ', romaji: 'ji', type: 'hiragana' }, { char: 'づ', romaji: 'zu', type: 'hiragana' }, { char: 'で', romaji: 'de', type: 'hiragana' }, { char: 'ど', romaji: 'do', type: 'hiragana' },
  { char: 'ば', romaji: 'ba', type: 'hiragana' }, { char: 'び', romaji: 'bi', type: 'hiragana' }, { char: 'ぶ', romaji: 'bu', type: 'hiragana' }, { char: 'べ', romaji: 'be', type: 'hiragana' }, { char: 'ぼ', romaji: 'bo', type: 'hiragana' },
  { char: 'ぱ', romaji: 'pa', type: 'hiragana' }, { char: 'ぴ', romaji: 'pi', type: 'hiragana' }, { char: 'ぷ', romaji: 'pu', type: 'hiragana' }, { char: 'ぺ', romaji: 'pe', type: 'hiragana' }, { char: 'ぽ', romaji: 'po', type: 'hiragana' }
];

const yoonHiragana: Kana[] = [
  { char: 'きゃ', romaji: 'kya', type: 'hiragana' }, { char: 'きゅ', romaji: 'kyu', type: 'hiragana' }, { char: 'きょ', romaji: 'kyo', type: 'hiragana' },
  { char: 'しゃ', romaji: 'sha', type: 'hiragana' }, { char: 'しゅ', romaji: 'shu', type: 'hiragana' }, { char: 'しょ', romaji: 'sho', type: 'hiragana' },
  { char: 'ちゃ', romaji: 'cha', type: 'hiragana' }, { char: 'ちゅ', romaji: 'chu', type: 'hiragana' }, { char: 'ちょ', romaji: 'cho', type: 'hiragana' },
  { char: 'にゃ', romaji: 'nya', type: 'hiragana' }, { char: 'にゅ', romaji: 'nyu', type: 'hiragana' }, { char: 'にょ', romaji: 'nyo', type: 'hiragana' },
  { char: 'ひゃ', romaji: 'hya', type: 'hiragana' }, { char: 'ひゅ', romaji: 'hyu', type: 'hiragana' }, { char: 'ひょ', romaji: 'hyo', type: 'hiragana' },
  { char: 'みゃ', romaji: 'mya', type: 'hiragana' }, { char: 'みゅ', romaji: 'myu', type: 'hiragana' }, { char: 'みょ', romaji: 'myo', type: 'hiragana' },
  { char: 'りゃ', romaji: 'rya', type: 'hiragana' }, { char: 'りゅ', romaji: 'ryu', type: 'hiragana' }, { char: 'りょ', romaji: 'ryo', type: 'hiragana' },
  { char: 'ぎゃ', romaji: 'gya', type: 'hiragana' }, { char: 'ぎゅ', romaji: 'gyu', type: 'hiragana' }, { char: 'ぎょ', romaji: 'gyo', type: 'hiragana' },
  { char: 'じゃ', romaji: 'ja', type: 'hiragana' }, { char: 'じゅ', romaji: 'ju', type: 'hiragana' }, { char: 'じょ', romaji: 'jo', type: 'hiragana' },
  { char: 'びゃ', romaji: 'bya', type: 'hiragana' }, { char: 'びゅ', romaji: 'byu', type: 'hiragana' }, { char: 'びょ', romaji: 'byo', type: 'hiragana' },
  { char: 'ぴゃ', romaji: 'pya', type: 'hiragana' }, { char: 'ぴゅ', romaji: 'pyu', type: 'hiragana' }, { char: 'ぴょ', romaji: 'pyo', type: 'hiragana' }
];

const specialSounds = [
  {
    id: 'choon',
    title: "长音 (Chōon)",
    description: "将元音拉长一拍。平假名通过添加元音实现，片假名使用“ー”。",
    examples: [
      { jp: "おかあさん", ro: "okaasan", cn: "母亲 (a段+あ)" },
      { jp: "おにいさん", ro: "oniisan", cn: "哥哥 (i段+い)" },
      { jp: "せんせい", ro: "sensei", cn: "老师 (e段+い)" },
      { jp: "おとうさん", ro: "otousan", cn: "父亲 (o段+う)" },
      { jp: "ケーキ", ro: "keeki", cn: "蛋糕 (片假名用ー)" }
    ]
  },
  {
    id: 'sokuon',
    title: "促音 (Sokuon)",
    description: "使用小写的“っ”或“ッ”，表示停顿一拍，通常使后续辅音双写。",
    examples: [
      { jp: "きって", ro: "kitte", cn: "邮票" },
      { jp: "がっこう", ro: "gakkou", cn: "学校" },
      { jp: "カップ", ro: "kappu", cn: "杯子" },
      { jp: "ちょっと", ro: "chotto", cn: "稍微" }
    ]
  },
  {
    id: 'hatsuon',
    title: "拨音 (Hatsuon)",
    description: "假名“ん”或“ン”，不独立发音，占一拍，发音受后续音节影响。",
    examples: [
      { jp: "にほん", ro: "nihon", cn: "日本" },
      { jp: "しんぶん", ro: "shinbun", cn: "报纸" },
      { jp: "てんき", ro: "tenki", cn: "天气" },
      { jp: "あんまり", ro: "anmari", cn: "不太..." }
    ]
  }
];

export const KanaChart: React.FC = () => {
  const [type, setType] = useState<'hiragana' | 'katakana' | 'special'>('hiragana');
  const [specialSubTab, setSpecialSubTab] = useState<'knowledge' | 'dakuon' | 'yoon'>('knowledge');
  const [selectedKana, setSelectedKana] = useState<Kana | null>(null);
  const [activeTab, setActiveTab] = useState<'examples' | 'writing'>('examples');
  const [examples, setExamples] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const data = type === 'hiragana' ? hiragana : katakana;

  const handleKanaClick = async (kana: Kana) => {
    if (!kana.char) return;
    setSelectedKana(kana);
    setActiveTab('examples');
    setLoading(true);
    setExamples([]);
    
    // Fetch examples
    const examplesResult = await prefetchKanaExamples(kana.char);
    
    setExamples(examplesResult);
    setLoading(false);
  };

  const handleMouseEnter = (kana: Kana) => {
    if (kana.char) {
      prefetchKanaExamples(kana.char);
    }
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

  const getUnicodeHex = (char: string) => {
    return char.charCodeAt(0).toString(16).padStart(5, '0');
  };

  return (
    <div className="p-3 md:p-4 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20 relative" id="kana-chart">
      <div className="flex flex-col gap-2 mb-4 md:mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-serif italic text-sakura-deep flex items-center gap-2">
            五十音图
            <div className="group relative">
              <Info size={14} className="text-sakura-rose/30 cursor-help hover:text-sakura-rose transition-colors" />
              <div className="absolute left-0 top-full mt-2 w-48 p-2 bg-white rounded-xl shadow-xl border border-sakura-pink/20 text-[10px] text-sakura-rose/60 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                💡 点击任意假名卡片，即可查看详细发音、常用单词及交互式书写练习。
              </div>
            </div>
          </h2>
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
            <button
              onClick={() => setType('special')}
              className={`px-3 py-1 rounded-full text-[10px] md:text-xs transition-all ${type === 'special' ? 'bg-white shadow-sm text-sakura-rose font-bold' : 'text-sakura-rose/40 hover:text-sakura-rose'}`}
            >
              特殊发音
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-sakura-pink/5 rounded-xl border border-sakura-pink/10">
          <Sparkles size={12} className="text-sakura-rose animate-pulse" />
          <p className="text-[10px] md:text-xs text-sakura-rose/60 font-serif italic">
            {type === 'special' ? '探索日语中的浊音、拗音、长音等特殊发音' : '点击假名探索发音、单词及书写练习'}
          </p>
        </div>
      </div>

      {type === 'special' ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSpecialSubTab('knowledge')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${specialSubTab === 'knowledge' ? 'bg-sakura-rose text-white shadow-md' : 'bg-sakura-pink/5 text-sakura-rose/60 hover:bg-sakura-pink/10'}`}
            >
              发音知识
            </button>
            <button
              onClick={() => setSpecialSubTab('dakuon')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${specialSubTab === 'dakuon' ? 'bg-sakura-rose text-white shadow-md' : 'bg-sakura-pink/5 text-sakura-rose/60 hover:bg-sakura-pink/10'}`}
            >
              浊音/半浊音
            </button>
            <button
              onClick={() => setSpecialSubTab('yoon')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${specialSubTab === 'yoon' ? 'bg-sakura-rose text-white shadow-md' : 'bg-sakura-pink/5 text-sakura-rose/60 hover:bg-sakura-pink/10'}`}
            >
              拗音表
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
            {specialSubTab === 'knowledge' && (
              <div className="space-y-4">
                {specialSounds.map((sound, idx) => (
                  <motion.div
                    key={sound.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-white rounded-2xl border border-sakura-pink/10 shadow-sm"
                  >
                    <h3 className="text-sm font-bold text-sakura-deep mb-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-sakura-rose" />
                      {sound.title}
                    </h3>
                    <p className="text-xs text-sakura-rose/60 mb-3 leading-relaxed">
                      {sound.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sound.examples.map((ex, eIdx) => (
                        <div 
                          key={eIdx}
                          onClick={() => handlePlayAudio(ex.jp)}
                          className="flex items-center justify-between p-2 bg-sakura-light/30 rounded-xl border border-sakura-pink/5 hover:bg-sakura-pink/10 transition-colors cursor-pointer group"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-sakura-deep group-hover:text-sakura-rose transition-colors">{ex.jp}</span>
                            <span className="text-[10px] text-sakura-rose/40 font-mono uppercase">{ex.ro}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-sakura-rose/60 italic">{ex.cn}</span>
                            <Volume2 size={12} className="text-sakura-rose/30 group-hover:text-sakura-rose" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {specialSubTab === 'dakuon' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-sakura-rose/60 mb-3 uppercase tracking-widest">浊音/半浊音表 (包含片假名单词示例)</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {dakuonHiragana.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleKanaClick(item)}
                        className="h-12 flex flex-col items-center justify-center rounded-xl border border-sakura-pink/10 bg-white hover:border-sakura-pink/40 hover:bg-sakura-pink/5 cursor-pointer transition-all active:scale-95"
                      >
                        <span className="text-lg font-medium text-sakura-deep leading-none">{item.char}</span>
                        <span className="text-[8px] uppercase tracking-wider text-sakura-rose/30 font-mono mt-0.5">{item.romaji}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {specialSubTab === 'yoon' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-sakura-rose/60 mb-3 uppercase tracking-widest">拗音表 (包含片假名单词示例)</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {yoonHiragana.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleKanaClick(item)}
                        className="h-12 flex flex-col items-center justify-center rounded-xl border border-sakura-pink/10 bg-white hover:border-sakura-pink/40 hover:bg-sakura-pink/5 cursor-pointer transition-all active:scale-95"
                      >
                        <span className="text-lg font-medium text-sakura-deep leading-none">{item.char}</span>
                        <span className="text-[8px] uppercase tracking-wider text-sakura-rose/30 font-mono mt-0.5">{item.romaji}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-1 md:gap-2">
          {data.map((item, index) => (
            <div
              key={index}
              onClick={() => handleKanaClick(item)}
              onMouseEnter={() => handleMouseEnter(item)}
              className={`h-12 md:h-14 flex flex-col items-center justify-center rounded-xl border transition-all relative group/card ${item.char ? 'bg-white border-sakura-pink/10 hover:border-sakura-pink/40 hover:bg-sakura-pink/5 cursor-pointer active:scale-95' : 'border-transparent opacity-0'}`}
            >
              <span className="text-lg md:text-xl font-medium text-sakura-deep leading-none">{item.char}</span>
              <span className="text-[8px] md:text-[9px] uppercase tracking-wider text-sakura-rose/30 font-mono mt-0.5">{item.romaji}</span>
              {item.char && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none">
                  <div className="w-full h-full bg-sakura-rose/5 rounded-xl border border-sakura-rose/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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

              {/* Tabs */}
              <div className="flex border-b border-sakura-pink/10 bg-white">
                <button
                  onClick={() => setActiveTab('examples')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'examples' ? 'text-sakura-rose border-b-2 border-sakura-rose bg-sakura-pink/5' : 'text-sakura-rose/40 hover:text-sakura-rose hover:bg-sakura-pink/5'}`}
                >
                  <BookOpen size={14} />
                  常用单词
                </button>
                <button
                  onClick={() => setActiveTab('writing')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'writing' ? 'text-sakura-rose border-b-2 border-sakura-rose bg-sakura-pink/5' : 'text-sakura-rose/40 hover:text-sakura-rose hover:bg-sakura-pink/5'}`}
                >
                  <PencilLine size={14} />
                  书写练习
                </button>
              </div>

              <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4 text-sakura-pink/40">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm italic font-serif">AI 正在联想中...</p>
                  </div>
                ) : activeTab === 'examples' ? (
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
                ) : (
                  <div className="py-4 flex flex-col items-center justify-center">
                    <WritingCanvas 
                      kana={selectedKana.char} 
                      romaji={selectedKana.romaji} 
                      strokeOrderUrl={`https://raw.githubusercontent.com/kanjivg/kanjivg/master/kanji/${getUnicodeHex(selectedKana.char)}.svg`}
                    />
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
