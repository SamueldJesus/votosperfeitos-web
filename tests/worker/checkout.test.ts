import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../../src/worker/index";

const checkoutInput = {
  email: "ana@example.com",
  who: "noiva-noivo",
  speakerName: "Ana",
  partnerName: "João",
  howMet: "Nos conhecemos em uma padaria em um sábado de chuva.",
  insideJoke: "Ele sempre esquece a chave de casa.",
  certainMoment: "Quando ele cuidou de mim durante uma gripe.",
  admiration: "Admiro a calma e o cuidado dele nos detalhes.",
  deepPromise: "Prometo caminhar ao seu lado nos dias bons e difíceis.",
  tone: "lagrimas",
};

function createEnv() {
  const statements: { sql: string; values: unknown[] }[] = [];

  return {
    env: {
      ASSETS: { fetch: vi.fn(async () => new Response("not found", { status: 404 })) },
      ORDERS: {
        prepare(sql: string) {
          const statement = {
            sql,
            values: [] as unknown[],
            bind(...values: unknown[]) {
              statement.values = values;
              return statement;
            },
            run: async () => ({ success: true, meta: { changes: 1 } }),
          };
          statements.push(statement);
          return statement;
        },
      },
      VOW_JOBS: { send: vi.fn() },
      VOW_FILES: {},
      OPENAI_API_KEY: "openai-test",
      MP_ACCESS_TOKEN: "mp-test",
      MP_WEBHOOK_SECRET: "webhook-test",
      PAGARME_SECRET_KEY: "sk_test_example",
      PAGARME_BASE_URL: "https://sdx-api.pagar.me/core/v5",
      PAGARME_WEBHOOK_TOKEN: "webhook-token",
      RESEND_API_KEY: "resend-test",
      EMAIL_FROM: "VotosPerfeitos <oi@example.com>",
    },
    statements,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/checkout", () => {
  it("rejects a checkout body larger than the accepted limit before parsing it", async () => {
    const { env } = createEnv();
    const response = await worker.fetch(
      new Request("https://votosperfeitos.test/api/checkout", {
        method: "POST",
        headers: { "Content-Length": "40001" },
        body: "x".repeat(40001),
      }) as never,
      env as never,
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "Dados do pedido são muito grandes" });
  });

  it("creates a R$ 0,50 Pagar.me Pix checkout and returns its hosted URL", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("order-123");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ id: "pl_123", url: "https://payment-link.pagar.me/pl_123", status: "active" }),
        { status: 200 },
      ),
    );
    const { env, statements } = createEnv();

    const response = await worker.fetch(
      new Request("https://votosperfeitos.test/api/checkout", {
        method: "POST",
        body: JSON.stringify({ ...checkoutInput, amount: 1 }),
      }) as never,
      env as never,
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      orderId: "order-123",
      payment: {
        linkId: "pl_123",
        url: "https://payment-link.pagar.me/pl_123",
      },
    });
    expect(statements[0]?.values).toContain(50);
    expect(statements[0]?.values).toContain("pending");

    expect(fetchSpy).toHaveBeenCalledOnce();
    const orderRequest = fetchSpy.mock.calls[0];
    expect(orderRequest?.[0]).toBe("https://sdx-api.pagar.me/core/v5/paymentlinks");
    expect(orderRequest?.[1]).toMatchObject({ headers: expect.objectContaining({ "Idempotency-key": "order-123" }) });
    expect(JSON.parse(String(orderRequest?.[1]?.body))).toMatchObject({
      type: "order",
      order_code: "order-123",
      max_paid_sessions: 1,
      payment_settings: { accepted_payment_methods: ["pix"] },
      cart_settings: { items: [{ amount: 50, default_quantity: 1 }] },
    });
    expect(statements.some((statement) => statement.sql.includes("pagarme_link_id"))).toBe(true);
  });

  it("does not expose a provider failure as a buyer input error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("provider unavailable", { status: 503 }));
    const { env } = createEnv();

    const response = await worker.fetch(
      new Request("https://votosperfeitos.test/api/checkout", {
        method: "POST",
        body: JSON.stringify(checkoutInput),
      }) as never,
      env as never,
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "Não foi possível iniciar o pagamento agora" });
  });
});

describe("Meta checkout tracking", () => {
  it("sends CAPI InitiateCheckout after a Pix order is successfully created", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("order-123");
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: "pl_123", url: "https://payment-link.pagar.me/pl_123", status: "active",
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ events_received: 1 }), { status: 200 }));
    const { env } = createEnv();
    Object.assign(env, { META_PIXEL_ID: "pixel-123", META_CAPI_ACCESS_TOKEN: "capi-token" });

    const response = await worker.fetch(
      new Request("https://votosperfeitos.avancoai.com.br/api/checkout", {
        method: "POST",
        headers: { "user-agent": "test-agent", "cf-connecting-ip": "198.51.100.5" },
        body: JSON.stringify({
          ...checkoutInput,
          tracking: { eventId: "b9a01abe-343f-41f4-b0e7-112233445566", fbp: "fb.1.1700000000.123456" },
        }),
      }) as never,
      env as never,
    );

    expect(response.status).toBe(201);
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "https://graph.facebook.com/v24.0/pixel-123/events",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
