import React, { useState } from 'react';
import { translateBiDirectional } from '../services/gemini';
import { Send, Languages, Loader2, ArrowRightLeft } from 'lucide-react';
import { addProgressPoint } from '../services/progressService';

export const Translator: React.FC = () => {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<'zh-ja' | 'ja-zh'>('zh-ja');
  const [result, setResult] = useState<{ translated: string; furigana?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    
    // Add progress point
    addProgressPoint('translator_use');

    const data = await translateBiDirectional(input, direction);
    setResult(data);
    setLoading(false);
  };

  const toggleDirection = () => {
    setDirection(prev => prev === 'zh-ja' ? 'ja-zh' : 'zh-ja');
    setResult(null);
  };

  const renderFurigana = (text: string) => {
    // 检测是否是 Google 翻译的回退链接 (Markdown 格式: [Text](URL))
    const linkMatch = text.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a 
          href={linkMatch[2]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sakura-rose/10 text-sakura-rose font-bold rounded-xl hover:bg-sakura-rose/20 transition-all border border-sakura-rose/20 mt-2"
        >
          {linkMatch[1]}
          <ArrowRightLeft size={14} />
        </a>
      );
    }

    // 原有的 漢字[かんじ] 解析逻辑
    const parts = text.split(/([^[\]]+\[[^\]]+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/^([^[\]]+)\[([^\]]+)\]$/);
      if (match) {
        return (
          <ruby key={i} className="mx-0.5">
            {match[1]}
            <rt className="text-[10px] text-stone-400">{match[2]}</rt>
          </ruby>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20" id="translator">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sakura-pink/10 rounded-xl">
            <Languages className="text-sakura-rose" size={20} />
          </div>
          <h2 className="text-2xl font-serif italic text-sakura-deep">智能翻译 & 助手</h2>
        </div>

        <button 
          onClick={toggleDirection}
          className="flex items-center gap-3 px-4 py-2 bg-sakura-pink/10 rounded-full hover:bg-sakura-pink/20 transition-all text-sakura-rose font-medium"
        >
          <span className="text-sm">{direction === 'zh-ja' ? '中文' : '日本語'}</span>
          <ArrowRightLeft size={16} />
          <span className="text-sm">{direction === 'zh-ja' ? '日本語' : '中文'}</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={direction === 'zh-ja' ? "输入中文或英文..." : "日本語を入力してください..."}
            className="w-full p-4 bg-white border border-sakura-pink/10 rounded-2xl focus:outline-none focus:border-sakura-pink/40 transition-all resize-none h-32 text-sakura-deep placeholder:text-sakura-pink/40"
          />
          <button
            onClick={handleTranslate}
            disabled={loading || !input.trim()}
            className="absolute bottom-4 right-4 p-2 bg-sakura-rose text-white rounded-xl hover:bg-sakura-rose/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-sakura-pink/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>

        {result && (
          <div className="p-6 bg-sakura-pink/5 border border-sakura-pink/10 rounded-2xl space-y-4">
            <div>
              <span className="text-[10px] text-sakura-rose/40 uppercase tracking-widest block mb-2">Translation</span>
              <p className="text-xl text-sakura-deep">{result.translated}</p>
            </div>
            {result.furigana && (
              <div>
                <span className="text-[10px] text-sakura-rose/40 uppercase tracking-widest block mb-2">Reading Aid</span>
                <div className="text-lg text-sakura-deep leading-relaxed">
                  {renderFurigana(result.furigana)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
