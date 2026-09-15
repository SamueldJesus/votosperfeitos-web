"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { X, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, QrCode, ShieldCheck, Heart, Lock } from "lucide-react";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuizModal({ isOpen, onClose }: QuizModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    who: "noivo-noiva",
    names: { speaker: "", partner: "" },
    howMet: "",
    insideJoke: "",
    certainMoment: "",
    primaryTone: "lagrimas",
    deepPromise: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isOpen) return null;

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      triggerGeneration();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const triggerGeneration = () => {
    setIsGenerating(true);
    setGenerationPhase("Preparando o próximo passo...");

    setTimeout(() => {
      setGenerationPhase("Reunindo as informações do seu pacote...");
    }, 1200);

    setTimeout(() => {
      setGenerationPhase("Quase lá. Confira o que está incluído.");
    }, 2400);

    setTimeout(() => {
      setIsGenerating(false);
      setIsCompleted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C5A059", "#B38E46", "#E8D5CE", "#FAF8F5"]
      });
    }, 3600);
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136votosperfeitos-pix-key-2990520400005303986540529.905802BR5915VOTOSPERFEITOS6009SAO PAULO62070503***6304E8A2");
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl sm:rounded-[32px] border border-[#F0EAE1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#F0EAE1] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B38E46]" />
            <span className="text-xs uppercase tracking-widest font-bold text-[#1C1917]">
              Sua história, seus votos
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (if not completed) */}
        {!isCompleted && !isGenerating && (
          <div className="w-full bg-[#F0EAE1] h-1.5">
            <div
              className="bg-gradient-to-r from-[#B38E46] to-[#C5A059] h-1.5 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          
          {/* STATE 1: GENERATING SPINNER */}
          {isGenerating && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-[#F0EAE1] border-t-[#B38E46] animate-spin" />
                <div className="absolute inset-2 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#B38E46]">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
                  Vamos dar forma à sua história
                </h4>
                <p className="text-xs sm:text-sm text-[#78716C] max-w-sm mx-auto font-light">
                  {generationPhase}
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: COMPLETED & READY FOR INSTANT PIX CHECKOUT */}
          {isCompleted && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-[#F7F1E5] border border-[#C5A059] mx-auto flex items-center justify-center text-[#B38E46]">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-serif-luxury text-3xl font-bold text-[#1C1917]">
                  Seu próximo passo: receber seus votos
                </h3>
                <p className="text-sm text-[#78716C] max-w-md mx-auto">
                  O pacote inclui <strong>3 versões a partir das suas respostas</strong> e <strong>PDF para imprimir</strong>. Confira os detalhes antes de pagar.
                </p>
              </div>

              {/* Offer recap card */}
              <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#F0EAE1] text-left space-y-3">
                <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#B38E46]">
                    Seu pacote completo
                  </span>
                  <span className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
                    R$ 29,90
                  </span>
                </div>

                <ul className="text-xs text-[#1C1917] space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-[#B38E46]">✓</span> 3 estilos para escolher o que combina com você
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#B38E46]">✓</span> PDF formatado para imprimir e levar ao altar
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#B38E46]">✓</span> Mini-guia para ensaiar e ler com mais tranquilidade
                  </li>
                </ul>
              </div>

              {/* Pix Payment Action */}
              <div className="space-y-3">
                <button
                  onClick={copyPixKey}
                  className="w-full bg-[#1C1917] hover:bg-[#292524] text-white py-4 px-6 rounded-full font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                >
                  <QrCode className="w-5 h-5 text-[#C5A059]" />
                  <span>{copiedPix ? "Código Pix copiado" : "Copiar Pix de R$ 29,90"}</span>
                </button>

                <p className="text-[11px] text-[#78716C] flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#B38E46]" />
                  Pagamento único • Garantia de 7 dias
                </p>
              </div>
            </div>
          )}

          {/* STATE 3: INTERACTIVE 6 QUESTIONS STEP-BY-STEP */}
          {!isCompleted && !isGenerating && (
            <div className="space-y-6">
              
              {/* Step indicator text */}
              <div className="flex items-center justify-between text-xs text-[#78716C]">
                <span className="font-semibold text-[#B38E46]">
                  Pergunta {currentStep} de {totalSteps}
                </span>
                <span>Responda do seu jeito</span>
              </div>

              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
                    Quem vai ler os votos e para quem?
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "noivo-noiva", label: "Noivo falando para Noiva" },
                      { id: "noiva-noivo", label: "Noiva falando para Noivo" },
                      { id: "noivo-noivo", label: "Noivo falando para Noivo" },
                      { id: "noiva-noiva", label: "Noiva falando para Noiva" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, who: opt.id })}
                        className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${
                          formData.who === opt.id
                            ? "border-[#C5A059] bg-[#FAF8F5] text-[#1C1917] font-semibold shadow-sm"
                            : "border-[#F0EAE1] hover:border-gray-300 text-[#78716C]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        Seu nome ou apelido
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Rafael"
                        value={formData.names.speaker}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            names: { ...formData.names, speaker: e.target.value }
                          })
                        }
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#F0EAE1] focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        Nome de quem você ama
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Mariana"
                        value={formData.names.partner}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            names: { ...formData.names, partner: e.target.value }
                          })
                        }
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#F0EAE1] focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
                    Como começou a história de vocês?
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Onde vocês se conheceram? O que você lembra daquele dia? Frases simples já ajudam.
                  </p>
                  <textarea
                    rows={4}
                    placeholder="Ex: Foi num sábado chuvoso em 2021 numa padaria da esquina. Ele derramou café na camisa e eu achei fofo o jeito desajeitado dele..."
                    value={formData.howMet}
                    onChange={(e) => setFormData({ ...formData, howMet: e.target.value })}
                    className="w-full p-4 text-sm rounded-2xl border border-[#F0EAE1] focus:outline-none focus:border-[#C5A059] leading-relaxed resize-none"
                  />
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
                    Que detalhe do dia a dia faz você sorrir?
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Pode ser uma mania, uma piada interna ou um pequeno gesto de carinho. Escolha algo que gostaria de contar no altar.
                  </p>
                  <textarea
                    rows={4}
                    placeholder="Ex: Ela rouba as batatas fritas do meu prato fingindo que não quer nada, e maratona séries dormindo no terceiro episódio..."
                    value={formData.insideJoke}
                    onChange={(e) => setFormData({ ...formData, insideJoke: e.target.value })}
                    className="w-full p-4 text-sm rounded-2xl border border-[#F0EAE1] focus:outline-none focus:border-[#C5A059] leading-relaxed resize-none"
                  />
                </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
                    Quando você sentiu que queria uma vida a dois?
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Pense em um gesto de apoio, uma conversa ou um dia comum. Se não houve um momento exato, conte o que faz você escolher essa pessoa.
                  </p>
                  <textarea
                    rows={4}
                    placeholder="Ex: Quando fiquei doente e ele cancelou os planos para cuidar de mim e preparar sopa, ou quando olhei para ele numa terça-feira comum e senti paz..."
                    value={formData.certainMoment}
                    onChange={(e) => setFormData({ ...formData, certainMoment: e.target.value })}
                    className="w-full p-4 text-sm rounded-2xl border border-[#F0EAE1] focus:outline-none focus:border-[#C5A059] leading-relaxed resize-none"
                  />
                </div>
              )}

              {/* STEP 5 */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
                    Qual estilo combina mais com você?
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Essa é só a sua preferência. As três versões estão incluídas no pacote.
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { id: "lagrimas", title: "Lágrimas e Coração", desc: "Carinho, gratidão e o que vocês viveram" },
                      { id: "sorrisos", title: "Sorrisos e Cumplicidade", desc: "Romance, manias e um toque de humor" },
                      { id: "classica", title: "Clássica e Atemporal", desc: "Um texto mais breve, com foco nas promessas" }
                    ].map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setFormData({ ...formData, primaryTone: t.id })}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          formData.primaryTone === t.id
                            ? "border-[#C5A059] bg-[#FAF8F5]"
                            : "border-[#F0EAE1] hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-[#1C1917]">{t.title}</span>
                          <span className="text-xs text-[#B38E46]">Selecionar</span>
                        </div>
                        <p className="text-xs text-[#78716C] mt-0.5">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6 */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">
                    O que você quer prometer para a vida de vocês?
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    Pense no cuidado que quer ter todos os dias. Não precisa ser grandioso: precisa fazer sentido para você.
                  </p>
                  <textarea
                    rows={4}
                    placeholder="Ex: Prometo nunca soltar sua mão nos dias difíceis, ser seu primeiro abraço ao chegar em casa e te amar todos os dias com paciência e ternura..."
                    value={formData.deepPromise}
                    onChange={(e) => setFormData({ ...formData, deepPromise: e.target.value })}
                    className="w-full p-4 text-sm rounded-2xl border border-[#F0EAE1] focus:outline-none focus:border-[#C5A059] leading-relaxed resize-none"
                  />
                </div>
              )}

              {/* Navigation Buttons inside Modal */}
              <div className="pt-4 border-t border-[#F0EAE1] flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#1C1917] hover:bg-[#292524] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer transition-all"
                >
                  <span>{currentStep === totalSteps ? "Ver meu pacote de R$ 29,90" : "Continuar"}</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
