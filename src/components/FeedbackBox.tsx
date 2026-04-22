import React from 'react';
import { MessageSquare, ExternalLink, Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const FeedbackBox: React.FC = () => {
  const FEEDBACK_URL = "https://v.wjx.cn/vm/e8Y9pH3.aspx";

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="feedback-box">
      <div className="p-8 md:p-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-sakura-pink/20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="p-4 bg-sakura-pink/10 rounded-2xl">
            <MessageSquare size={48} className="text-sakura-rose" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-serif italic text-sakura-deep">意见反馈</h2>
            <p className="text-sakura-rose/60 max-w-md mx-auto leading-relaxed">
              您的每一条建议都是我们前进的动力。为了更好地收集和整理反馈，我们启用了专门的问卷调查页面。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl py-8">
            <div className="p-4 bg-sakura-pink/5 rounded-2xl border border-sakura-pink/10">
              <Sparkles size={20} className="text-sakura-rose mx-auto mb-2" />
              <p className="text-xs font-bold text-sakura-deep mb-1">功能建议</p>
              <p className="text-[10px] text-sakura-rose/40">期待新功能？告诉我们您的想法</p>
            </div>
            <div className="p-4 bg-sakura-pink/5 rounded-2xl border border-sakura-pink/10">
              <MessageSquare size={20} className="text-sakura-rose mx-auto mb-2" />
              <p className="text-xs font-bold text-sakura-deep mb-1">问题反馈</p>
              <p className="text-[10px] text-sakura-rose/40">遇到了 Bug？我们会尽快修复</p>
            </div>
            <div className="p-4 bg-sakura-pink/5 rounded-2xl border border-sakura-pink/10">
              <Heart size={20} className="text-sakura-rose mx-auto mb-2" />
              <p className="text-xs font-bold text-sakura-deep mb-1">使用感受</p>
              <p className="text-[10px] text-sakura-rose/40">喜欢我们的应用？也请给我们鼓励</p>
            </div>
          </div>

          <motion.a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-12 py-4 bg-sakura-rose text-white rounded-full hover:bg-sakura-deep transition-all shadow-xl shadow-sakura-pink/30 font-bold text-lg group"
          >
            去填写反馈表单
            <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </motion.a>

          <p className="text-[10px] text-sakura-rose/30 mt-4 italic font-serif">
            点击按钮将跳转至“问卷星”平台 safe & secure
          </p>
        </motion.div>
      </div>
    </div>
  );
};
