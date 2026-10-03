"use client";

import React from "react";
import Image from "next/image";
import { Heart, ShieldCheck, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface HeroProps {
  onOpenQuiz: () => void;
}

export function Hero({ onOpenQuiz }: HeroProps) {
  return (
    <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] bg-gradient-to-b from-[#FAF0E6]/70 via-[#F7F1E5]/40 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Tag Superior */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFFFF] border border-[#F0EAE1] shadow-sm text-xs sm:text-sm font-medium text-[#1C1917]">
              <span className="flex h-2 w-2 rounded-full bg-[#C5A059]" />
              <Sparkles className="h-3.5 w-3.5 text-[#B38E46]" />
              <span>6 perguntas guiadas para sair da página em branco</span>
            </div>

            {/* Headline H1 */}
            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-[56px] font-medium leading-[1.12] text-[#1C1917] tracking-tight">
              Transforme a história de vocês em <span className="italic font-normal text-[#B38E46]">votos prontos para emocionar</span> no altar.
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg lg:text-xl text-[#78716C] leading-relaxed max-w-2xl font-light">
              Responda 6 perguntas sobre vocês e receba <strong className="font-semibold text-[#1C1917]">3 versões completas dos seus votos</strong>, com pausas de leitura e PDF para imprimir ou ler no celular.
            </p>

            {/* Main CTA Block */}
            <div className="w-full sm:w-auto flex flex-col items-start gap-3 pt-2">
              <button
                onClick={onOpenQuiz}
                className="w-full sm:w-auto relative group overflow-hidden bg-[#1C1917] hover:bg-[#292524] text-white px-8 py-4 sm:py-4.5 rounded-full text-base sm:text-lg font-medium transition-all duration-300 shadow-luxury hover:shadow-luxury-hover border border-[#C5A059]/30 hover:border-[#C5A059] cursor-pointer flex items-center justify-center gap-3"
              >
                <span className="font-semibold tracking-wide">Criar meus votos por R$ 47</span>
                <ArrowRight className="w-5 h-5 text-[#C5A059] transition-transform duration-300 group-hover:translate-x-1" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              </button>

              {/* Zero Friction Subtext */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#78716C] pt-1">
                <span className="font-medium text-[#B38E46]">3 versões + 3 PDFs</span>
                <span className="text-[#C5A059]">•</span>
                <span>Pagamento único</span>
                <span className="text-[#C5A059]">•</span>
                <span className="flex items-center gap-1 text-[#1C1917]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B38E46]" />
                  Garantia de 7 dias
                </span>
              </div>
            </div>

            {/* Social Proof Trust Badges */}
            <div className="pt-4 sm:pt-6 flex flex-wrap items-center gap-4 border-t border-[#F0EAE1] w-full">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-[#F0EAE1] bg-white px-3 py-2 shadow-sm">
                  <span className="block text-sm font-semibold text-[#1C1917]">6</span>
                  <span className="text-[10px] uppercase tracking-wide text-[#78716C]">perguntas</span>
                </div>
                <div className="rounded-2xl border border-[#F0EAE1] bg-white px-3 py-2 shadow-sm">
                  <span className="block text-sm font-semibold text-[#1C1917]">3</span>
                  <span className="text-[10px] uppercase tracking-wide text-[#78716C]">versões</span>
                </div>
                <div className="rounded-2xl border border-[#F0EAE1] bg-white px-3 py-2 shadow-sm">
                  <span className="block text-sm font-semibold text-[#1C1917]">7 dias</span>
                  <span className="text-[10px] uppercase tracking-wide text-[#78716C]">garantia</span>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-[#B38E46]">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i} className="text-xs">★</span>
                  ))}
                  <span className="text-xs font-semibold text-[#1C1917] ml-1">relatos recebidos</span>
                </div>
                <p className="text-xs sm:text-sm text-[#78716C] font-normal">
                  <strong className="font-semibold text-[#1C1917]">Amostras anonimizadas</strong> de noivos que saíram da página em branco
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Mockup Card + Editorial Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Altar Photo (Nano Banana generation) */}
              <div className="relative rounded-3xl overflow-hidden border border-[#F0EAE1] shadow-2xl bg-white aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5]">
                <Image
                  src="/images/hero-groom-altar.jpg"
                  alt="Noivo emocionado lendo votos sob medida no altar com lágrima de alegria"
                  fill
                  priority
                  className="object-cover object-top hover:scale-[1.02] transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* Photo subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Badge on Photo */}
                <div className="absolute bottom-4 lg:bottom-12 left-4 right-4 text-white text-xs sm:text-sm font-light flex items-center justify-between backdrop-blur-md bg-black/35 px-4 py-2.5 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#C5A059] fill-[#C5A059]" />
                    <span>Votos com pausas de leitura</span>
                  </div>
                  <span className="text-[#FAF8F5]/80 text-[11px]">para ajustar com calma</span>
                </div>
              </div>

              {/* In-flow preview: small desktop overlap, separate card on mobile. */}
              <div className="relative z-10 mt-4 lg:-mt-8 lg:mx-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-[#F0EAE1] p-5 shadow-[0_12px_32px_rgba(28,25,23,0.10)]">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#9C7836]">
                    Lágrimas &amp; Coração
                  </span>
                  <span className="text-xs text-[#78716C]">Exemplo de votos</span>
                </div>

                <p className="mt-3 italic font-serif-luxury text-base leading-relaxed text-[#1C1917]">
                  &ldquo;Lucas, eu não fazia ideia de que aquele café na chuva seria o começo da nossa história...&rdquo;
                </p>

                <div className="mt-3 pt-2 border-t border-[#F0EAE1] flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1.5 text-xs text-[#78716C]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#9C7836] shrink-0" />
                    Com pausas de leitura
                  </span>
                  <button
                    onClick={onOpenQuiz}
                    className="min-h-11 text-[#9C7836] hover:text-[#785B29] text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9C7836] rounded"
                  >
                    Criar meus votos
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
