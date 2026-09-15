// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuizModal } from "../../src/components/QuizModal";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("QuizModal", () => {
  it("sends the buyer email and selected tone to checkout, then shows the Pix QR code", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        orderId: "order-123",
        payment: {
          orderId: "ORD-123",
          qrCode: "pix-copy-paste",
          qrCodeBase64: "aGVsbG8=",
          ticketUrl: "https://mercadopago.test/pix",
        },
      }), { status: 201 }),
    );
    render(<QuizModal isOpen onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Seu e-mail para receber os PDFs"), { target: { value: "ana@example.com" } });
    fireEvent.change(screen.getByLabelText("Seu nome ou apelido"), { target: { value: "Ana" } });
    fireEvent.change(screen.getByLabelText("Nome de quem você ama"), { target: { value: "João" } });
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    fireEvent.change(screen.getByLabelText("Como vocês se conheceram"), { target: { value: "Nos conhecemos em uma padaria." } });
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.change(screen.getByLabelText("Uma lembrança só de vocês"), { target: { value: "A chave de casa." } });
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.change(screen.getByLabelText("Um momento que confirmou esse amor"), { target: { value: "Quando ele cuidou de mim." } });
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: /Lágrimas e Coração/ }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.change(screen.getByLabelText("Uma promessa que vem do coração"), { target: { value: "Prometo caminhar ao seu lado." } });
    await user.click(screen.getByRole("button", { name: "Gerar Pix de R$ 47,00" }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/checkout",
      expect.objectContaining({ method: "POST" }),
    );
    expect(JSON.parse(String(fetchSpy.mock.calls[0]?.[1]?.body))).toMatchObject({
      email: "ana@example.com",
      tone: "lagrimas",
      speakerName: "Ana",
      partnerName: "João",
    });
    expect(await screen.findByRole("heading", { name: "Seu Pix está pronto" })).not.toBeNull();
    const pixModal = screen.getByTestId("pix-payment-modal");
    expect(pixModal.className).toContain("max-h-[calc(100dvh-2rem)]");
    expect(pixModal.className).toContain("overflow-y-auto");
    expect(screen.getByAltText("QR Code Pix").className).toContain("sm:h-52");
    expect(screen.getByAltText("QR Code Pix").getAttribute("src")).toBe("data:image/jpeg;base64,aGVsbG8=");
    expect(screen.getByDisplayValue("pix-copy-paste")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Abrir Pix no Mercado Pago" }).getAttribute("href")).toBe("https://mercadopago.test/pix");
    await user.click(screen.getByRole("button", { name: "Copiar código Pix" }));
    expect(writeText).toHaveBeenCalledWith("pix-copy-paste");
    expect(screen.getByRole("button", { name: "Código copiado" })).not.toBeNull();
  });
});
