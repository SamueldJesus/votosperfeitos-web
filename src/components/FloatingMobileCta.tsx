"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, PenLine } from "lucide-react";

interface FloatingMobileCtaProps {
  onOpenQuiz: () => void;
}

export function FloatingMobileCta({ onOpenQuiz }: FloatingMobileCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 400px
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-[#F0EAE1] shadow-[0_-10px_25px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom duration-300">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-[#1C1917]">3 versões + PDF</span>
            <span className="text-[10px] bg-[#E8D5CE]/50 text-[#8C5D53] px-1.5 py-0.2 rounded font-semibold">Pix</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-[#78716C]">Por</span>
            <span className="text-sm font-bold text-[#B38E46]">R$ 47,00</span>
          </div>
        </div>

        <button
          onClick={onOpenQuiz}
          className="flex-1 bg-gradient-to-r from-[#1C1917] to-[#292524] text-white py-3 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
        >
          <PenLine className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Criar por R$ 47</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
        </button>
      </div>
    </div>
  );
}
