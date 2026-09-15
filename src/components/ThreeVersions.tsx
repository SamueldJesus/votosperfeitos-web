"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, Laugh, Compass, Sparkles, Copy, Check, Clock, Volume2, ArrowRight } from "lucide-react";

interface ThreeVersionsProps {
  onOpenQuiz: () => void;
}

export function ThreeVersions({ onOpenQuiz }: ThreeVersionsProps) {
  const [activeVersion, setActiveVersion] = useState<0 | 1 | 2>(0);
  const [copied, setCopied] = useState(false);

  const versions = [
    {
      id: "lagrimas",
      title: "Lágrimas e Coração",
      badge: "Mais Emocionante",
      icon: Heart,
      accent: "#B38E46",
      tagline: "Para dar espaço à gratidão e ao que vocês significam um para o outro.",
      duration: "2 min 30 seg",
      words: "310 palavras",
      focus: "Gratidão profunda, superação de desafios e a solenidade do pacto eterno.",
      excerptHeader: "Trecho ilustrativo:",
      text: `“Mariana, quando olho para trás e vejo tudo o que construímos desde aquele primeiro café na chuva, tenho a certeza absoluta de que Deus cuida de nós nos mínimos detalhes.

[pausa para respirar e olhar nos olhos dela]

Você foi meu abrigo nos dias mais tempestuosos da minha vida. Quando tudo parecia incerto no mundo lá fora, a sua mão na minha era o único ponto firme de paz que eu precisava.

[pausa suave]

Eu não prometo um caminho sem pedras, mas prometo que nunca vou soltar sua mão quando o chão tremer. Prometo ser seu primeiro abraço de alívio e seu companheiro leal em todas as manhãs. Hoje, diante da nossa família, não estou apenas te dando uma aliança: estou te entregando tudo o que sou, para sempre.”`
    },
    {
      id: "sorrisos",
      title: "Sorrisos e Cumplicidade",
      badge: "Mais Equilibrada",
      icon: Laugh,
      accent: "#8C5D53",
      tagline: "Para misturar carinho, manias e aquele humor que é só de vocês.",
      duration: "2 min 10 seg",
      words: "280 palavras",
      focus: "Manias do casal, leveza da rotina a dois e declaração espontânea.",
      excerptHeader: "Trecho ilustrativo:",
      text: `“Mariana, quem nos vê hoje vestidos com toda essa pompa mal imagina que nosso amor foi batizado com um pote de sorvete derretido no banco de trás do carro e maratonas de séries até às três da manhã.

[pausa para o sorriso dos convidados]

Eu me apaixonei não só pela sua elegância, mas pela forma barulhenta como você ri quando acha graça de verdade, e pelo jeito desajeitado que você divide o cobertor.

[olhar carinhoso]

Prometo fingir que não vi você comendo o último pedaço de chocolate na geladeira. Mas, acima de qualquer brincadeira, prometo fazer da nossa casa o lugar mais alegre do mundo para voltarmos no fim do dia. Eu te amo por quem você é nos dias de festa, mas te amo ainda mais em todos os dias comuns.”`
    },
    {
      id: "classica",
      title: "Clássica e Atemporal",
      badge: "Mais Concisa & Solene",
      icon: Compass,
      accent: "#1C1917",
      tagline: "Para dizer o essencial com carinho, em um texto mais breve.",
      duration: "1 min 45 seg",
      words: "220 palavras",
      focus: "Elegância linguística, brevidade cirúrgica e beleza poética solene.",
      excerptHeader: "Trecho ilustrativo:",
      text: `“Mariana, amar você tem sido a decisão mais natural e serena de toda a minha existência.

[pausa solene]

Dizem que o casamento é o encontro de dois destinos, mas com você sinto que apenas reencontrei o caminho para casa. Sua generosidade me ensina a ser um homem melhor a cada dia, e sua presença dá sentido a cada plano que tracei para o futuro.

[pausa]

Receba hoje o meu amor inteiro, sem reservas e sem pressa. Prometo honrar nossa história, zelar pela sua felicidade e construir ao seu lado uma vida da qual tenhamos orgulho eterno quando olharmos para trás.”`
    }
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const current = versions[activeVersion];

  return (
    <section id="versoes" className="py-20 sm:py-28 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#F0EAE1] text-xs font-semibold text-[#B38E46] tracking-wide uppercase">
            Escolha o seu tom
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1917] tracking-tight">
            Escolha o tom da sua história. <span className="italic text-[#B38E46]">Receba três variações dele.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#78716C] font-light leading-relaxed">
            Mais emoção, um toque de humor ou poucas palavras? Veja os exemplos, escolha um tom e receba três variações inéditas dentro dele.
          </p>
        </div>

        {/* Interactive Tabs */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-full border border-[#F0EAE1] max-w-3xl mx-auto shadow-sm">
          {versions.map((v, idx) => {
            const Icon = v.icon;
            const isSelected = activeVersion === idx;
            return (
              <button
                key={v.id}
                onClick={() => setActiveVersion(idx as 0 | 1 | 2)}
                className={`flex-1 min-w-[200px] sm:min-w-0 flex items-center justify-center gap-2 py-3 px-5 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[#1C1917] text-white shadow-md shadow-black/10"
                    : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-[#C5A059]" : "text-[#78716C]"}`} />
                <span>{v.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Version Display Card & Mockup */}
        <div className="mt-10 grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Paper Sheet Vow Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-9 border border-[#F0EAE1] shadow-luxury relative overflow-hidden flex flex-col justify-between">
            
            {/* Top Bar inside Card */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#B38E46] animate-pulse" />
                  <div>
                    <h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
                      Versão {activeVersion + 1}: {current.title}
                    </h3>
                    <p className="text-xs text-[#78716C]">{current.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#78716C]">
                  <span className="flex items-center gap-1 bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#F0EAE1]">
                    <Clock className="w-3 h-3 text-[#B38E46]" />
                    {current.duration}
                  </span>
                  <span className="hidden sm:inline-block bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#F0EAE1]">
                    {current.words}
                  </span>
                </div>
              </div>

              {/* Vow Speech Body */}
              <div className="mt-6 p-6 bg-[#FAF8F5]/70 rounded-2xl border border-[#F0EAE1]/80 relative">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#B38E46] mb-3">
                  <span>{current.excerptHeader}</span>
                  <span className="text-[10px] text-[#78716C] lowercase bg-white px-2 py-0.5 rounded border border-[#F0EAE1]">
                    exemplo de leitura
                  </span>
                </div>

                <div className="font-serif-luxury text-base sm:text-lg text-[#1C1917] leading-relaxed whitespace-pre-line">
                  {current.text.split("\n\n").map((paragraph, i) => {
                    if (paragraph.startsWith("[")) {
                      return (
                        <p key={i} className="my-2.5 text-xs font-sans not-italic font-semibold text-[#B38E46] bg-[#F7F1E5] inline-block px-2.5 py-1 rounded-md border border-[#C5A059]/30">
                          {paragraph}
                        </p>
                      );
                    }
                    return (
                      <p key={i} className="my-2 text-[#292524] italic">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Card */}
            <div className="mt-6 pt-5 border-t border-[#F0EAE1] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#78716C]">
                <Volume2 className="w-4 h-4 text-[#B38E46]" />
                <span>Pausas para respirar e olhar para seu amor</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopy(current.text)}
                  className="px-3.5 py-1.5 rounded-full border border-[#F0EAE1] text-xs font-medium text-[#1C1917] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#78716C]" />
                      <span>Copiar exemplo</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onOpenQuiz}
                  className="bg-[#1C1917] hover:bg-[#292524] text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Criar meus votos</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Stationery Booklet Mockup (Nano Banana generated) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="relative rounded-3xl overflow-hidden border border-[#F0EAE1] shadow-luxury aspect-[4/3] group bg-white">
              <Image
                src="/images/deliverable-booklets.jpg"
                alt="Dois livretos de votos de casamento em papel artesanal algodão com caligrafia dourada e flores peônias"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/70 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="inline-flex items-center gap-1.5 bg-[#FAF8F5]/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-[#1C1917] mb-1.5">
                  <Sparkles className="w-3 h-3 text-[#B38E46]" />
                  PDF para imprimir
                </div>
                <h4 className="font-serif-luxury text-xl font-medium text-white leading-tight">
                  Seus votos também viram lembrança
                </h4>
                <p className="text-xs text-white/80 font-light mt-0.5">
                  Imprima o arquivo no papel que preferir. O pacote é digital; a impressão não está incluída.
                </p>
              </div>
            </div>

            {/* Deliverable benefits callout */}
            <div className="bg-white rounded-2xl p-5 border border-[#F0EAE1] shadow-sm space-y-3">
              <h5 className="text-xs uppercase tracking-wider font-semibold text-[#B38E46]">
                O que você recebe no pacote:
              </h5>
              <ul className="text-xs sm:text-sm text-[#78716C] space-y-2">
                <li className="flex items-center gap-2 text-[#1C1917]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B38E46]" />
                  <strong>3 versões de votos</strong> para escolher e dar seu toque final.
                </li>
                <li className="flex items-center gap-2 text-[#1C1917]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B38E46]" />
                  <strong>PDF para imprimir</strong> e levar com você para o altar.
                </li>
                <li className="flex items-center gap-2 text-[#1C1917]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B38E46]" />
                  <strong>Leitura no celular</strong> com letras grandes e pausas sinalizadas.
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
