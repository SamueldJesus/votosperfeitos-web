import { afterEach, describe, expect, it, vi } from "vitest";
import type { Env } from "../../src/worker/env";
import {
  createPagarmePaymentLink,
  getPagarmeOrder,
  listPagarmeOrdersByCode,
} from "../../src/worker/pagarme";

const env = {
  PAGARME_SECRET_KEY: "sk_test_example",
  PAGARME_BASE_URL: "https://sdx-api.pagar.me/core/v5",
} as Env;

const paidOrder = {
  id: "or_123",
  code: "local-order-123",
  status: "paid",
  amount: 4700,
  currency: "BRL",
  charges: [{ id: "ch_123", status: "paid", amount: 4700, payment_method: "pix" }],
};

afterEach(() => vi.restoreAllMocks());

describe("Pagar.me checkout", () => {
  it("creates a one-payment Pix link using the configured sandbox and returns its hosted URL", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        id: "pl_123",
        url: "https://payment-link.pagar.me/pl_123",
        status: "active",
      }), { status: 200 }),
    );

    await expect(createPagarmePaymentLink(env, { orderId: "local-order-123", amountCents: 4700 }))
      .resolves.toEqual({ linkId: "pl_123", url: "https://payment-link.pagar.me/pl_123" });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://sdx-api.pagar.me/core/v5/paymentlinks");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toMatchObject({
      Authorization: "Basic c2tfdGVzdF9leGFtcGxlOg==",
      "Content-Type": "application/json",
      "Idempotency-key": "local-order-123",
      "User-Agent": "VotosPerfeitos/1.0",
    });
    expect(JSON.parse(String(options?.body))).toEqual({
      type: "order",
      order_code: "local-order-123",
      max_paid_sessions: 1,
      expires_in: 10_080,
      payment_settings: { accepted_payment_methods: ["pix"], pix_settings: {} },
      cart_settings: {
        items: [{ name: "Votos Perfeitos", amount: 4700, default_quantity: 1 }],
      },
    });
  });

  it.each([
    "http://payment-link.pagar.me/pl_123",
    "https://payment-link.pagar.me.evil.test/pl_123",
    "https://evil.test/pl_123",
  ])("rejects an unsafe checkout URL: %s", async (url) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "pl_123", url }), { status: 200 }),
    );

    await expect(createPagarmePaymentLink(env, { orderId: "local-order-123", amountCents: 4700 }))
      .rejects.toThrow("O provedor de pagamento retornou uma resposta inválida");
  });

  it("hides provider errors from the caller", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("secret diagnostic", { status: 503 }));

    await expect(createPagarmePaymentLink(env, { orderId: "local-order-123", amountCents: 4700 }))
      .rejects.toThrow("Não foi possível iniciar o pagamento agora");
  });

  it("accepts the alternate official checkout host", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "pl_123", url: "https://checkout.pagar.me/pl_123" }), { status: 200 }),
    );

    await expect(createPagarmePaymentLink(env, { orderId: "local-order-123", amountCents: 4700 }))
      .resolves.toEqual({ linkId: "pl_123", url: "https://checkout.pagar.me/pl_123" });
  });

  it("does not send the secret key to an unapproved API host", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(createPagarmePaymentLink(
      { ...env, PAGARME_BASE_URL: "https://api.pagar.me.evil.test/core/v5" },
      { orderId: "local-order-123", amountCents: 4700 },
    )).rejects.toThrow("Configuração de pagamento inválida");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("Pagar.me orders", () => {
  it("gets an order by provider ID using Basic Auth", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(paidOrder), { status: 200 }),
    );

    await expect(getPagarmeOrder(env, "or_123"))
      .resolves.toEqual(paidOrder);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://sdx-api.pagar.me/core/v5/orders/or_123",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Basic c2tfdGVzdF9leGFtcGxlOg==" }),
      }),
    );
  });

  it("filters the paginated order list by the merchant code", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [paidOrder], paging: { total: 1 } }), { status: 200 }),
    );

    await expect(listPagarmeOrdersByCode(env, "local id&x"))
      .resolves.toEqual([paidOrder]);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://sdx-api.pagar.me/core/v5/orders?code=local+id%26x&size=30");
    expect(options?.method).toBe("GET");
  });

  it("accepts a list summary without charges and lets the caller fetch the full order", async () => {
    const summary = { id: "or_123", code: "local-order-123", status: "paid" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [summary], paging: { total: 1 } }), { status: 200 }),
    );

    await expect(listPagarmeOrdersByCode(env, "local-order-123"))
      .resolves.toEqual([summary]);
  });

  it("includes later order pages when the code has more than 30 checkout attempts", async () => {
    const firstPage = Array.from({ length: 30 }, (_, index) => ({
      ...paidOrder,
      id: `or_pending_${index}`,
      status: "pending",
    }));
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: firstPage, paging: { total: 31 } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [paidOrder], paging: { total: 31 } }), { status: 200 }));

    const result = await listPagarmeOrdersByCode(env, "local-order-123");

    expect(result).toHaveLength(31);
    expect(result.at(-1)).toEqual(paidOrder);
    expect(fetchSpy.mock.calls[1]?.[0]).toBe(
      "https://sdx-api.pagar.me/core/v5/orders?code=local-order-123&size=30&page=2",
    );
  });

  it("rejects a malformed order list rather than treating it as no orders", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ orders: [paidOrder] }), { status: 200 }),
    );

    await expect(listPagarmeOrdersByCode(env, "local-order-123"))
      .rejects.toThrow("O provedor de pagamento retornou uma resposta inválida");
  });
});
