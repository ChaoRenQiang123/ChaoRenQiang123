import React, { useState } from 'react';
import { MessageSquare, Send, User, CheckCircle2, Star } from 'lucide-react';
import { motion } from 'motion/react';

export const FeedbackBox: React.FC = () => {
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    
    setSubmitting(true);
    // 模拟本地提交
    setTimeout(() => {
      setSubmitted(true);
      setContent('');
      setNickname('');
      setRating(5);
      setSubmitting(false);
      
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="feedback-box">
      {/* Feedback Form */}
      <div className="p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-sakura-pink/10 rounded-xl">
            <MessageSquare size={24} className="text-sakura-rose" />
          </div>
          <div>
            <h2 className="text-2xl font-serif italic text-sakura-deep">意见反馈</h2>
            <p className="text-sm text-sakura-rose/60">您的建议对我们非常重要（本地模式）</p>
          </div>
        </div>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-serif italic text-sakura-deep mb-2">感谢您的建议！</h3>
            <p className="text-sakura-rose/60">反馈已记录，我们将不断优化学习体验。</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 bg-sakura-pink/5 rounded-2xl border border-sakura-pink/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sakura-deep mb-1 ml-1">您的昵称</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-sakura-rose/40" size={16} />
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="匿名用户"
                      maxLength={30}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-sakura-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sakura-rose/20 transition-all font-sans"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sakura-deep mb-2 ml-1">满意度评分</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="p-1 transition-transform active:scale-125"
                      >
                        <Star 
                          size={24} 
                          className={`${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sakura-deep mb-1 ml-1">改进建议</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="有什么想对开发者说的话？"
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-3 bg-white border border-sakura-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sakura-rose/20 transition-all resize-none h-full font-sans"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!content.trim() || submitting}
                className="flex items-center gap-2 px-8 py-3 bg-sakura-rose text-white rounded-full hover:bg-sakura-deep transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sakura-rose/20 font-bold"
              >
                {submitting ? <Send size={18} className="animate-spin opacity-50" /> : <Send size={18} />}
                提交反馈
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
