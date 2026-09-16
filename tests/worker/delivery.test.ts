import { afterEach, describe, expect, it, vi } from "vitest";
import { sendVowEmail } from "../../src/worker/delivery";

const order = {
  id: "order-123",
  email: "ana@example.com",
  tone: "lagrimas" as const,
  answers: {
    email: "ana@example.com",
    who: "noiva-noivo",
    speakerName: "Ana <script>",
    partnerName: "João",
    howMet: "Nos conhecemos em uma padaria.",
    insideJoke: "",
    certainMoment: "",
    deepPromise: "",
    tone: "lagrimas" as const,
  },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sendVowEmail", () => {
  it("entrega uma celebração personalizada, elegante e legível mesmo sem HTML", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "resend-123" }), { status: 200 }),
    );

    await expect(
      sendVowEmail(
        { RESEND_API_KEY: "resend-test", EMAIL_FROM: "VotosPerfeitos <oi@example.com>" } as never,
        order,
        [{ filename: "votos-lagrimas-variacao-1.pdf", bytes: new Uint8Array([1, 2, 3]) }],
      ),
    ).resolves.toBe("resend-123");

    const payload = JSON.parse(String(fetchSpy.mock.calls[0]?.[1]?.body));
    expect(payload.subject).toBe("Seus votos estão prontos para o altar");
    expect(payload.html).toContain("Ana &lt;script&gt; e João");
    expect(payload.html).toContain("Que bonito chegar até aqui");
    expect(payload.html).toContain("Três versões foram preparadas para vocês");
    expect(payload.html).toContain("Como escolher a sua versão");
    expect(payload.html).not.toContain("<img");
    expect(payload.text).toContain("Ana <script> e João");
    expect(payload.text).toContain("3 PDFs anexados");
    expect(payload.attachments).toHaveLength(1);
  });
});
