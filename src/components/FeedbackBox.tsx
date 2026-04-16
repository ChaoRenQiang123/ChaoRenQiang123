import React, { useState } from 'react';
import { MessageSquare, Send, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const FeedbackBox: React.FC = () => {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    // In the original version, this might have been a simple local state or email link
    // For now, we'll just show a success message
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContent('');
      setAuthor('');
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20" id="feedback-box">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-sakura-pink/10 rounded-xl">
          <MessageSquare size={24} className="text-sakura-rose" />
        </div>
        <div>
          <h2 className="text-2xl font-serif italic text-sakura-deep">意见反馈</h2>
          <p className="text-sm text-sakura-rose/60">您的建议是我们进步的动力</p>
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
          <h3 className="text-xl font-serif italic text-sakura-deep mb-2">提交成功！</h3>
          <p className="text-sakura-rose/60">感谢您的宝贵建议，我们会认真参考。</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 bg-sakura-pink/5 rounded-2xl border border-sakura-pink/10">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-sakura-deep mb-1 ml-1">昵称 (可选)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-sakura-rose/40" size={16} />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="匿名用户"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-sakura-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sakura-rose/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-sakura-deep mb-1 ml-1">改进建议</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请描述您希望改进的功能或发现的问题..."
                rows={4}
                className="w-full px-4 py-3 bg-white border border-sakura-pink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sakura-rose/20 transition-all resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-sakura-rose text-white rounded-full hover:bg-sakura-deep transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sakura-rose/20"
            >
              <Send size={18} />
              提交建议
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
