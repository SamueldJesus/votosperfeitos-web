"use client";

import React from "react";
import { MessageCircle, Heart, Shield, Lock, ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="bg-[#1C1917] text-[#FAF8F5] pt-16 pb-24 sm:pb-16 border-t border-[#292524] relative overflow-hidden">
      {/* Ambient gold glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#C5A059]/10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-[#C5A059]/50 flex items-center justify-center text-[#B38E46]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="12" r="5" stroke="#C5A059" />
                  <circle cx="15" cy="12" r="5" stroke="#B38E46" />
                </svg>
              </div>
              <span className="font-serif-luxury text-2xl font-bold tracking-tight text-white">
                Votos<span className="italic font-normal text-[#C5A059]">Perfeitos</span>
              </span>
            </div>

            <p className="font-serif-luxury text-lg text-white/80 italic max-w-md">
              &ldquo;O que vocês viveram merece virar palavras.&rdquo;
            </p>

            <p className="text-xs text-[#A8A29E] max-w-md leading-relaxed">
              Ajuda para transformar suas memórias em votos de casamento. Três estilos, espaço para seu toque pessoal e palavras para levar ao altar.
            </p>
          </div>

          {/* Institutional Links */}
          <div className="md:col-span-3 space-y-3 text-sm">
            <h5 className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
              Institucional
            </h5>
            <ul className="space-y-2 text-[#A8A29E] text-xs">
              <li>
                <a href="#como-funciona" className="hover:text-white transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#versoes" className="hover:text-white transition-colors">
                  Exemplos das 3 Versões
                </a>
              </li>
              <li>
                <a href="#preco" className="hover:text-white transition-colors">
                  O que está incluído
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Dúvidas Frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="md:col-span-3 space-y-3 text-sm">
            <h5 className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
              Suporte & Segurança
            </h5>
            <div className="space-y-2 text-xs text-[#A8A29E]">
              <a
                href="https://wa.me/5511999999999?text=Ol%C3%A1,%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20o%20VotosPerfeitos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl border border-white/10 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Suporte via WhatsApp</span>
              </a>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-[#A8A29E]">
                <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Pagamento único via Pix</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#A8A29E]">
                <Shield className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Garantia de 7 dias via Pix</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & Scroll to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <p>
            VotosPerfeitos © {new Date().getFullYear()} — Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#FAF8F5] transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-[#FAF8F5] transition-colors">
              Política de Privacidade
            </a>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              aria-label="Voltar ao topo da página"
            >
              <span>Voltar ao topo</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#C5A059]" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
