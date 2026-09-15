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

  it("creates a R$ 47,00 Pix Order and returns data for the in-page QR code", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("order-123");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "ORD-123",
          transactions: {
            payments: [
              {
                id: "PAY-123",
                payment_method: {
                  qr_code: "pix-copy-paste",
                  qr_code_base64: "aGVsbG8=",
                  ticket_url: "https://mercadopago.test/pix",
                },
              },
            ],
          },
        }),
        { status: 201 },
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
        orderId: "ORD-123",
        qrCode: "pix-copy-paste",
        qrCodeBase64: "aGVsbG8=",
        ticketUrl: "https://mercadopago.test/pix",
      },
    });
    expect(statements[0]?.values).toContain(4700);
    expect(statements[0]?.values).toContain("pending");

    expect(fetchSpy).toHaveBeenCalledOnce();
    const orderRequest = fetchSpy.mock.calls[0];
    expect(orderRequest?.[0]).toBe("https://api.mercadopago.com/v1/orders");
    expect(orderRequest?.[1]).toMatchObject({ headers: expect.objectContaining({ "X-Idempotency-Key": "order-123" }) });
    expect(JSON.parse(String(orderRequest?.[1]?.body))).toMatchObject({
      type: "online",
      total_amount: "47.00",
      external_reference: "order-123",
      processing_mode: "automatic",
      payer: { email: "ana@example.com" },
      transactions: { payments: [{ amount: "47.00", payment_method: { id: "pix", type: "bank_transfer" } }] },
    });
    expect(statements.some((statement) => statement.sql.includes("mercado_pago_order_id"))).toBe(true);
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
