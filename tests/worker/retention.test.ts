import { describe, expect, it, vi } from "vitest";
import { cleanupExpiredOrders } from "../../src/worker/retention";

describe("cleanupExpiredOrders", () => {
  it("deletes private PDFs and their order records after 30 days", async () => {
    const deleteFiles = vi.fn(async () => undefined);
    const run = vi.fn(async () => ({ success: true }));
    const env = {
      VOW_FILES: {
        list: vi.fn(async () => ({ objects: [{ key: "orders/order-123/votos-lagrimas-variacao-1.pdf" }], truncated: false })),
        delete: deleteFiles,
      },
      ORDERS: {
        prepare: (sql: string) => {
          const statement = {
            bind: (...values: unknown[]) => { void values; return statement; },
            all: async () => sql.startsWith("SELECT") ? { results: [{ id: "order-123" }] } : { results: [] },
            run,
          };
          return statement;
        },
      },
    };

    await cleanupExpiredOrders(env as never, new Date("2026-09-15T12:00:00.000Z"));

    expect(deleteFiles).toHaveBeenCalledWith("orders/order-123/votos-lagrimas-variacao-1.pdf");
    expect(run).toHaveBeenCalledOnce();
  });
});
