import React, { useRef, useEffect, useState } from 'react';
import { PencilLine, RotateCcw } from 'lucide-react';

interface WritingCanvasProps {
  kana: string;
  romaji: string;
  strokeOrderUrl?: string;
}

export const WritingCanvas: React.FC<WritingCanvasProps> = ({ kana, strokeOrderUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size based on display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Initial styles
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#E11D48'; // sakura-rose
    context.lineWidth = 6;

    setCtx(context);
    
    // Clear canvas when kana changes
    context.clearRect(0, 0, canvas.width, canvas.height);
  }, [kana]);

  const startDrawing = (e: React.PointerEvent) => {
    if (!ctx) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing || !ctx) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full py-4">
      <div className="relative group">
        {/* Canvas Container */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white rounded-3xl shadow-inner border-2 border-sakura-pink/20 overflow-hidden touch-none">
          {/* Background Guide (Ghost Text) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[160px] md:text-[200px] text-sakura-pink/10 font-bold leading-none">
              {kana}
            </span>
          </div>

          {/* Grid Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-0 w-full h-px border-t border-dashed border-sakura-rose" />
            <div className="absolute top-0 left-1/2 h-full w-px border-l border-dashed border-sakura-rose" />
          </div>

          {/* Drawing Layer */}
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className="absolute inset-0 w-full h-full cursor-crosshair z-10"
          />
        </div>

        {/* Floating Controls */}
        <div className="absolute -right-12 top-0 flex flex-col gap-2">
          <button
            onClick={clearCanvas}
            className="p-3 bg-white hover:bg-sakura-pink/10 text-sakura-rose rounded-xl shadow-lg border border-sakura-pink/20 transition-all active:scale-90"
            title="清除"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center text-center max-w-xs">
        <h4 className="text-lg font-bold text-sakura-deep flex items-center gap-2">
          <PencilLine size={18} className="text-sakura-rose" />
          书写练习: {kana}
        </h4>
        <p className="text-xs text-sakura-rose/60 mt-2 font-serif italic leading-relaxed">
          请在上方区域临摹假名。虚影和虚线可以帮助您更好地掌握间架结构。
        </p>
      </div>

      {strokeOrderUrl && (
        <div className="mt-4 p-4 bg-sakura-light/30 rounded-2xl border border-sakura-pink/10 w-full">
          <p className="text-[10px] text-sakura-rose/40 uppercase tracking-widest font-bold mb-3 text-center">
            笔顺参考 (静态)
          </p>
          <div className="flex justify-center">
            <img 
              src={strokeOrderUrl} 
              alt={`Stroke order for ${kana}`}
              className="w-32 h-32 opacity-80"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
