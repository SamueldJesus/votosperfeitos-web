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
    admiration: "",
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
    expect(payload.subject).toBe("VotosPerfeitos: seus 3 PDFs estão anexados");
    expect(payload.reply_to).toEqual(["contato@avancoai.com.br"]);
    expect(payload.html).toContain("Ana &lt;script&gt; e João");
    expect(payload.html).toContain("Seus votos estão prontos");
    expect(payload.html).toContain("Entrega digital do seu pedido");
    expect(payload.html).not.toContain("<img");
    expect(payload.text).toContain("Ana <script> e João");
    expect(payload.text).toContain("três PDFs do seu pedido estão anexados");
    expect(payload.text).toContain("Este é um e-mail transacional de entrega");
    expect(payload.attachments).toHaveLength(1);
  });
});
