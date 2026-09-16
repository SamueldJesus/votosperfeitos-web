"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { createCheckoutTracking, trackInitiateCheckout } from "./MetaPixel";

interface QuizModalProps { isOpen: boolean; onClose: () => void; }
type Tone = "lagrimas" | "sorrisos" | "classica";
interface PixPayment { orderId: string; qrCode: string; qrCodeBase64: string; ticketUrl: string; }
const fieldClass = "w-full p-4 text-sm rounded-2xl border border-[#F0EAE1] focus:outline-none focus:border-[#C5A059] leading-relaxed";

export function QuizModal({ isOpen, onClose }: QuizModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", who: "noivo-noiva", speakerName: "", partnerName: "", howMet: "", insideJoke: "", certainMoment: "", tone: "lagrimas" as Tone, deepPromise: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixPayment, setPixPayment] = useState<PixPayment | null>(null);
  const [copied, setCopied] = useState(false);
  const totalSteps = 6;

  if (!isOpen) return null;

  const validateStep = () => {
    const missing = (currentStep === 1 && (!formData.email.trim() || !formData.speakerName.trim() || !formData.partnerName.trim())) || (currentStep === 2 && !formData.howMet.trim()) || (currentStep === 3 && !formData.insideJoke.trim()) || (currentStep === 4 && !formData.certainMoment.trim()) || (currentStep === 6 && !formData.deepPromise.trim());
    if (missing) { setError("Preencha este campo para continuar."); return false; }
    if (currentStep === 1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) { setError("Informe um e-mail válido para receber seus PDFs."); return false; }
    setError(""); return true;
  };

  const startCheckout = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true); setError("");
    try {
      const tracking = createCheckoutTracking();
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, ...(tracking ? { tracking } : {}) }) });
      const result = (await response.json()) as { payment?: PixPayment; error?: string };
      if (response.status !== 201 || !result.payment) throw new Error(result.error || "Não foi possível iniciar o pagamento. Tente novamente.");
      trackInitiateCheckout(tracking);
      setPixPayment(result.payment);
      setIsSubmitting(false);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Não foi possível iniciar o pagamento. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep === totalSteps) void startCheckout(); else setCurrentStep((step) => step + 1);
  };
  const setText = (name: "howMet" | "insideJoke" | "certainMoment" | "deepPromise") => (value: string) => setFormData({ ...formData, [name]: value });

  const copyPixCode = async () => {
    if (!pixPayment) return;
    try {
      await navigator.clipboard.writeText(pixPayment.qrCode);
      setCopied(true);
    } catch {
      setError("Não foi possível copiar automaticamente. Selecione o código e copie.");
    }
  };

  const closeModal = () => {
    setCurrentStep(1);
    setPixPayment(null);
    setCopied(false);
    setError("");
    onClose();
  };

  if (pixPayment) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-6">
      <div data-testid="pix-payment-modal" role="dialog" aria-modal="true" aria-labelledby="pix-payment-title" className="relative flex w-full max-w-xl flex-col overflow-y-auto overscroll-contain rounded-3xl border border-[#F0EAE1] bg-white shadow-2xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#F0EAE1] bg-[#FAF8F5] px-4 py-3 sm:px-6 sm:py-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1C1917]">Sua história, seus votos</span>
          <button onClick={closeModal} className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[#78716C] transition-colors hover:bg-white hover:text-[#1C1917] cursor-pointer" aria-label="Fechar modal"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 overflow-y-auto overscroll-contain p-4 text-center sm:space-y-5 sm:p-8">
          <div className="space-y-2"><h3 id="pix-payment-title" className="font-serif-luxury text-2xl font-bold text-[#1C1917] sm:text-3xl">Seu Pix está pronto</h3><p className="mx-auto max-w-md text-sm leading-relaxed text-[#78716C]">Pague R$ 47,00 pelo app do seu banco. Assim que o pagamento for confirmado, enviaremos seus 3 PDFs por e-mail.</p></div>
          <img src={`data:image/jpeg;base64,${pixPayment.qrCodeBase64}`} alt="QR Code Pix" className="mx-auto h-40 w-40 rounded-2xl border border-[#F0EAE1] bg-white p-2 sm:h-52 sm:w-52 sm:p-3" />
          <div className="space-y-2 text-left"><label htmlFor="pix-code" className="block text-xs font-semibold text-[#1C1917]">Pix Copia e Cola</label><textarea id="pix-code" readOnly value={pixPayment.qrCode} rows={3} className={`${fieldClass} resize-none bg-[#FAF8F5] text-xs sm:text-sm`} /><button type="button" onClick={() => void copyPixCode()} className="min-h-11 w-full rounded-full border border-[#C5A059] px-5 py-3 text-sm font-semibold text-[#6F4E1F] transition-colors hover:bg-[#FAF8F5] cursor-pointer">{copied ? "Código copiado" : "Copiar código Pix"}</button></div>
          <a href={pixPayment.ticketUrl} target="_blank" rel="noreferrer" className="inline-block min-h-11 px-3 py-2 text-sm font-semibold text-[#8F6D32] underline underline-offset-4">Abrir Pix no Mercado Pago</a>
          <p className="text-xs leading-relaxed text-[#78716C]">Mantenha esta tela aberta até concluir o pagamento.</p>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        </div>
      </div>
    </div>;
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="relative w-full max-w-xl bg-white rounded-3xl sm:rounded-[32px] border border-[#F0EAE1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="px-6 py-4 border-b border-[#F0EAE1] flex items-center justify-between bg-[#FAF8F5]"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#B38E46]" /><span className="text-xs uppercase tracking-widest font-bold text-[#1C1917]">Sua história, seus votos</span></div><button onClick={closeModal} disabled={isSubmitting} className="p-1.5 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-colors cursor-pointer disabled:opacity-50" aria-label="Fechar modal"><X className="w-5 h-5" /></button></div>
      <div className="w-full bg-[#F0EAE1] h-1.5"><div className="bg-gradient-to-r from-[#B38E46] to-[#C5A059] h-1.5 transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }} /></div>
      <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
        <div className="flex items-center justify-between text-xs text-[#78716C]"><span className="font-semibold text-[#B38E46]">Pergunta {currentStep} de {totalSteps}</span><span>Responda do seu jeito</span></div>
        {currentStep === 1 && <div className="space-y-4"><h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">Quem vai ler os votos e para quem?</h3><div className="grid grid-cols-2 gap-3">{[["noivo-noiva", "Noivo falando para Noiva"], ["noiva-noivo", "Noiva falando para Noivo"], ["noivo-noivo", "Noivo falando para Noivo"], ["noiva-noiva", "Noiva falando para Noiva"]].map(([id, label]) => <button key={id} type="button" onClick={() => setFormData({ ...formData, who: id })} className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${formData.who === id ? "border-[#C5A059] bg-[#FAF8F5] text-[#1C1917] font-semibold shadow-sm" : "border-[#F0EAE1] hover:border-gray-300 text-[#78716C]"}`}>{label}</button>)}</div><div><label htmlFor="buyer-email" className="block text-xs font-semibold text-[#1C1917] mb-1">Seu e-mail para receber os PDFs</label><input id="buyer-email" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className={fieldClass} placeholder="voce@email.com" /></div><div className="grid grid-cols-2 gap-3"><Field id="speaker-name" label="Seu nome ou apelido" value={formData.speakerName} onChange={(speakerName) => setFormData({ ...formData, speakerName })} /><Field id="partner-name" label="Nome de quem você ama" value={formData.partnerName} onChange={(partnerName) => setFormData({ ...formData, partnerName })} /></div></div>}
        {currentStep === 2 && <Question label="Como vocês se conheceram" help="Onde vocês se conheceram? Frases simples já ajudam." value={formData.howMet} onChange={setText("howMet")} />}
        {currentStep === 3 && <Question label="Uma lembrança só de vocês" help="Conte uma mania, uma piada interna ou um pequeno gesto de carinho." value={formData.insideJoke} onChange={setText("insideJoke")} />}
        {currentStep === 4 && <Question label="Um momento que confirmou esse amor" help="Pode ser um gesto de apoio, uma conversa ou um dia comum." value={formData.certainMoment} onChange={setText("certainMoment")} />}
        {currentStep === 5 && <div className="space-y-4"><h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">Qual tom você quer dar aos seus votos?</h3><p className="text-xs text-[#78716C]">Você receberá 3 variações inéditas dentro desse mesmo tom.</p>{[{ id: "lagrimas", title: "Lágrimas e Coração", desc: "Carinho, gratidão e o que vocês viveram" }, { id: "sorrisos", title: "Sorrisos e Cumplicidade", desc: "Romance, manias e um toque de humor" }, { id: "classica", title: "Clássica e Atemporal", desc: "Um texto mais breve, com foco nas promessas" }].map((tone) => <button key={tone.id} type="button" onClick={() => setFormData({ ...formData, tone: tone.id as Tone })} className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all ${formData.tone === tone.id ? "border-[#C5A059] bg-[#FAF8F5]" : "border-[#F0EAE1] hover:border-gray-300"}`}><span className="font-semibold text-sm text-[#1C1917]">{tone.title}</span><span className="block text-xs text-[#78716C] mt-0.5">{tone.desc}</span></button>)}</div>}
        {currentStep === 6 && <Question label="Uma promessa que vem do coração" help="Pense no cuidado que quer ter todos os dias." value={formData.deepPromise} onChange={setText("deepPromise")} />}
        {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}
        <div className="pt-4 border-t border-[#F0EAE1] flex items-center justify-between">{currentStep > 1 ? <button type="button" onClick={() => { setError(""); setCurrentStep((step) => step - 1); }} disabled={isSubmitting} className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] cursor-pointer disabled:opacity-50"><ArrowLeft className="w-4 h-4" />Voltar</button> : <div />}<button type="button" onClick={handleNext} disabled={isSubmitting} className="bg-[#1C1917] hover:bg-[#292524] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-70">{isSubmitting ? <><LoaderCircle className="w-4 h-4 animate-spin text-[#C5A059]" />Gerando Pix...</> : <><span>{currentStep === totalSteps ? "Gerar Pix de R$ 47,00" : "Continuar"}</span><ArrowRight className="w-4 h-4 text-[#C5A059]" /></>}</button></div>
        <p className="text-[11px] text-[#78716C] flex items-center justify-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#B38E46]" />Pagamento único via Pix • entrega por e-mail</p>
      </div>
    </div>
  </div>;
}

function Field({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) { return <div><label htmlFor={id} className="block text-xs font-semibold text-[#1C1917] mb-1">{label}</label><input id={id} type="text" value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass} /></div>; }
function Question({ label, help, value, onChange }: { label: string; help: string; value: string; onChange: (value: string) => void }) { const id = label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-"); return <div className="space-y-4"><h3 className="font-serif-luxury text-2xl font-bold text-[#1C1917]">{label}</h3><p className="text-xs text-[#78716C]">{help}</p><label htmlFor={id} className="sr-only">{label}</label><textarea id={id} rows={4} value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} resize-none`} /></div>; }
