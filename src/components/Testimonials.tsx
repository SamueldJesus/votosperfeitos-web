"use client";

import React from "react";
import Image from "next/image";
import { Star, CheckCircle2, MessageCircle, ShieldCheck, MailCheck, Lock } from "lucide-react";

export function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 sm:py-28 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#F0EAE1] text-xs font-semibold text-[#B38E46] tracking-wide uppercase">
            Relatos e entregas anonimizadas
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1917] tracking-tight">
            Parece real porque começa com detalhes <span className="italic text-[#B38E46]">que só vocês viveram</span>
          </h2>

          <p className="text-base sm:text-lg text-[#78716C] font-light leading-relaxed">
            Abaixo estão exemplos de relatos e entregas sem dados pessoais. A prova mais forte aqui não é um número inflado: é ver como memórias simples viram um texto com cara de vocês.
          </p>
        </div>

        {/* Testimonials Grid + Couple Photo */}
        <div className="mt-14 grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Realistic anonymized delivery proof */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-[#F0EAE1] shadow-luxury bg-white aspect-square lg:aspect-auto">
            <Image
              src="/images/real-delivery-proof.png"
              alt="Entrega digital anonimizada com três versões de votos impressas e conversa sem dados pessoais"
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
                <span className="text-xs font-semibold text-white ml-2">Exemplo de entrega digital</span>
              </div>

              <p className="font-serif-luxury text-xl sm:text-2xl text-white font-medium leading-snug">
                &ldquo;3 versões para escolher, revisar e levar para o altar sem expor sua história.&rdquo;
              </p>
              
              <p className="text-xs text-white/80">
                PDFs e conversa ilustrativos, com dados pessoais ocultos
              </p>
            </div>
          </div>

          {/* Testimonial Cards Right Column */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            
            {/* Card 1: Noivo Rafael */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F0EAE1] shadow-luxury hover:shadow-luxury-hover transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C5A059]/40 bg-[#F7F1E5] text-sm font-bold text-[#8F6D32]">
                    R
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-[#1C1917] flex items-center gap-1.5">
                      Rafael S.
                      <CheckCircle2 className="w-4 h-4 text-[#B38E46]" />
                    </h4>
                    <span className="text-xs text-[#78716C]">Relato anonimizado • pedido entregue por e-mail</span>
                  </div>
                </div>

                <div className="flex text-[#C5A059]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059]" />
                  ))}
                </div>
              </div>

              <p className="font-serif-luxury text-base sm:text-lg text-[#1C1917] leading-relaxed italic">
                &ldquo;Eu sabia exatamente o que sentia, mas não conseguia começar. Usei uma das versões como base, troquei duas frases pelo meu jeito de falar e consegui ler sem parecer texto pronto.&rdquo;
              </p>

              <div className="mt-4 pt-3 border-t border-[#F0EAE1] flex items-center justify-between text-[11px] text-[#78716C]">
                <span>Usou a versão: <strong>Lágrimas & Coração</strong></span>
                <span className="text-[#B38E46] font-medium">Dados pessoais ocultos</span>
              </div>
            </div>

            {/* Card 2: Noiva Camila */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F0EAE1] shadow-luxury hover:shadow-luxury-hover transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C5A059]/40 bg-[#FAF4F2] text-sm font-bold text-[#8C5D53]">
                    C
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-[#1C1917] flex items-center gap-1.5">
                      Camila M.
                      <CheckCircle2 className="w-4 h-4 text-[#B38E46]" />
                    </h4>
                    <span className="text-xs text-[#78716C]">Relato anonimizado • revisão feita pela noiva</span>
                  </div>
                </div>

                <div className="flex text-[#C5A059]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C5A059]" />
                  ))}
                </div>
              </div>

              <p className="font-serif-luxury text-base sm:text-lg text-[#1C1917] leading-relaxed italic">
                &ldquo;Eu queria emocionar, mas sem ficar dramática demais. A versão com humor trouxe nossas manias e deixou o texto leve. No fim, eu só ajustei o apelido e uma promessa.&rdquo;
              </p>

              <div className="mt-4 pt-3 border-t border-[#F0EAE1] flex items-center justify-between text-[11px] text-[#78716C]">
                <span>Usou a versão: <strong>Sorrisos & Cumplicidade</strong></span>
                <span className="text-[#B38E46] font-medium">Trecho adaptado</span>
              </div>
            </div>

            {/* Card 3: Realistic anonymized support note */}
            <div className="bg-[#EFEAE2] rounded-3xl p-5 sm:p-6 border border-[#E0D8C8] shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[#D8CEBA] mb-3 text-xs text-[#54656F]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-[#111B21]">Feedback recebido no suporte</span>
                </div>
                <span>Dados ocultos</span>
              </div>

              {/* Chat Bubble */}
              <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-lg space-y-2 border border-[#E5DFD5]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#075E54]">Cliente anon.</span>
                  <span className="text-[10px] text-gray-400">após a entrega</span>
                </div>
                <p className="text-xs sm:text-sm text-[#111B21] leading-relaxed">
                  &ldquo;Usei a terceira versão como base. O que mais ajudou foi ter as pausas no texto e três jeitos diferentes de contar a mesma história. Ficou com a nossa cara depois dos ajustes.&rdquo;
                </p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400">
                  <span>texto editado para privacidade</span>
                  <span className="text-[#53BDEB]">✓✓</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: MailCheck, title: "Entrega por e-mail", text: "Os PDFs chegam no endereço informado após o Pix aprovado." },
                { icon: Lock, title: "História privada", text: "Os exemplos públicos usam dados ocultos ou histórias ilustrativas." },
                { icon: ShieldCheck, title: "Garantia de 7 dias", text: "Se não representar vocês, peça reembolso integral." }
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-[#F0EAE1] bg-white p-4 shadow-sm">
                  <item.icon className="mb-2 h-4 w-4 text-[#B38E46]" />
                  <h4 className="text-xs font-semibold text-[#1C1917]">{item.title}</h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#78716C]">{item.text}</p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
