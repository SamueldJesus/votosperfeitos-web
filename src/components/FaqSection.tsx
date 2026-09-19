"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
        "question": "Vai ficar com a minha cara ou parecer um texto de IA?",
        "answer": "A IA ajuda a organizar o texto; os detalhes vêm de você. Um apelido, uma lembrança e uma promessa pessoal fazem diferença. Depois, leia em voz alta e troque qualquer palavra que você não usaria. As três versões são um ponto de partida para chegar aos seus votos."
    },
    {
        "question": "Preciso saber escrever ou já ter um rascunho?",
        "answer": "Não. Você pode responder com frases simples, do jeito que falaria. As perguntas trazem exemplos para ajudar a lembrar. Não precisa ter uma história de cinema: os pequenos gestos do dia a dia também rendem bons votos."
    },
    {
        "question": "Recebo as três versões ou preciso escolher uma antes?",
        "answer": "Você escolhe entre Lágrimas e Coração, Sorrisos e Cumplicidade ou Clássica e Atemporal. O pacote de R$ 1,00 inclui 3 versões inéditas dentro do tom que você escolher."
    },
    {
        "question": "Posso mudar o texto antes do casamento?",
        "answer": "Sim. A proposta é que você dê seu toque final. Troque palavras, acrescente lembranças ou combine trechos das versões. Leia em voz alta antes do casamento para sentir o que soa natural para você."
    },
    {
        "question": "Estou na reta final do casamento. Por onde começo?",
        "answer": "Comece pelas 6 perguntas para organizar suas lembranças. Separe também um momento para revisar os votos, ajustar o texto e ensaiar em voz alta. Assim, você chega à leitura conhecendo as palavras que escolheu."
    },
    {
        "question": "Funciona para noivos, noivas e casais do mesmo gênero?",
        "answer": "Sim. No início do formulário, você indica quem está falando e para quem são os votos. Depois, conta as memórias e as promessas que quer incluir na história de vocês."
    },
    {
        "question": "O pacote é digital? Vou receber um livreto em casa?",
        "answer": "O pacote é digital e inclui um PDF para imprimir. Não enviamos um livreto físico. Você escolhe o papel e pode imprimir em casa ou em uma gráfica; esse custo não está incluído."
    },
    {
        "question": "É uma assinatura? E se eu não gostar dos votos?",
        "answer": "É um pagamento único de R$ 1,00 via Pix, sem mensalidade. Se os textos não representarem a história de vocês, você pode pedir o reembolso integral em até 7 dias após a compra."
    }
];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#F0EAE1] text-xs font-semibold text-[#B38E46] tracking-wide uppercase">
            Perguntas Frequentes
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C1917] tracking-tight">
            Tudo o que você precisa <span className="italic text-[#B38E46]">saber antes de começar</span>
          </h2>

          <p className="text-base sm:text-lg text-[#78716C] font-light leading-relaxed">
            Sobre o texto, o pacote e os próximos passos: tire suas dúvidas antes de começar.
          </p>
        </div>

        {/* Accordion List */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#FAF8F5] rounded-2xl sm:rounded-3xl border border-[#F0EAE1] overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F5EFEB]/40 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif-luxury text-lg sm:text-xl font-semibold text-[#1C1917] leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border border-[#F0EAE1] bg-white flex items-center justify-center shrink-0 text-[#B38E46] transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[#F7F1E5]" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-[#78716C] leading-relaxed font-light border-t border-[#F0EAE1]/70 animate-in fade-in duration-300">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
