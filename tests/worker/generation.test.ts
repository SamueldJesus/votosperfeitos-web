import { afterEach, describe, expect, it, vi } from "vitest";
import { generateVows } from "../../src/worker/generation";

const order = {
  id: "order-123",
  email: "ana@example.com",
  tone: "lagrimas" as const,
  answers: {
    email: "ana@example.com",
    who: "noiva-noivo",
    speakerName: "Ana",
    partnerName: "João",
    howMet: "Nos conhecemos em uma padaria em um sábado de chuva.",
    insideJoke: "Ele sempre esquece a chave de casa.",
    certainMoment: "Quando ele cuidou de mim durante uma gripe.",
    deepPromise: "Prometo caminhar ao seu lado nos dias bons e difíceis.",
    tone: "lagrimas" as const,
  },
};

const threeVows = {
  variations: [
    { id: "1", title: "Nossa história", subtitle: "Uma narrativa para o altar", body: "Meu amor, nossa história começou na chuva." },
    { id: "2", title: "Minhas promessas", subtitle: "Compromissos para a vida", body: "Prometo escolher você nas manhãs e nas noites." },
    { id: "3", title: "Direto do coração", subtitle: "Uma leitura íntima", body: "João, eu amo a nossa vida construída em pequenos gestos." },
  ],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("generateVows", () => {
  it("asks OpenAI for three distinct variations in the selected tone", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ output_text: JSON.stringify(threeVows) }), { status: 200 }),
    );

    await expect(generateVows({ OPENAI_API_KEY: "openai-test" } as never, order)).resolves.toEqual(threeVows.variations);

    const requestBody = JSON.stringify(fetchSpy.mock.calls[0]?.[1]?.body);
    expect(requestBody).toContain("lagrimas");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.openai.com/v1/responses",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer openai-test" }) }),
    );
  });

  it("rejects a response that does not contain all three variations", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ output_text: JSON.stringify({ variations: threeVows.variations.slice(0, 2) }) }), {
        status: 200,
      }),
    );

    await expect(generateVows({ OPENAI_API_KEY: "openai-test" } as never, order)).rejects.toThrow(
      "A geração precisa conter 3 variações",
    );
  });
});
