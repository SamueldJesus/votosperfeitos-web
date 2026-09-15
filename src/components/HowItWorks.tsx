"use client";

import React from "react";
import { MessageSquareHeart, Cpu, FileText, ArrowRight, Check } from "lucide-react";

interface HowItWorksProps {
  onOpenQuiz: () => void;
}

export function HowItWorks({ onOpenQuiz }: HowItWorksProps) {
  const steps = [
    {
      step: "01",
      icon: MessageSquareHeart,
      title: "Conte um pouco sobre vocês",
      subtitle: "6 perguntas guiadas",
      description:
        "Como vocês se conheceram? O que faz você sorrir? O que quer prometer? Responda como se estivesse contando a uma pessoa próxima, sem se preocupar em escrever bonito.",
      bullets: [
        "Uma pergunta de cada vez",
        "Exemplos para ajudar a lembrar",
        "Pode responder com frases simples"
      ]
    },
    {
      step: "02",
      icon: Cpu,
      title: "Encontre o seu jeito de dizer",
      subtitle: "3 estilos no mesmo pacote",
      description:
        "A IA organiza suas respostas em três versões: emocionante, leve e clássica. Você escolhe a que combina mais com você e ajusta as palavras antes de ler no altar.",
      bullets: [
        "Memórias, sentimentos e promessas",
        "Três opções para comparar",
        "Pausas indicadas no texto"
      ]
    },
    {
      step: "03",
      icon: FileText,
      title: "Prepare-se para ler no altar",
      subtitle: "Texto + PDF + guia de leitura",
      description:
        "Com a versão escolhida, leia em voz alta e dê seu toque final. O pacote inclui PDF para imprimir e orientações para você ensaiar com mais tranquilidade.",
      bullets: [
        "PDF pronto para imprimir",
        "Letras grandes no modo celular",
        "Guia para ensaiar e fazer pausas"
      ]
    }
  ];

  return (
    <section id="como-funciona" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Subtle border top & bottom */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#F0EAE1] text-xs font-semibold text-[#B38E46] tracking-wide uppercase">
            Da primeira lembrança aos seus votos
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1917] tracking-tight">
            Você conta a história. <span className="italic text-[#B38E46]">Nós ajudamos com as palavras.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#78716C] font-light leading-relaxed">
            Comece pelas 6 perguntas. O pacote com as 3 versões e o PDF custa R$ 29,90, em pagamento único.
          </p>
        </div>

        {/* 3 Steps Timeline / Grid */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 relative">
          
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-28 left-[18%] right-[18%] h-0.5 bg-gradient-to-r from-[#F0EAE1] via-[#C5A059]/40 to-[#F0EAE1] -z-0" />

          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative z-10 bg-[#FAF8F5] rounded-3xl p-7 sm:p-8 border border-[#F0EAE1] hover:border-[#C5A059]/50 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Step indicator with gold badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#F0EAE1] shadow-sm flex items-center justify-center text-[#B38E46] group-hover:bg-[#B38E46] group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-serif-luxury text-3xl font-bold text-[#E8D5CE] group-hover:text-[#C5A059] transition-colors">
                      {item.step}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917] leading-tight mb-1">
                    {item.title}
                  </h3>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#B38E46] block mb-3">
                    {item.subtitle}
                  </span>

                  {/* Description */}
                  <p className="text-sm text-[#78716C] leading-relaxed font-light mb-6">
                    {item.description}
                  </p>

                  {/* Micro checklist */}
                  <div className="space-y-2 pt-4 border-t border-[#F0EAE1]">
                    {item.bullets.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#1C1917]">
                        <Check className="w-3.5 h-3.5 text-[#B38E46] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Step link */}
                <div className="mt-8 pt-4">
                  <div className="w-full h-1 rounded-full bg-[#F0EAE1] overflow-hidden">
                    <div
                      className="h-full bg-[#B38E46] transition-all duration-500"
                      style={{ width: `${(index + 1) * 33.3}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* Action Button below Steps */}
        <div className="mt-14 text-center">
          <button
            onClick={onOpenQuiz}
            className="inline-flex items-center gap-3 bg-[#1C1917] hover:bg-[#292524] text-white px-8 py-4 rounded-full text-base font-medium shadow-luxury hover:shadow-luxury-hover border border-[#C5A059]/30 transition-all cursor-pointer"
          >
            <span>Quero criar meus votos</span>
            <ArrowRight className="w-4 h-4 text-[#C5A059]" />
          </button>
        </div>

      </div>
    </section>
  );
}
