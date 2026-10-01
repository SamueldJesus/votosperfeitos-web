import { describe, expect, it, vi } from "vitest";
import worker from "../../src/worker/index";

describe("paid order delivery recovery", () => {
  it("retries a paid order whose Queue publish failed after payment confirmation", async () => {
    const updates: string[] = [];
    let failPublish = true;
    const send = vi.fn(async () => {
      if (failPublish) throw new Error("queue unavailable");
    });
    const env = {
      ORDERS: {
        prepare(sql: string) {
          return {
            bind() { return this; },
            all: async () => ({ results: sql.includes("status = 'paid'") ? [{ id: "order-123" }] : [] }),
            run: async () => {
              updates.push(sql);
              return { success: true, meta: { changes: 1 } };
            },
          };
        },
      },
      VOW_JOBS: { send },
      META_PIXEL_ID: "",
      META_CAPI_ACCESS_TOKEN: "",
    };

    await worker.scheduled({} as never, env as never);
    expect(send).toHaveBeenCalledOnce();
    expect(updates).toHaveLength(0);

    failPublish = false;
    await worker.scheduled({} as never, env as never);
    expect(send).toHaveBeenCalledTimes(2);
    expect(updates.some((sql) => sql.includes("updated_at"))).toBe(true);
  });
});
