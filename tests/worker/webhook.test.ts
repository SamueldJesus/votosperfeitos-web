import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleMercadoPagoWebhook } from "../../src/worker/webhook";

function signedHeaders(dataId: string, requestId: string, secret: string) {
  const timestamp = "1742505638683";
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
  const signature = createHmac("sha256", secret).update(manifest).digest("hex");

  return {
    "x-request-id": requestId,
    "x-signature": `ts=${timestamp},v1=${signature}`,
  };
}

function createEnv(status = "pending") {
  const queueSend = vi.fn(async () => undefined);
  const statements: { sql: string; values: unknown[] }[] = [];
  const pendingOrder = {
    id: "order-123",
    amount_cents: 4700,
    status,
    mercado_pago_order_id: "ORD-123",
    email: "ana@example.com",
    tracking_json: JSON.stringify({ fbp: "fb.1.1700000000.123456" }),
  };

  return {
    env: {
      ASSETS: { fetch: vi.fn() },
      ORDERS: {
        prepare(sql: string) {
          const statement = {
            sql,
            values: [] as unknown[],
            bind(...values: unknown[]) {
              statement.values = values;
              return statement;
            },
            first: async () => (sql.startsWith("SELECT") ? pendingOrder : null),
            run: async () => ({ success: true, meta: { changes: 1 } }),
          };
          statements.push(statement);
          return statement;
        },
      },
      VOW_JOBS: { send: queueSend },
      VOW_FILES: {},
      OPENAI_API_KEY: "openai-test",
      MP_ACCESS_TOKEN: "mp-test",
      MP_WEBHOOK_SECRET: "webhook-secret",
      RESEND_API_KEY: "resend-test",
      EMAIL_FROM: "VotosPerfeitos <oi@example.com>",
    },
    queueSend,
    statements,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("handleMercadoPagoWebhook", () => {
  it("confirms a signed accredited Pix Order with Mercado Pago before queuing its order", async () => {
    const { env, queueSend, statements } = createEnv();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "ORD-123",
          status: "processed",
          status_detail: "accredited",
          total_amount: "47.00",
          currency: "BRL",
          external_reference: "order-123",
          transactions: {
            payments: [{
              id: "PAY-123",
              status: "processed",
              status_detail: "accredited",
              amount: "47.00",
              payment_method: { id: "pix", type: "bank_transfer" },
            }],
          },
        }),
        { status: 200 },
      ),
    );
    const requestId = "request-123";
    const request = new Request("https://votosperfeitos.test/api/webhooks/mercado-pago?data.id=ORD-123", {
      method: "POST",
      headers: signedHeaders("ORD-123", requestId, "webhook-secret"),
    });

    const response = await handleMercadoPagoWebhook(request, env as never);

    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.mercadopago.com/v1/orders/ORD-123",
      expect.objectContaining({ headers: { Authorization: "Bearer mp-test" } }),
    );
    expect(queueSend).toHaveBeenCalledWith({ orderId: "order-123" });
    expect(statements.some((statement) => statement.sql.includes("SET status = 'paid'"))).toBe(true);
  });

  it("rejects a notification whose signature does not match", async () => {
    const { env, queueSend } = createEnv();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const request = new Request("https://votosperfeitos.test/api/webhooks/mercado-pago?data.id=payment-123", {
      method: "POST",
      headers: { "x-request-id": "request-123", "x-signature": "ts=1742505638683,v1=invalid" },
    });

    const response = await handleMercadoPagoWebhook(request, env as never);

    expect(response.status).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(queueSend).not.toHaveBeenCalled();
  });

  it("does not queue an Order that is not accredited", async () => {
    const { env, queueSend } = createEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        id: "ORD-123", status: "processing", status_detail: "pending", total_amount: "47.00", currency: "BRL", external_reference: "order-123",
        transactions: { payments: [{ id: "PAY-123", status: "processing", payment_method: { id: "pix", type: "bank_transfer" } }] },
      }), { status: 200 }),
    );
    const request = new Request("https://votosperfeitos.test/api/webhooks/mercado-pago?data.id=ORD-123", {
      method: "POST",
      headers: signedHeaders("ORD-123", "request-123", "webhook-secret"),
    });

    await expect(handleMercadoPagoWebhook(request, env as never)).resolves.toMatchObject({ status: 200 });
    expect(queueSend).not.toHaveBeenCalled();
  });

  it("does not queue a confirmed order again when Mercado Pago replays a paid webhook", async () => {
    const { env, queueSend } = createEnv("paid");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        id: "ORD-123", status: "processed", status_detail: "accredited", total_amount: "47.00", currency: "BRL", external_reference: "order-123",
        transactions: { payments: [{ id: "PAY-123", status: "processed", status_detail: "accredited", payment_method: { id: "pix", type: "bank_transfer" } }] },
      }), { status: 200 }),
    );
    const request = new Request("https://votosperfeitos.test/api/webhooks/mercado-pago?data.id=ORD-123", {
      method: "POST",
      headers: signedHeaders("ORD-123", "request-123", "webhook-secret"),
    });

    await expect(handleMercadoPagoWebhook(request, env as never)).resolves.toMatchObject({ status: 200 });
    expect(queueSend).not.toHaveBeenCalled();
  });

  it("sends one server-verified Purchase after a successful Pix transition", async () => {
    const { env, queueSend, statements } = createEnv();
    Object.assign(env, { META_PIXEL_ID: "pixel-123", META_CAPI_ACCESS_TOKEN: "capi-token" });
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: "ORD-123", status: "processed", status_detail: "accredited", total_amount: "47.00", currency: "BRL", external_reference: "order-123",
        transactions: { payments: [{ id: "PAY-123", status: "processed", status_detail: "accredited", payment_method: { id: "pix", type: "bank_transfer" } }] },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ events_received: 1 }), { status: 200 }));
    const request = new Request("https://votosperfeitos.test/api/webhooks/mercado-pago?data.id=ORD-123", {
      method: "POST", headers: signedHeaders("ORD-123", "request-123", "webhook-secret"),
    });

    await expect(handleMercadoPagoWebhook(request, env as never)).resolves.toMatchObject({ status: 200 });

    expect(queueSend).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenNthCalledWith(2, "https://graph.facebook.com/v24.0/pixel-123/events", expect.objectContaining({ method: "POST" }));
    expect(statements.some((statement) => statement.sql.includes("meta_purchase_sent_at"))).toBe(true);
  });
});
