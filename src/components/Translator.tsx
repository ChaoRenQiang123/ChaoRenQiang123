import React, { useState } from 'react';
import { translateWithFurigana } from '../services/gemini';
import { Send, Languages, Loader2 } from 'lucide-react';

export const Translator: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ translated: string; furigana: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const data = await translateWithFurigana(input);
    setResult(data);
    setLoading(false);
  };

  const renderFurigana = (text: string) => {
    // Basic parser for "漢字[かんじ]" format
    const parts = text.split(/(\w+\[[^\]]+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/(\w+)\[([^\]]+)\]/);
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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-sakura-pink/10 rounded-xl">
          <Languages className="text-sakura-rose" size={20} />
        </div>
        <h2 className="text-2xl font-serif italic text-sakura-deep">智能翻译 & 振假名</h2>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入中文或英文..."
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
            <div>
              <span className="text-[10px] text-sakura-rose/40 uppercase tracking-widest block mb-2">Reading Aid</span>
              <div className="text-lg text-sakura-deep leading-relaxed">
                {renderFurigana(result.furigana)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
