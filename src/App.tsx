import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { KanaChart } from './components/KanaChart';
import { Translator } from './components/Translator';
import { ReadingAnalysis } from './components/ReadingAnalysis';
import { GrammarLearning } from './components/GrammarLearning';
import { VocabularyList } from './components/VocabularyList';
import { FeedbackBox } from './components/FeedbackBox';
import { Flower, Book, Layout, MessageSquare, FileText, GraduationCap, List, HelpCircle } from 'lucide-react';
import { startPreloading } from './services/dataService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'kana' | 'translator' | 'reading' | 'grammar' | 'vocabList' | 'feedback'>('kana');

  useEffect(() => {
    // Start preloading data in the background to reduce wait time
    startPreloading();
  }, []);

  return (
    <div className="min-h-screen bg-sakura-light text-sakura-deep font-sans selection:bg-sakura-pink/30">
      {/* Sidebar / Navigation (Desktop) */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-sakura-pink/20 flex-col p-4 z-50">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 bg-sakura-rose rounded-xl flex items-center justify-center text-white shadow-lg shadow-sakura-pink/20">
            <Flower size={24} />
          </div>
          <span className="font-serif italic text-xl font-bold tracking-tight text-sakura-deep">Sakura Learn</span>
        </div>

        <div className="space-y-2 flex-1">
          <button
            onClick={() => setActiveTab('kana')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeTab === 'kana' ? 'bg-sakura-pink/20 text-sakura-rose' : 'text-stone-400 hover:text-sakura-rose hover:bg-sakura-pink/10'}`}
          >
            <Layout size={20} />
            <span className="font-medium">五十音图</span>
          </button>
          <button
            onClick={() => setActiveTab('vocabList')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeTab === 'vocabList' ? 'bg-sakura-pink/20 text-sakura-rose' : 'text-stone-400 hover:text-sakura-rose hover:bg-sakura-pink/10'}`}
          >
            <List size={20} />
            <span className="font-medium">核心词表</span>
          </button>
          <button
            onClick={() => setActiveTab('grammar')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeTab === 'grammar' ? 'bg-sakura-pink/20 text-sakura-rose' : 'text-stone-400 hover:text-sakura-rose hover:bg-sakura-pink/10'}`}
          >
            <GraduationCap size={20} />
            <span className="font-medium">语法学习</span>
          </button>
          <button
            onClick={() => setActiveTab('reading')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeTab === 'reading' ? 'bg-sakura-pink/20 text-sakura-rose' : 'text-stone-400 hover:text-sakura-rose hover:bg-sakura-pink/10'}`}
          >
            <FileText size={20} />
            <span className="font-medium">模拟真题阅读</span>
          </button>
          <button
            onClick={() => setActiveTab('translator')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeTab === 'translator' ? 'bg-sakura-pink/20 text-sakura-rose' : 'text-stone-400 hover:text-sakura-rose hover:bg-sakura-pink/10'}`}
          >
            <MessageSquare size={20} />
            <span className="font-medium">智能翻译</span>
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeTab === 'feedback' ? 'bg-sakura-pink/20 text-sakura-rose' : 'text-stone-400 hover:text-sakura-rose hover:bg-sakura-pink/10'}`}
          >
            <HelpCircle size={20} />
            <span className="font-medium">意见箱</span>
          </button>
        </div>

        <div className="mt-auto p-4">
          <div className="bg-white/50 rounded-2xl p-4 border border-sakura-pink/10">
            <p className="text-xs text-sakura-rose/60 mb-1 font-medium">今日进度</p>
            <div className="h-1.5 w-full bg-sakura-pink/20 rounded-full overflow-hidden">
              <div className="h-full bg-sakura-rose w-1/3" />
            </div>
            <p className="text-[10px] text-sakura-rose/40 mt-2 italic">继续加油！</p>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-sakura-pink/20 flex justify-around p-2 z-50 pb-safe">
        <button
          onClick={() => setActiveTab('kana')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'kana' ? 'text-sakura-rose' : 'text-stone-400'}`}
        >
          <Layout size={20} />
          <span className="text-[10px] font-medium">五十音</span>
        </button>
        <button
          onClick={() => setActiveTab('vocabList')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'vocabList' ? 'text-sakura-rose' : 'text-stone-400'}`}
        >
          <List size={20} />
          <span className="text-[10px] font-medium">词表</span>
        </button>
        <button
          onClick={() => setActiveTab('grammar')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'grammar' ? 'text-sakura-rose' : 'text-stone-400'}`}
        >
          <GraduationCap size={20} />
          <span className="text-[10px] font-medium">语法</span>
        </button>
        <button
          onClick={() => setActiveTab('reading')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'reading' ? 'text-sakura-rose' : 'text-stone-400'}`}
        >
          <FileText size={20} />
          <span className="text-[10px] font-medium">阅读</span>
        </button>
        <button
          onClick={() => setActiveTab('translator')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'translator' ? 'text-sakura-rose' : 'text-stone-400'}`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px] font-medium">助手</span>
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'feedback' ? 'text-sakura-rose' : 'text-stone-400'}`}
        >
          <HelpCircle size={20} />
          <span className="text-[10px] font-medium">反馈</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="md:pl-64 min-h-screen pb-24 md:pb-0">
        <header className={`p-4 md:p-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 ${activeTab === 'kana' ? 'md:pb-6 pb-2' : ''}`}>
          <div className="max-w-2xl">
            <h1 className={`${activeTab === 'kana' ? 'text-xl md:text-4xl' : 'text-2xl md:text-5xl'} font-serif italic mb-1 md:mb-2 text-sakura-deep transition-all`}>
              {activeTab === 'kana' && "基础假名"}
              {activeTab === 'vocabList' && "核心词表"}
              {activeTab === 'grammar' && "语法讲堂"}
              {activeTab === 'reading' && "阅读解析"}
              {activeTab === 'translator' && "智能助手"}
              {activeTab === 'feedback' && "意见反馈"}
            </h1>
            <p className="text-sakura-rose/60 text-[10px] md:text-base leading-relaxed">
              {activeTab === 'kana' && "掌握日语的第一步：平假名与片假名"}
              {activeTab === 'vocabList' && "N5-N3 等级核心单词列表，按出现频率排序，每页 50 词"}
              {activeTab === 'grammar' && "系统学习 JLPT 各等级核心语法点"}
              {activeTab === 'reading' && "JLPT 模拟真题阅读深度解析与语法收藏"}
              {activeTab === 'translator' && "翻译并自动添加振假名，辅助阅读"}
              {activeTab === 'feedback' && "留下您的宝贵意见，帮助我们做得更好"}
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-3xl font-serif italic text-sakura-pink/30">桜</p>
          </div>
        </header>

        <section className="p-3 md:p-12 pt-0 max-w-7xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'kana' && <KanaChart />}
            {activeTab === 'vocabList' && <VocabularyList />}
            {activeTab === 'grammar' && <GrammarLearning />}
            {activeTab === 'reading' && <ReadingAnalysis />}
            {activeTab === 'translator' && <Translator />}
            {activeTab === 'feedback' && <FeedbackBox />}
          </motion.div>
        </section>
      </main>
    </div>
  );
}
