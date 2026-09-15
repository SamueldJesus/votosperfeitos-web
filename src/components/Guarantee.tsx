"use client";

import React from "react";
import { ShieldCheck, HeartHandshake, CheckCircle } from "lucide-react";

export function Guarantee() {
  return (
    <section className="py-16 bg-[#FAF8F5] relative overflow-hidden border-t border-[#F0EAE1]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#C5A059]/40 shadow-luxury flex flex-col sm:flex-row items-center gap-6 sm:gap-8 relative overflow-hidden">
          
          {/* Gold Wax Seal / Shield Badge */}
          <div className="shrink-0 relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#F7F1E5] via-[#FAF8F5] to-[#E8D5CE]/50 border-2 border-[#C5A059] flex flex-col items-center justify-center text-[#B38E46] shadow-md relative">
              <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C7836] mt-0.5">
                7 Dias
              </span>
            </div>
          </div>

          {/* Guarantee Content */}
          <div className="space-y-2.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#F0EAE1] text-xs font-semibold text-[#B38E46]">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Sua história precisa estar nos votos</span>
            </div>

            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
              Leia com calma. Você tem 7 dias de garantia.
            </h3>

            <p className="text-sm sm:text-base text-[#78716C] leading-relaxed font-light">
              Se os textos não representarem a história de vocês, peça o reembolso em até 7 dias após a compra. Você recebe <strong>100% do valor de volta via Pix</strong>. O importante é se reconhecer nas palavras que vai dizer.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#1C1917] font-medium">
              <span className="flex items-center gap-1 text-[#B38E46]">
                <CheckCircle className="w-3.5 h-3.5" /> Reembolso integral
              </span>
              <span className="flex items-center gap-1 text-[#B38E46]">
                <CheckCircle className="w-3.5 h-3.5" /> 7 dias para decidir
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
