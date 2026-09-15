"use client";

import React from "react";
import Image from "next/image";
import { AlertCircle, FileX, Clock, Sparkles } from "lucide-react";

export function PainSection() {
  const painPoints = [
    {
      id: "branco",
      icon: FileX,
      tag: "Por onde começar",
      title: "Você sente, mas não sabe escrever",
      description:
        "Você abre o bloco de notas, escreve uma frase e apaga. Tem tanta coisa para dizer que fica difícil escolher o começo.",
      quote: "“Como coloco tudo o que sinto em palavras?”"
    },
    {
      id: "generico",
      icon: AlertCircle,
      tag: "O jeito de vocês",
      title: "Você quer se reconhecer no texto",
      description:
        "Os textos que você encontra são bonitos, mas não contam a história de vocês. Faltam aquela lembrança, a brincadeira e o jeito de falar que seu amor conhece.",
      quote: "“Quero que meu amor ouça e pense: isso é a nossa cara.”"
    },
    {
      id: "tempo",
      icon: Clock,
      tag: "Reta final",
      title: "Você precisa sair da página em branco",
      description:
        "Entre os preparativos e a rotina, os votos ficaram para depois. Um caminho guiado ajuda você a começar, mesmo sem um rascunho.",
      quote: "“O casamento está chegando. Preciso começar.”"
    }
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] relative overflow-hidden border-t border-[#F0EAE1]">
      {/* Background subtle paper pattern */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8D5CE]/30 border border-[#E8D5CE] text-xs font-semibold text-[#8C5D53] tracking-wide uppercase">
            Talvez você esteja aqui
          </div>
          
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1917] tracking-tight">
            O amor você já sabe. <span className="italic text-[#9C7836]">O difícil é colocar no papel.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#78716C] font-light leading-relaxed">
            Não é falta de sentimento. Às vezes, você só precisa de ajuda para organizar o que quer dizer.
          </p>
        </div>

        {/* Visual Pain Illustration + Grid */}
        <div className="mt-14 grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Flatlay Image Card */}
          <div className="lg:col-span-4 relative rounded-3xl overflow-hidden border border-[#F0EAE1] shadow-luxury group min-h-[320px] lg:min-h-full">
            <Image
              src="/images/pain-blank-notebook.jpg"
              alt="Caderno de capa dura em branco com caneta tinteiro e xícara de café, representando o bloqueio do escritor"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/85 via-[#1C1917]/30 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="text-[11px] font-medium tracking-widest uppercase text-[#E8D5CE]">
                Comece com uma lembrança
              </span>
              <p className="font-serif-luxury text-xl sm:text-2xl leading-snug text-white">
                Um primeiro encontro. Uma mania. Um gesto de cuidado. Seus votos começam nas coisas que vocês viveram.
              </p>
            </div>
          </div>

          {/* 3 Agitation Cards Grid */}
          <div className="lg:col-span-8 grid sm:grid-cols-3 gap-5">
            {painPoints.map((pain) => {
              const Icon = pain.icon;
              return (
                <div
                  key={pain.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F0EAE1] shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#F0EAE1] flex items-center justify-center text-[#B38E46] group-hover:border-[#C5A059] group-hover:bg-[#F7F1E5] transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C5D53] bg-[#E8D5CE]/30 px-2 py-0.5 rounded-full">
                        {pain.tag}
                      </span>
                    </div>

                    <h3 className="font-serif-luxury text-xl sm:text-2xl font-semibold text-[#1C1917] leading-tight">
                      {pain.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed font-light">
                      {pain.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F0EAE1]/80">
                    <p className="text-xs italic text-[#B38E46] font-serif-luxury">
                      {pain.quote}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Emotional Transition Quote Banner */}
        <div className="mt-12 bg-white rounded-2xl sm:rounded-full border border-[#C5A059]/30 p-5 sm:p-6 sm:px-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F7F1E5] flex items-center justify-center shrink-0 text-[#B38E46]">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm sm:text-base text-[#1C1917] font-medium leading-normal">
              Você <span className="underline decoration-[#C5A059] decoration-2 underline-offset-4">não precisa chegar com um texto pronto</span>. Conte do seu jeito. Uma lembrança de cada vez.
            </p>
          </div>

          <span className="text-xs sm:text-sm font-semibold text-[#B38E46] shrink-0 hover:text-[#9C7836] transition-colors">
            6 perguntas para começar
          </span>
        </div>

      </div>
    </section>
  );
}
