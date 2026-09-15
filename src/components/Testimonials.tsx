"use client";

import React from "react";
import Image from "next/image";
import { Star, CheckCircle2, MessageCircle, Heart, ShieldCheck } from "lucide-react";

export function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 sm:py-28 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#F0EAE1] text-xs font-semibold text-[#B38E46] tracking-wide uppercase">
            Depoimentos Verificados
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1917] tracking-tight">
            Quem usou e leu no altar <span className="italic text-[#B38E46]">sem tremer a voz</span>
          </h2>

          <p className="text-base sm:text-lg text-[#78716C] font-light leading-relaxed">
            Mais de 3.420 noivos e noivas de todo o Brasil já transformaram a ansiedade do altar em lágrimas de alívio e pura emoção.
          </p>
        </div>

        {/* Testimonials Grid + Couple Photo */}
        <div className="mt-14 grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Couple Social Proof Real Photo (Nano Banana generated) */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-[#F0EAE1] shadow-luxury bg-white aspect-square lg:aspect-auto">
            <Image
              src="/images/couple-social-proof.jpg"
              alt="Casal brasileiro recém-casado rindo com cumplicidade no dia do casamento sob luz dourada"
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/85 via-transparent to-transparent pointer-events-none" />

            {/* Overlay badge */}
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <div className="flex items-center gap-1.5 text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C5A059]" />
                ))}
                <span className="text-xs font-semibold text-white ml-2">5.0 de avaliação média</span>
              </div>

              <p className="font-serif-luxury text-xl sm:text-2xl text-white font-medium leading-snug">
                &ldquo;Os convidados vieram nos perguntar qual poeta da família tinha escrito nossos votos.&rdquo;
              </p>
              
              <p className="text-xs text-white/80">
                — Gabriela & Bruno, casados em Ilhabela/SP
              </p>
            </div>
          </div>

          {/* Testimonial Cards Right Column */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            
            {/* Card 1: Noivo Rafael */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F0EAE1] shadow-luxury hover:shadow-luxury-hover transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#C5A059]/40 relative">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                      alt="Rafael S."
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-[#1C1917] flex items-center gap-1.5">
                      Rafael S.
                      <CheckCircle2 className="w-4 h-4 text-[#B38E46]" />
                    </h4>
                    <span className="text-xs text-[#78716C]">29 anos, Engenheiro • São Paulo/SP</span>
                  </div>
                </div>

                <div className="flex text-[#C5A059]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059]" />
                  ))}
                </div>
              </div>

              <p className="font-serif-luxury text-base sm:text-lg text-[#1C1917] leading-relaxed italic">
                &ldquo;Eu sou engenheiro, zero romântico com palavras. Faltavam 3 dias pro casamento e eu estava sem dormir de tanta ansiedade. O VotosPerfeitos salvou a minha vida. Consegui falar tudo o que sentia sem travar, e minha esposa chorou do início ao fim.&rdquo;
              </p>

              <div className="mt-4 pt-3 border-t border-[#F0EAE1] flex items-center justify-between text-[11px] text-[#78716C]">
                <span>Usou a versão: <strong>Lágrimas & Coração</strong></span>
                <span className="text-[#B38E46] font-medium">Compra verificada</span>
              </div>
            </div>

            {/* Card 2: Noiva Camila */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F0EAE1] shadow-luxury hover:shadow-luxury-hover transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#C5A059]/40 relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                      alt="Camila M."
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-[#1C1917] flex items-center gap-1.5">
                      Camila M.
                      <CheckCircle2 className="w-4 h-4 text-[#B38E46]" />
                    </h4>
                    <span className="text-xs text-[#78716C]">31 anos, Médica • Curitiba/PR</span>
                  </div>
                </div>

                <div className="flex text-[#C5A059]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059]" />
                  ))}
                </div>
              </div>

              <p className="font-serif-luxury text-base sm:text-lg text-[#1C1917] leading-relaxed italic">
                &ldquo;O medo de falar em público me paralisava só de pensar no microfone. Escolhi a versão &apos;Sorrisos e Cumplicidade&apos; e foi o momento mais elogiado da festa inteira. Parecia que uma amiga íntima tinha sentado comigo numa tarde de café e escrito cada vírgula.&rdquo;
              </p>

              <div className="mt-4 pt-3 border-t border-[#F0EAE1] flex items-center justify-between text-[11px] text-[#78716C]">
                <span>Usou a versão: <strong>Sorrisos & Cumplicidade</strong></span>
                <span className="text-[#B38E46] font-medium">Compra verificada</span>
              </div>
            </div>

            {/* Card 3: WhatsApp Realistic Chat Mockup */}
            <div className="bg-[#EFEAE2] rounded-3xl p-5 sm:p-6 border border-[#E0D8C8] shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[#D8CEBA] mb-3 text-xs text-[#54656F]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-[#111B21]">Feedback no WhatsApp de Suporte</span>
                </div>
                <span>Hoje às 11:42</span>
              </div>

              {/* Chat Bubble */}
              <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-lg space-y-2 border border-[#E5DFD5]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#075E54]">Juliana Noiva 👰‍♀️</span>
                  <span className="text-[10px] text-gray-400">11:42</span>
                </div>
                <p className="text-xs sm:text-sm text-[#111B21] leading-relaxed">
                  &ldquo;Gente, deu super certo! 😍 Todo mundo achou que eu contratei um escritor particular haha. O padre até comentou no final que nunca tinha visto votos tão bem equilibrados. Valeu cada centavo dos 47 reais! Já indiquei pra 3 amigas que casam esse ano ❤️&rdquo;
                </p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400">
                  <span>11:42</span>
                  <span className="text-[#53BDEB]">✓✓</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
