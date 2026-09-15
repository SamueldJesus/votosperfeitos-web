"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PainSection } from "@/components/PainSection";
import { HowItWorks } from "@/components/HowItWorks";
import { ThreeVersions } from "@/components/ThreeVersions";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Testimonials } from "@/components/Testimonials";
import { PricingSection } from "@/components/PricingSection";
import { Guarantee } from "@/components/Guarantee";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { QuizModal } from "@/components/QuizModal";
import { FloatingMobileCta } from "@/components/FloatingMobileCta";

export default function LandingPage() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const openQuiz = () => {
    setIsQuizOpen(true);
  };

  const closeQuiz = () => {
    setIsQuizOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917] selection:bg-[#F7F1E5] selection:text-[#9C7836]">
      {/* 1. Floating Header */}
      <Header onOpenQuiz={openQuiz} />

      {/* Main Sections */}
      <main className="flex-grow">
        {/* 2. Hero Section */}
        <Hero onOpenQuiz={openQuiz} />

        {/* 3. O Confronto da Dor (A Folha em Branco) */}
        <PainSection />

        {/* 4. Como Funciona (3 Passos Simples) */}
        <HowItWorks onOpenQuiz={openQuiz} />

        {/* 5. As 3 Versões Entregues (Solução Completa) */}
        <ThreeVersions onOpenQuiz={openQuiz} />

        {/* 6. Simulador Antes & Depois (O Poder da Escrita) */}
        <BeforeAfter onOpenQuiz={openQuiz} />

        {/* 7. Depoimentos & Prova Social */}
        <Testimonials />

        {/* 8. Oferta Irresistível & Tabela de Preço */}
        <PricingSection onOpenQuiz={openQuiz} />

        {/* 9. Garantia Total de Emoção */}
        <Guarantee />

        {/* 10. FAQ (Perguntas Frequentes) */}
        <FaqSection />
      </main>

      {/* 11. Rodapé (Footer) */}
      <Footer />

      {/* High-Converting Interactive Modal Simulator */}
      <QuizModal isOpen={isQuizOpen} onClose={closeQuiz} />

      {/* Mobile Sticky Floating CTA */}
      <FloatingMobileCta onOpenQuiz={openQuiz} />
    </div>
  );
}
