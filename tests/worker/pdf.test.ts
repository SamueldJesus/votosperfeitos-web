import { describe, expect, it } from "vitest";
import { makePdfFilename, renderVowPdf } from "../../src/worker/pdf";

const order = {
  id: "order-123",
  email: "ana@example.com",
  tone: "lagrimas" as const,
  answers: {
    email: "ana@example.com",
    who: "noiva-noivo",
    speakerName: "Ana",
    partnerName: "João",
    howMet: "Nos conhecemos em uma padaria.",
    insideJoke: "A chave de casa.",
    certainMoment: "Quando ele cuidou de mim.",
    admiration: "Admiro o cuidado e a calma dele.",
    deepPromise: "Prometo caminhar ao seu lado.",
    tone: "lagrimas" as const,
  },
};

describe("renderVowPdf", () => {
  it("renders a readable PDF and creates a tone-specific filename", async () => {
    const bytes = await renderVowPdf(
      {
        id: "2",
        title: "Minhas promessas",
        subtitle: "Para ler no altar",
        body: "Meu amor, prometo escolher a nossa história todos os dias.",
      },
      order,
    );

    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("%PDF");
    expect(bytes.byteLength).toBeGreaterThan(500);
    expect(makePdfFilename("lagrimas", "2")).toBe("votos-lagrimas-variacao-2.pdf");
  });

  it("keeps delivery working when a buyer name contains unsupported characters", async () => {
    await expect(
      renderVowPdf(
        { id: "1", title: "Nossa história", subtitle: "Para o altar", body: "Prometo estar ao seu lado." },
        { ...order, answers: { ...order.answers, speakerName: "Ana 💍" } },
      ),
    ).resolves.toBeInstanceOf(Uint8Array);
  });
});
