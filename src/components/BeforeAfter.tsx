"use client";

import React, { useState } from "react";
import { MessageSquareHeart, CheckCircle2, Sparkles } from "lucide-react";

interface BeforeAfterProps {
  onOpenQuiz: () => void;
}

export function BeforeAfter({ onOpenQuiz }: BeforeAfterProps) {
  const [viewMode, setViewMode] = useState<"both" | "before" | "after">("both");

  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden border-t border-[#F0EAE1]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#F0EAE1] text-xs font-semibold text-[#B38E46] tracking-wide uppercase">
            Veja um exemplo
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1917] tracking-tight">
            Suas lembranças já dizem muito. <span className="italic text-[#B38E46]">Veja como elas viram votos.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#78716C] font-light leading-relaxed">
            Neste exemplo ilustrativo, as mesmas memórias aparecem nas anotações e nos votos. O que muda é a forma de contar e de ligar a história às promessas.
          </p>
        </div>

        {/* Interactive View Toggle (especially useful on mobile) */}
        <div className="mt-10 flex md:hidden justify-center gap-2 p-1 bg-[#FAF8F5] rounded-full border border-[#F0EAE1] max-w-xs mx-auto">
          <button
            onClick={() => setViewMode("before")}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
              viewMode === "before" ? "bg-[#F7F1E5] text-[#9C7836] border border-[#F0EAE1]" : "text-[#78716C]"
            }`}
          >
            As lembranças
          </button>
          <button
            onClick={() => setViewMode("after")}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-all ${
              viewMode === "after" ? "bg-[#1C1917] text-white" : "text-[#78716C]"
            }`}
          >
            Os votos
          </button>
        </div>

        {/* Side by Side Grid */}
        <div className="mt-12 grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Card ANTES */}
          <div
            className={`bg-[#FAF8F5] rounded-3xl p-7 sm:p-9 border border-[#F0EAE1]/70 shadow-sm flex flex-col justify-between relative transition-all ${
              viewMode === "after" ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-2">
                  <MessageSquareHeart className="w-5 h-5 text-[#B38E46] shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9C7836]">
                    O que você conta:
                  </span>
                </div>
                <span className="text-[11px] bg-[#F7F1E5]/60 text-[#9C7836] px-2.5 py-0.5 rounded-full font-medium">
                  Ponto de partida
                </span>
              </div>

              {/* Text Before */}
              <div className="bg-white/80 p-6 rounded-2xl border border-[#F0EAE1] italic text-sm sm:text-base text-[#78716C] leading-relaxed font-serif-luxury">
                &ldquo;Conheci o Lucas numa padaria, num sábado de chuva. Ele derrubou café na camisa e a gente começou a rir. Hoje ele é meu melhor amigo. Quero prometer estar ao lado dele, inclusive nos dias difíceis.&rdquo;
              </div>

              {/* Analysis of problems */}
              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-semibold uppercase text-[#9C7836] tracking-wider">
                  Você já tem o essencial:
                </p>
                <ul className="text-xs text-[#78716C] space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-[#B38E46] font-bold">✓</span>
                    <span>Uma lembrança de como tudo começou.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B38E46] font-bold">✓</span>
                    <span>Um detalhe que faz vocês sorrirem.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B38E46] font-bold">✓</span>
                    <span>Uma promessa que você quer fazer.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#F0EAE1] text-xs text-[#9C7836]/80 font-medium">
              Frases simples são um ótimo começo. Não precisa escrever bonito.
            </div>
          </div>

          {/* Card DEPOIS (VotosPerfeitos) */}
          <div
            className={`bg-white rounded-3xl p-7 sm:p-9 border-2 border-[#C5A059] shadow-luxury hover:shadow-luxury-hover flex flex-col justify-between relative transition-all ${
              viewMode === "before" ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Top Recommended Tag */}
            <div className="absolute -top-3.5 right-6 bg-[#B38E46] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              A mesma história, em palavras
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#B38E46] shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                    Uma versão dos votos:
                  </span>
                </div>
                <span className="text-[11px] bg-[#F7F1E5] text-[#9C7836] px-2.5 py-0.5 rounded-full font-medium">
                  Com a sua história
                </span>
              </div>

              {/* Text After */}
              <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#F0EAE1] text-sm sm:text-base text-[#1C1917] leading-relaxed font-serif-luxury italic">
                &ldquo;Lucas, nossa história começou num sábado de chuva, numa padaria e com café na sua camisa. A gente riu junto antes mesmo de se conhecer direito. Hoje, aqui no altar, eu vejo naquele encontro o começo da amizade que eu mais quero cuidar. Prometo estar ao seu lado nos dias bons e nos difíceis. E continuar encontrando motivos para rir com você, mesmo quando os planos saírem do avesso.&rdquo;
              </div>

              {/* Analysis of why it works */}
              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-semibold uppercase text-[#B38E46] tracking-wider">
                  O que ganhou forma:
                </p>
                <ul className="text-xs text-[#1C1917] space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-[#B38E46] font-bold">✓</span>
                    <span><strong>Um começo pessoal:</strong> a padaria, a chuva e o café são parte da história.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B38E46] font-bold">✓</span>
                    <span><strong>Uma ligação com o presente:</strong> o primeiro encontro dá lugar à amizade de hoje.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B38E46] font-bold">✓</span>
                    <span><strong>Uma promessa clara:</strong> o texto termina com o que você quer construir a dois.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#F0EAE1] flex items-center justify-between">
              <span className="text-xs text-[#B38E46] font-semibold">
                A história continua sendo sua.
              </span>
              <button
                onClick={onOpenQuiz}
                className="text-xs font-bold text-[#1C1917] hover:text-[#B38E46] flex items-center gap-1 transition-colors cursor-pointer"
              >
                Criar meus votos ➔
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
