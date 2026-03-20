import React, { useState, useEffect } from 'react';
import { 
  db, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  handleFirestoreError, 
  OperationType,
  Timestamp
} from '../firebase';
import { Feedback } from '../types';
import { MessageSquare, Send, User, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FeedbackBox: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Feedback[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Feedback);
      });
      setFeedbacks(items);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'feedbacks');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        content: content.trim(),
        author: author.trim() || '匿名用户',
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setContent('');
      setAuthor('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'feedbacks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '刚刚';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20" id="feedback-box">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-sakura-pink/10 rounded-xl">
          <MessageSquare size={24} className="text-sakura-rose" />
        </div>
        <div>
          <h2 className="text-2xl font-serif italic text-sakura-deep">意见箱</h2>
          <p className="text-sm text-sakura-rose/60">您的建议是我们进步的动力</p>
        </div>
      </div>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="mb-12 p-6 bg-sakura-pink/5 rounded-2xl border border-sakura-pink/10">
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
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-sakura-rose text-white rounded-full hover:bg-sakura-deep transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sakura-rose/20"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            提交建议
          </button>
        </div>
      </form>

      {/* Feedback List */}
      <div className="space-y-6">
        <h3 className="text-lg font-serif italic text-sakura-deep flex items-center gap-2">
          公开建议列表 ({feedbacks.length})
        </h3>
        
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-sakura-pink">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-serif italic">正在加载建议...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-12 text-center text-sakura-rose/40 font-serif italic border-2 border-dashed border-sakura-pink/10 rounded-2xl">
            暂无建议，快来留下第一个吧！
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {feedbacks.map((fb, index) => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 bg-white border border-sakura-pink/10 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-sakura-pink/10 flex items-center justify-center text-sakura-rose">
                        <User size={14} />
                      </div>
                      <span className="font-medium text-sakura-deep">{fb.author}</span>
                    </div>
                    {fb.status === 'implemented' && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full font-medium">
                        <CheckCircle2 size={12} />
                        已采纳
                      </span>
                    )}
                  </div>
                  <p className="text-stone-700 leading-relaxed mb-4 whitespace-pre-wrap">
                    {fb.content}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-sakura-rose/40">
                    <Clock size={12} />
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
