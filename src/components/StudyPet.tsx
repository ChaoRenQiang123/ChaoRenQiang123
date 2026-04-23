import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Volume2, X } from 'lucide-react';
import { generateAudio } from '../services/gemini';
import { playRawAudio, speakWithBrowser } from '../utils/audio';

const PET_QUOTES = [
  { jp: "がんばって！", cn: "加油！" },
  { jp: "お疲れ様です！", cn: "辛苦了！" },
  { jp: "日本語、上手ですね！", cn: "日语说得真棒！" },
  { jp: "今日も一歩前進！", cn: "今天也进步了一点点！" },
  { jp: "休憩も大切ですよ。", cn: "休息也很重要哦。" },
  { jp: "一緒に勉強しましょう！", cn: "一起学习吧！" },
  { jp: "お腹空きましたか？", cn: "肚子饿了吗？" }
];

export const StudyPet: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [bubbleText, setBubbleText] = useState<{jp: string, cn: string} | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 随机冒泡逻辑
  useEffect(() => {
    const triggerBubble = () => {
      const randomQuote = PET_QUOTES[Math.floor(Math.random() * PET_QUOTES.length)];
      setBubbleText(randomQuote);
      
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      bubbleTimeoutRef.current = setTimeout(() => {
        setBubbleText(null);
      }, 5000);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% 概率触发
        triggerBubble();
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    };
  }, []);

  const handlePetClick = async () => {
    if (isSpeaking) return;
    
    const quote = PET_QUOTES[Math.floor(Math.random() * PET_QUOTES.length)];
    setBubbleText(quote);
    setIsSpeaking(true);

    try {
      const audio = await generateAudio(quote.jp);
      if (audio) {
        await playRawAudio(audio);
      } else {
        await speakWithBrowser(quote.jp);
      }
    } catch (e) {
      console.error("Pet audio failed", e);
    } finally {
      setIsSpeaking(false);
      setTimeout(() => setBubbleText(null), 3000);
    }
  };

  if (!isVisible) return (
    <button 
      onClick={() => setIsVisible(true)}
      className="fixed bottom-4 right-4 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-sakura-rose border border-sakura-pink/20 z-[100] md:bottom-8 md:right-8"
    >
      < Sparkles size={20} className="animate-pulse" />
    </button>
  );

  return (
    <div className="fixed top-20 right-4 md:top-auto md:bottom-8 md:right-8 z-[100] flex flex-col md:flex-col-reverse items-end gap-2 pointer-events-none transition-all duration-500">
      {/* The Cat Pet */}
      <motion.div
        className="relative group pointer-events-auto cursor-pointer"
        animate={{ 
          y: [0, -10, 0],
          scale: isSpeaking ? [1, 1.05, 1] : 1
        }}
        transition={{ 
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.2, repeat: isSpeaking ? Infinity : 0 }
        }}
        onClick={handlePetClick}
      >
        {/* Sakura Mochi Cat (Minimalist SVG Design) */}
        <div className="w-20 h-20 md:w-24 md:h-24 relative flex items-center justify-center">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-75 md:scale-100 drop-shadow-lg">
            {/* Curvy Tail */}
            <motion.path 
              d="M70 65C85 65 90 40 80 35C70 30 75 55 65 60" 
              stroke="#FFE4E8" strokeWidth="6" strokeLinecap="round" 
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: "65px", originY: "60px" }}
            />
            
            {/* Body */}
            <circle cx="50" cy="55" r="38" fill="white" stroke="#FFE4E8" strokeWidth="2" />
            
            {/* Ears (Cat Style) */}
            <path d="M30 25L20 45L40 35Z" fill="white" stroke="#FFE4E8" strokeWidth="2" strokeLinejoin="round" />
            <path d="M70 25L80 45L60 35Z" fill="white" stroke="#FFE4E8" strokeWidth="2" strokeLinejoin="round" />
            <path d="M32 30L26 40L38 34Z" fill="#FFB7C5" opacity="0.4" />
            <path d="M68 30L74 40L62 34Z" fill="#FFB7C5" opacity="0.4" />

            {/* Eyes (Blinking animation) */}
            <motion.g animate={{ scaleY: [1, 1, 0.1, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}>
              <circle cx="38" cy="52" r="3" fill="#4A4A4A" /><circle cx="62" cy="52" r="3" fill="#4A4A4A" />
            </motion.g>

            {/* Blush */}
            <circle cx="28" cy="62" r="5" fill="#FFB7C5" opacity="0.3" /><circle cx="72" cy="62" r="5" fill="#FFB7C5" opacity="0.3" />

            {/* Whiskers */}
            <path d="M25 55H15M25 58H12M25 61H15" stroke="#FFE4E8" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M75 55H85M75 58H88M75 61H85" stroke="#FFE4E8" strokeWidth="1.5" strokeLinecap="round" />

            {/* Nose & Mouth */}
            <path d="M48 58L50 60L52 58" stroke="#FFB7C5" strokeWidth="1.5" fill="none" />
            
            {/* Sakura flower on head */}
            <path d="M50 25C50 25 45 20 50 15C55 20 50 25 50 25Z" fill="#FFA3B1" /><path d="M50 25C50 25 55 20 60 25C55 30 50 25 50 25Z" fill="#FFA3B1" /><path d="M50 25C50 25 55 30 50 35C45 30 50 25 50 25Z" fill="#FFA3B1" /><path d="M50 25C50 25 45 30 40 25C45 20 50 25 50 25Z" fill="#FFA3B1" /><circle cx="50" cy="25" r="2" fill="#FFE4E1" />
          </svg>

          {/* Floating Sakura Petals (Particle effect when speaking) */}
          <AnimatePresence>
            {isSpeaking && [...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: (i - 2) * 20, y: -50 - (i * 10) }}
                exit={{ opacity: 0 }}
                className="absolute w-2 h-2 bg-pink-200 rounded-full"
                style={{ borderRadius: '50% 0 50% 50%' }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Close Button on Hover */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute top-0 right-0 w-6 h-6 bg-stone-100 rounded-full items-center justify-center text-stone-400 hidden group-hover:flex border border-stone-200 shadow-sm"
        >
          <X size={12} />
        </button>
      </motion.div>

      {/* Speech Bubble */}
      <AnimatePresence>
        {bubbleText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-sakura-pink/10 max-w-[150px] pointer-events-auto"
          >
            <div className="relative">
              <p className="text-xs font-bold text-sakura-deep">{bubbleText.jp}</p>
              <p className="text-[9px] text-sakura-rose/60 italic">{bubbleText.cn}</p>
              {/* Arrow adjusted based on mobile/desktop */}
              <div className="absolute -top-4 right-4 md:top-auto md:-bottom-4 w-3 h-3 bg-white border-l border-t md:border-l-0 md:border-t-0 md:border-r md:border-b border-sakura-pink/10 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sparkles: React.FC<{size: number, className?: string}> = ({size, className}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);
