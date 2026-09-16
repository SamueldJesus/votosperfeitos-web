import { afterEach, describe, expect, it, vi } from "vitest";
import { parseMetaTracking, sendMetaEvent } from "../../src/worker/meta";

const env = {
  META_PIXEL_ID: "pixel-123",
  META_CAPI_ACCESS_TOKEN: "capi-token",
};

const event = {
  eventName: "InitiateCheckout" as const,
  eventId: "b9a01abe-343f-41f4-b0e7-112233445566",
  eventTime: 1_700_000_000,
  eventSourceUrl: "https://votosperfeitos.avancoai.com.br/",
  email: "Ana@Example.com ",
  orderId: "b9a01abe-343f-41f4-b0e7-112233445566",
  fbp: "fb.1.1700000000.123456",
  fbc: "fb.1.1700000000.ClickId",
  ip: "198.51.100.5",
  userAgent: "test-agent",
  value: 47,
  currency: "BRL" as const,
};

afterEach(() => vi.restoreAllMocks());

describe("Meta CAPI events", () => {
  it("accepts a valid client tracking context and discards malformed values", () => {
    expect(parseMetaTracking({
      eventId: "b9a01abe-343f-41f4-b0e7-112233445566",
      fbp: "fb.1.1700000000.123456",
      fbc: "fb.1.1700000000.ClickId",
    })).toEqual({
      eventId: "b9a01abe-343f-41f4-b0e7-112233445566",
      fbp: "fb.1.1700000000.123456",
      fbc: "fb.1.1700000000.ClickId",
    });
    expect(parseMetaTracking({ eventId: "<script>" })).toBeNull();
  });

  it("sends hashed matching data and treats an unavailable endpoint as non-fatal", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("unavailable", { status: 503 }));

    await expect(sendMetaEvent(env, event)).resolves.toBe(false);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://graph.facebook.com/v24.0/pixel-123/events",
      expect.objectContaining({ method: "POST" }),
    );
    const [, request] = fetchSpy.mock.calls[0] ?? [];
    const payload = JSON.parse(String((request as RequestInit).body));
    expect(payload.access_token).toBe("capi-token");
    expect(payload.data[0].user_data.em).not.toContain("Ana");
    expect(payload.data[0].custom_data).toMatchObject({ value: 47, currency: "BRL" });
  });
});

describe("Meta Purchase recovery", () => {
  it("retries an unsent paid purchase without affecting fulfillment", async () => {
    const statements: { sql: string; values: unknown[] }[] = [];
    const retryEnv = {
      ...env,
      ORDERS: {
        prepare(sql: string) {
          const statement = {
            sql,
            values: [] as unknown[],
            bind(...values: unknown[]) { statement.values = values; return statement; },
            all: async () => ({ results: [{ id: "order-123", email: "ana@example.com", tracking_json: "{}", paid_at: "2026-09-16T10:00:00.000Z" }] }),
            run: async () => ({ success: true, meta: { changes: 1 } }),
          };
          statements.push(statement);
          return statement;
        },
      },
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ events_received: 1 }), { status: 200 }));
    const { retryPendingMetaPurchases } = await import("../../src/worker/meta");

    await expect(retryPendingMetaPurchases(retryEnv as never)).resolves.toBe(1);

    expect(statements.some((statement) => statement.sql.includes("meta_purchase_sent_at"))).toBe(true);
  });
});
