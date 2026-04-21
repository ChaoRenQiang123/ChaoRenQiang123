import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, CheckCircle2, Star, Clock, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackItem {
  id: string;
  nickname: string;
  content: string;
  rating: number;
  createdAt: { seconds: number; nanoseconds: number } | any;
}

export const FeedbackBox: React.FC = () => {
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch feedbacks from our Backend Bridge (Cloud Run Bridge)
  // This solves the Google/Firebase blocking issue in China
  const fetchFeedbacks = async () => {
    try {
      const response = await fetch('/api/feedbacks');
      if (!response.ok) throw new Error('同步失败');
      const data = await response.json();
      setFeedbacks(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
      setError('无法连接到留言服务器，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    
    // Simulating real-time with polling every 30 seconds
    const interval = setInterval(fetchFeedbacks, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickname.trim() || '匿名用户',
          content: content.trim(),
          rating,
        }),
      });

      if (!response.ok) throw new Error('发布失败');
      
      setSubmitted(true);
      setContent('');
      setNickname('');
      setRating(5);
      
      // Refresh list immediately after posting
      fetchFeedbacks();
      
      setTimeout(() => {
        setSubmitted(false);
        setSubmitting(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      alert('留言发布失败，请检查网络连接');
      setSubmitting(false);
    }
  };

  const formatDate = (createdAt: any) => {
    if (!createdAt) return '刚刚';
    
    let date: Date;
    if (createdAt.seconds) {
      date = new Date(createdAt.seconds * 1000);
    } else {
      date = new Date(createdAt);
    }

    if (isNaN(date.getTime())) return '刚刚';

    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
            <p className="text-sm text-sakura-rose/60">通过云端桥接技术，国内用户可直接访问</p>
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
            <p className="text-sakura-rose/60">感谢您的宝贵建议，全世界的学习者都会看到。</p>
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
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                发布意见
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Shared Feedback Board */}
      <div className="p-6 bg-white/40 backdrop-blur-sm rounded-3xl border border-sakura-pink/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-serif italic text-sakura-deep flex items-center gap-2">
            🌸 公共留言板
            <span className="text-xs bg-sakura-rose/10 text-sakura-rose px-2 py-0.5 rounded-full not-italic font-sans">
              节点直连
            </span>
          </h3>
          <button 
            onClick={fetchFeedbacks}
            className="text-sakura-rose/40 hover:text-sakura-rose transition-colors"
          >
            <Clock size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-sakura-pink/30 gap-4">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm italic">正在同步云端意见...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-20 text-center text-sakura-rose/30">
            <p className="italic">还没有人留言，抢个沙发吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {feedbacks.map((fb) => (
                <motion.div
                  key={fb.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-white rounded-2xl border border-sakura-pink/5 hover:border-sakura-pink/20 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-sakura-pink/10 rounded-full flex items-center justify-center text-sakura-rose font-bold text-xs uppercase">
                          {(fb.nickname || '匿').charAt(0)}
                        </div>
                        <span className="font-bold text-sakura-deep text-sm">{fb.nickname || '匿名用户'}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={10} 
                            className={i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sakura-deep/80 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                      {fb.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sakura-rose/30 text-[10px] font-mono">
                    <Clock size={10} />
                    {formatDate(fb.createdAt)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
