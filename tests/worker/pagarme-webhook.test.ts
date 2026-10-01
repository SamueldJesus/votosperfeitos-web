import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../../src/worker/index";
import { reconcilePendingPagarmeOrders } from "../../src/worker/pagarme-webhook";

const paidPixOrder = {
  id: "or_123",
  code: "order-123",
  status: "paid",
  amount: 4700,
  currency: "BRL",
  charges: [{
    id: "ch_123",
    status: "paid",
    payment_method: "pix",
    amount: 4700,
    paid_amount: 4700,
    last_transaction: { status: "paid", amount: 4700 },
  }],
};

function createEnv(overrides: Record<string, unknown> = {}, pendingIds: string[] = []) {
  const queueSend = vi.fn(async () => undefined);
  const statements: { sql: string; values: unknown[] }[] = [];
  const localOrder = {
    id: "order-123",
    email: "ana@example.com",
    tracking_json: "{}",
    amount_cents: 4700,
    status: "pending",
    pagarme_link_id: "pl_123",
    pagarme_order_id: null,
    ...overrides,
  };
  const env = {
    ASSETS: { fetch: vi.fn(async () => new Response("not found", { status: 404 })) },
    ORDERS: {
      prepare(sql: string) {
        const statement = {
          sql,
          values: [] as unknown[],
          bind(...values: unknown[]) { statement.values = values; return statement; },
          first: async () => sql.startsWith("SELECT") ? localOrder : null,
          all: async () => ({ results: pendingIds.map((id) => ({ id })) }),
          run: async () => ({ success: true, meta: { changes: 1 } }),
        };
        statements.push(statement);
        return statement;
      },
    },
    VOW_JOBS: { send: queueSend },
    VOW_FILES: {},
    PAGARME_SECRET_KEY: "sk_test_example",
    PAGARME_BASE_URL: "https://sdx-api.pagar.me/core/v5",
    PAGARME_WEBHOOK_TOKEN: "webhook-token",
    MP_ACCESS_TOKEN: "mp-test",
    MP_WEBHOOK_SECRET: "mp-webhook-test",
    META_PIXEL_ID: "",
    META_CAPI_ACCESS_TOKEN: "",
  };
  return { env, localOrder, queueSend, statements };
}

function notification(token = "webhook-token") {
  return new Request(`https://votosperfeitos.test/api/webhooks/pagarme?token=${token}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: "hook_123", type: "order.paid", data: { id: "or_123", code: "order-123" } }),
  });
}

afterEach(() => vi.restoreAllMocks());

describe("Pagar.me order.paid webhook", () => {
  it("queries the provider and delivers one verified R$ 47 Pix purchase", async () => {
    const { env, queueSend, statements } = createEnv();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(paidPixOrder), { status: 200 }),
    );

    const response = await worker.fetch(notification(), env as never);

    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://sdx-api.pagar.me/core/v5/orders/or_123",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.stringMatching(/^Basic /) }) }),
    );
    expect(statements.some((statement) => statement.sql.includes("SET status = 'paid'") && statement.values.includes("ch_123"))).toBe(true);
    expect(queueSend).toHaveBeenCalledExactlyOnceWith({ orderId: "order-123" });
  });

  it("rejects an incorrect webhook token before querying the provider", async () => {
    const { env, queueSend } = createEnv();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await worker.fetch(notification("wrong"), env as never);

    expect(response.status).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(queueSend).not.toHaveBeenCalled();
  });

  it.each([
    ["different amount", { amount: 100 }],
    ["unpaid order", { status: "pending" }],
    ["card payment", { charges: [{ ...paidPixOrder.charges[0], payment_method: "credit_card" }] }],
    ["different local code", { code: "someone-else" }],
  ])("does not deliver a %s", async (_case, changed) => {
    const { env, queueSend } = createEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ...paidPixOrder, ...changed }), { status: 200 }),
    );

    const response = await worker.fetch(notification(), env as never);

    expect(response.status).toBe(200);
    expect(queueSend).not.toHaveBeenCalled();
  });

  it("does not deliver a paid order twice when a webhook is replayed", async () => {
    const { env, queueSend } = createEnv({ status: "paid", pagarme_order_id: "or_123" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(paidPixOrder), { status: 200 }),
    );

    const response = await worker.fetch(notification(), env as never);

    expect(response.status).toBe(200);
    expect(queueSend).not.toHaveBeenCalled();
  });

  it("recovers a paid Pix through the provider order list when the webhook was lost", async () => {
    const { env, queueSend } = createEnv({}, ["order-123"]);
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: [{ id: "or_123", code: "order-123", status: "paid" }],
        paging: { total: 1 },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(paidPixOrder), { status: 200 }));

    await reconcilePendingPagarmeOrders(env as never);

    expect(fetchSpy.mock.calls[0]?.[0]).toBe("https://sdx-api.pagar.me/core/v5/orders?code=order-123&size=30");
    expect(fetchSpy.mock.calls[1]?.[0]).toBe("https://sdx-api.pagar.me/core/v5/orders/or_123");
    expect(queueSend).toHaveBeenCalledExactlyOnceWith({ orderId: "order-123" });
  });
});
