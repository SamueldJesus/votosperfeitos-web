import { afterEach, describe, expect, it, vi } from "vitest";
import { handleVowMessage, processVowJob } from "../../src/worker/queue";

const generated = {
  variations: [
    { id: "1", title: "Nossa história", subtitle: "Uma narrativa", body: "Nossa história começou em uma padaria." },
    { id: "2", title: "Minhas promessas", subtitle: "Compromissos", body: "Prometo escolher você todos os dias." },
    { id: "3", title: "Do coração", subtitle: "Leitura íntima", body: "Meu amor, a nossa vida é feita de gestos." },
  ],
};

function createEnv() {
  const state = {
    status: "paid",
    attempts: 0,
  };
  const put = vi.fn(async () => undefined);
  const answers = {
    email: "ana@example.com",
    who: "noiva-noivo",
    speakerName: "Ana",
    partnerName: "João",
    howMet: "Nos conhecemos em uma padaria.",
    insideJoke: "A chave de casa.",
    certainMoment: "Quando ele cuidou de mim.",
    deepPromise: "Prometo caminhar ao seu lado.",
    tone: "lagrimas",
  };

  const env = {
    ASSETS: { fetch: vi.fn() },
    ORDERS: {
      prepare(sql: string) {
        const statement = {
          bind: (...values: unknown[]) => {
            void values;
            return statement;
          },
          first: async () => ({
            id: "order-123",
            email: "ana@example.com",
            answers_json: JSON.stringify(answers),
            tone: "lagrimas",
            delivery_attempts: state.attempts,
            status: state.status,
          }),
          run: async () => {
            if (sql.includes("SET status = 'processing'")) {
              if (state.status !== "paid") return { success: true, meta: { changes: 0 } };
              state.status = "processing";
              return { success: true, meta: { changes: 1 } };
            }
            if (sql.includes("SET status = 'sent'")) {
              state.status = "sent";
              return { success: true, meta: { changes: 1 } };
            }
            if (sql.includes("delivery_attempts = delivery_attempts + 1")) {
              state.attempts += 1;
              state.status = "paid";
              return { success: true, meta: { changes: 1 } };
            }
            return { success: true, meta: { changes: 1 } };
          },
        };
        return statement;
      },
    },
    VOW_JOBS: { send: vi.fn() },
    VOW_FILES: { put },
    OPENAI_API_KEY: "openai-test",
    MP_ACCESS_TOKEN: "mp-test",
    MP_WEBHOOK_SECRET: "webhook-test",
    RESEND_API_KEY: "resend-test",
    EMAIL_FROM: "VotosPerfeitos <oi@example.com>",
  };

  return { env, put, state };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("processVowJob", () => {
  it("generates, stores, and emails exactly three PDFs for a paid order once", async () => {
    const { env, put, state } = createEnv();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy
      .mockResolvedValueOnce(new Response(JSON.stringify({ output_text: JSON.stringify(generated) }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "email-123" }), { status: 200 }));

    await processVowJob({ orderId: "order-123" }, env as never);

    expect(put).toHaveBeenCalledTimes(3);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const email = JSON.parse(String(fetchSpy.mock.calls[1]?.[1]?.body));
    expect(email.attachments).toHaveLength(3);
    expect(email.to).toEqual(["ana@example.com"]);
    expect(state.status).toBe("sent");

    await processVowJob({ orderId: "order-123" }, env as never);

    expect(put).toHaveBeenCalledTimes(3);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("restores a delivery failure to paid and asks Cloudflare Queue to retry", async () => {
    const { env, state } = createEnv();
    const retry = vi.fn();
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ output_text: JSON.stringify(generated) }), { status: 200 }))
      .mockResolvedValueOnce(new Response("provider unavailable", { status: 503 }));

    await handleVowMessage({ body: { orderId: "order-123" }, retry }, env as never);

    expect(retry).toHaveBeenCalledTimes(1);
    expect(state).toEqual({ status: "paid", attempts: 1 });
  });
});
