import type { Env } from "./env";

async function deleteOrderFiles(orderId: string, env: Env): Promise<void> {
  let cursor: string | undefined;

  do {
    const page = await env.VOW_FILES.list({ prefix: `orders/${orderId}/`, cursor });
    await Promise.all(page.objects.map((object) => env.VOW_FILES.delete(object.key)));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
}

export async function cleanupExpiredOrders(env: Env, now = new Date()): Promise<void> {
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const expired = await env.ORDERS.prepare(
    "SELECT id FROM orders WHERE created_at < ? ORDER BY created_at ASC LIMIT 100",
  )
    .bind(cutoff)
    .all<{ id: string }>();

  for (const order of expired.results) {
    await deleteOrderFiles(order.id, env);
    await env.ORDERS.prepare("DELETE FROM orders WHERE id = ?").bind(order.id).run();
  }
}
