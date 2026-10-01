// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuizModal } from "../../src/components/QuizModal";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function completeQuiz(user: ReturnType<typeof userEvent.setup>) {
  fireEvent.change(screen.getByLabelText("Seu melhor e-mail para receber os PDFs"), { target: { value: "ana@example.com" } });
  fireEvent.change(screen.getByLabelText("Seu nome ou apelido nos votos"), { target: { value: "Ana" } });
  fireEvent.change(screen.getByLabelText("Nome ou apelido de quem você ama"), { target: { value: "João" } });
  await user.click(screen.getByRole("button", { name: "Continuar" }));

  fireEvent.change(screen.getByLabelText("Como vocês se conheceram"), { target: { value: "Nos conhecemos em uma padaria." } });
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  fireEvent.change(screen.getByLabelText("Uma lembrança só de vocês"), { target: { value: "A chave de casa." } });
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  fireEvent.change(screen.getByLabelText("Um momento que confirmou esse amor"), { target: { value: "Quando ele cuidou de mim." } });
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  fireEvent.change(screen.getByLabelText("O que você mais admira nessa pessoa?"), { target: { value: "Admiro o jeito como ele cuida de todos com calma." } });
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  fireEvent.change(screen.getByLabelText("Uma promessa que vem do coração"), { target: { value: "Prometo caminhar ao seu lado." } });
}

function stubNavigation() {
  const assign = vi.fn();
  const realWindow = window;
  vi.stubGlobal("window", new Proxy(realWindow, {
    get(target, property) {
      if (property === "location") return { assign };
      return Reflect.get(target, property, target);
    },
  }));
  return assign;
}

describe("QuizModal", () => {
  it("sends the quiz answers and opens the Pagar.me hosted checkout", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        orderId: "order-123",
        payment: { linkId: "link-123", url: "https://checkout.pagar.me/pay/link-123" },
      }), { status: 201 }),
    );
    render(<QuizModal isOpen onClose={vi.fn()} />);
    const assign = stubNavigation();

    await completeQuiz(user);
    await user.click(screen.getByRole("button", { name: "Ir para o checkout Pix de R$ 47,00" }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://checkout.pagar.me/pay/link-123"));
    expect(fetchSpy).toHaveBeenCalledWith("/api/checkout", expect.objectContaining({ method: "POST" }));
    expect(JSON.parse(String(fetchSpy.mock.calls[0]?.[1]?.body))).toMatchObject({
      email: "ana@example.com",
      tone: "lagrimas",
      speakerName: "Ana",
      partnerName: "João",
      admiration: "Admiro o jeito como ele cuida de todos com calma.",
    });
    expect(screen.getByRole("link", { name: "Abrir checkout do Pagar.me" }).getAttribute("href")).toBe("https://checkout.pagar.me/pay/link-123");
    expect(screen.queryByAltText("QR Code Pix")).toBeNull();
  });

  it("rejects a checkout URL outside HTTPS Pagar.me", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        orderId: "order-123",
        payment: { linkId: "link-123", url: "https://checkout.pagar.me.evil.example/pay/link-123" },
      }), { status: 201 }),
    );
    render(<QuizModal isOpen onClose={vi.fn()} />);
    const assign = stubNavigation();

    await completeQuiz(user);
    await user.click(screen.getByRole("button", { name: "Ir para o checkout Pix de R$ 47,00" }));

    expect(await screen.findByRole("alert")).not.toBeNull();
    expect(assign).not.toHaveBeenCalled();
    expect(screen.queryByRole("link", { name: "Abrir checkout do Pagar.me" })).toBeNull();
  });

  it("shows an error and keeps the quiz open when checkout creation fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Serviço de pagamento indisponível." }), { status: 502 }),
    );
    render(<QuizModal isOpen onClose={vi.fn()} />);
    const assign = stubNavigation();

    await completeQuiz(user);
    await user.click(screen.getByRole("button", { name: "Ir para o checkout Pix de R$ 47,00" }));

    expect(await screen.findByRole("alert")).not.toBeNull();
    expect(screen.getByText("Serviço de pagamento indisponível.")).not.toBeNull();
    expect(assign).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Uma promessa que vem do coração")).not.toBeNull();
  });
});
