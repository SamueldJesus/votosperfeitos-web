"use client";

import React from "react";
import { Check, Sparkles, ShieldCheck, Zap, ArrowRight, Clock } from "lucide-react";

interface PricingSectionProps {
  onOpenQuiz: () => void;
}

export function PricingSection({ onOpenQuiz }: PricingSectionProps) {
  return (
    <section id="preco" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#FAF0E6] via-[#F7F1E5]/40 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#F0EAE1] text-xs font-semibold text-[#B38E46] tracking-wide uppercase">
            Seu pacote de votos
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1917] tracking-tight">
            Tire os votos da lista de pendências. <span className="italic text-[#B38E46]">Leve a sua história para o altar.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#78716C] font-light leading-relaxed">
            Escolha o tom. Receba três variações inéditas e três PDFs por e-mail. Tudo no mesmo pacote, sem assinatura.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mt-14 max-w-2xl mx-auto relative">
          
          {/* Top Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#B38E46] via-[#C5A059] to-[#9C7836] text-white text-xs font-bold uppercase tracking-widest px-6 py-1.5 rounded-full shadow-md z-20 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mais Escolhido pelos Noivos</span>
          </div>

          <div className="bg-[#FAF8F5] rounded-3xl sm:rounded-[36px] border-2 border-[#C5A059]/50 p-7 sm:p-12 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 relative overflow-hidden">
            
            {/* Main Price Display */}
            <div className="py-7 text-center space-y-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#B38E46]">
                Pacote completo
              </span>
              
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-2xl sm:text-3xl font-light text-[#78716C]">R$</span>
                <span className="font-serif-luxury text-6xl sm:text-7xl font-bold text-[#1C1917] tracking-tight">
                  47<span className="text-4xl sm:text-5xl font-normal text-[#B38E46]">,00</span>
                </span>
              </div>

              <p className="text-xs text-[#78716C]">
                Pagamento único via Pix • Sem mensalidade
              </p>
            </div>

            {/* Checklist of Deliverables */}
            <div className="space-y-4 py-6 border-t border-[#F0EAE1]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                O que você leva para esse momento:
              </h4>

              <ul className="space-y-3.5 text-sm text-[#1C1917]">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#F7F1E5] flex items-center justify-center text-[#B38E46] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    <strong>Escolha o tom que combina com você.</strong> Receba três variações inéditas dentro dele, criadas a partir das suas respostas.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#F7F1E5] flex items-center justify-center text-[#B38E46] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    <strong>Comece sem um rascunho.</strong> As 6 perguntas ajudam a reunir suas lembranças e o que você quer prometer.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#F7F1E5] flex items-center justify-center text-[#B38E46] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    <strong>Receba 3 PDFs no seu e-mail.</strong> Você escolhe a sua versão favorita, ajusta se quiser e imprime no papel que preferir.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#F7F1E5] flex items-center justify-center text-[#B38E46] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    <strong>Compare com calma antes de decidir.</strong> As três variações chegam no mesmo tom para você encontrar a que parece mais sua.
                  </span>
                </li>

              </ul>
            </div>

            {/* Big CTA Button */}
            <div className="mt-8 space-y-3">
              <button
                onClick={onOpenQuiz}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-[#B38E46] via-[#C5A059] to-[#9C7836] hover:from-[#9C7836] hover:to-[#836224] text-white py-4.5 px-8 rounded-full text-base sm:text-lg font-bold transition-all duration-300 shadow-gold-glow hover:shadow-gold-glow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="text-xl">💍</span>
                <span className="tracking-wide">Quero criar meus votos</span>
                <ArrowRight className="w-5 h-5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#78716C] pt-2">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#B38E46]" />
                  6 perguntas para começar
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B38E46]" />
                  Pagamento único
                </span>
                <span>•</span>
                <span>Garantia de 7 dias</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
