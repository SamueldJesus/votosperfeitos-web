import type { Env } from "./env";
import { sendVowEmail, type PdfFile } from "./delivery";
import { generateVows } from "./generation";
import { parseCheckoutInput } from "./orders";
import { makePdfFilename, renderVowPdf } from "./pdf";
import type { StoredOrder, Tone } from "./types";

interface StoredOrderRow {
  id: string;
  email: string;
  answers_json: string;
  tone: Tone;
  delivery_attempts: number;
}

async function claimPaidOrder(orderId: string, env: Env): Promise<StoredOrder | null> {
  const recoveryCutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const claim = await env.ORDERS.prepare(
    `UPDATE orders
     SET status = 'processing', updated_at = ?
     WHERE id = ? AND (status = 'paid' OR (status = 'processing' AND updated_at < ?))`,
  )
    .bind(new Date().toISOString(), orderId, recoveryCutoff)
    .run();

  if (claim.meta.changes !== 1) {
    return null;
  }

  const row = await env.ORDERS.prepare(
    "SELECT id, email, answers_json, tone, delivery_attempts FROM orders WHERE id = ? AND status = 'processing'",
  )
    .bind(orderId)
    .first<StoredOrderRow>();

  if (!row) {
    throw new Error("Pedido não encontrado após processamento");
  }

  return {
    id: row.id,
    email: row.email,
    tone: row.tone,
    answers: parseCheckoutInput(JSON.parse(row.answers_json)),
  };
}

async function storeFiles(env: Env, order: StoredOrder, files: PdfFile[]): Promise<void> {
  await Promise.all(
    files.map((file) =>
      env.VOW_FILES.put(`orders/${order.id}/${file.filename}`, file.bytes, {
        httpMetadata: { contentType: "application/pdf" },
      }),
    ),
  );
}

export async function processVowJob(message: { orderId: string }, env: Env): Promise<void> {
  const order = await claimPaidOrder(message.orderId, env);
  if (!order) {
    return;
  }

  const vows = await generateVows(env, order);
  const files = await Promise.all(
    vows.map(async (vow) => ({
      filename: makePdfFilename(order.tone, vow.id),
      bytes: await renderVowPdf(vow, order),
    })),
  );

  await storeFiles(env, order, files);
  const resendMessageId = await sendVowEmail(env, order, files);

  await env.ORDERS.prepare(
    "UPDATE orders SET status = 'sent', resend_message_id = ?, sent_at = ?, updated_at = ? WHERE id = ? AND status = 'processing'",
  )
    .bind(resendMessageId, new Date().toISOString(), new Date().toISOString(), order.id)
    .run();
}

async function restoreForRetry(orderId: string, env: Env): Promise<boolean> {
  const order = await env.ORDERS.prepare(
    "SELECT delivery_attempts FROM orders WHERE id = ? AND status = 'processing'",
  )
    .bind(orderId)
    .first<{ delivery_attempts: number }>();

  if (!order) {
    return false;
  }

  const nextStatus = order.delivery_attempts + 1 >= 3 ? "failed" : "paid";
  await env.ORDERS.prepare(
    `UPDATE orders
     SET status = ?, delivery_attempts = delivery_attempts + 1, last_error = ?, updated_at = ?
     WHERE id = ? AND status = 'processing'`,
  )
    .bind(nextStatus, "Não foi possível concluir a entrega automaticamente", new Date().toISOString(), orderId)
    .run();

  return nextStatus === "paid";
}

export async function handleVowMessage(
  message: { body: unknown; retry: () => void },
  env: Env,
): Promise<void> {
  const body = message.body;
  if (!body || typeof body !== "object" || typeof (body as { orderId?: unknown }).orderId !== "string") {
    return;
  }

  const job = body as { orderId: string };

  try {
    await processVowJob(job, env);
  } catch {
    if (await restoreForRetry(job.orderId, env)) {
      message.retry();
    }
  }
}
