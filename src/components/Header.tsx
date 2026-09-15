"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";

interface HeaderProps {
  onOpenQuiz: () => void;
}

export function Header({ onOpenQuiz }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3 sm:pt-4 transition-all duration-300">
      <div
        className={`max-w-6xl mx-auto transition-all duration-300 rounded-full border border-[#F0EAE1] ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] py-2.5 px-5 sm:px-7"
            : "bg-white/80 backdrop-blur-md shadow-[0_4px_20px_rgb(0,0,0,0.03)] py-3 px-5 sm:px-8"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 group text-left cursor-pointer"
            aria-label="VotosPerfeitos Web - Página Inicial"
          >
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#C5A059]/40 flex items-center justify-center text-[#B38E46] transition-transform duration-300 group-hover:scale-105">
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
                <path d="M12 7l1 1.5" stroke="#C5A059" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]">
                Votos<span className="italic font-normal text-[#B38E46]">Perfeitos</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#78716C]">
            <button
              onClick={() => scrollToSection("como-funciona")}
              className="hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              Como Funciona
            </button>
            <button
              onClick={() => scrollToSection("versoes")}
              className="hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              Exemplos de Votos
            </button>
            <button
              onClick={() => scrollToSection("depoimentos")}
              className="hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              Avaliações
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              Dúvidas
            </button>
          </nav>

          {/* CTA Header Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenQuiz}
              className="relative group overflow-hidden bg-gradient-to-r from-[#1C1917] to-[#292524] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#C5A059]/20 hover:border-[#C5A059] border border-transparent cursor-pointer flex items-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-1.5 font-medium">
                Criar meus votos
                <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-[#1C1917] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-6xl mx-auto bg-white/95 backdrop-blur-lg border border-[#F0EAE1] rounded-3xl p-5 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-3">
          <nav className="flex flex-col gap-3.5 text-base font-medium text-[#1C1917]">
            <button
              onClick={() => scrollToSection("como-funciona")}
              className="text-left py-2 px-3 rounded-xl hover:bg-[#FAF8F5] transition-colors"
            >
              Como Funciona
            </button>
            <button
              onClick={() => scrollToSection("versoes")}
              className="text-left py-2 px-3 rounded-xl hover:bg-[#FAF8F5] transition-colors"
            >
              Exemplos de Votos
            </button>
            <button
              onClick={() => scrollToSection("depoimentos")}
              className="text-left py-2 px-3 rounded-xl hover:bg-[#FAF8F5] transition-colors"
            >
              Avaliações
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-left py-2 px-3 rounded-xl hover:bg-[#FAF8F5] transition-colors"
            >
              Dúvidas
            </button>
            <div className="pt-2 border-t border-[#F0EAE1]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuiz();
                }}
                className="w-full bg-[#1C1917] text-white py-3 rounded-full text-center text-sm font-medium shadow-md flex items-center justify-center gap-2"
              >
                <span>Criar meus votos</span>
                <ArrowRight className="w-4 h-4 text-[#C5A059]" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
