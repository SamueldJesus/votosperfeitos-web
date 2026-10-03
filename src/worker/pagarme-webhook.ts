import type { Env } from "./env";
import { sendMetaEvent } from "./meta";
import { getPagarmeOrder, listPagarmeOrdersByCode, type PagarmeOrder } from "./pagarme";

interface PendingPagarmeOrder {
  id: string;
  email: string;
  tracking_json: string;
  amount_cents: number;
  status: string;
  pagarme_link_id: string | null;
  pagarme_order_id: string | null;
}

function equalToken(received: string | null, expected: string): boolean {
  if (!received || !expected || received.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= received.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

function isPagarmeOrderId(value: unknown): value is string {
  return typeof value === "string" && /^or_[A-Za-z0-9]+$/.test(value);
}

function paidPixCharge(order: PagarmeOrder, local: PendingPagarmeOrder): { id: string } | null {
  if (
    !local.pagarme_link_id ||
    local.status !== "pending" ||
    local.amount_cents <= 0 ||
    order.code !== local.id ||
    order.status !== "paid" ||
    order.currency !== "BRL" ||
    order.amount !== local.amount_cents
  ) return null;

  const sourceLinkId = (order as PagarmeOrder & { payment_link_id?: string }).payment_link_id;
  if (sourceLinkId && sourceLinkId !== local.pagarme_link_id) return null;

  const charge = order.charges?.find((candidate) =>
    typeof candidate.id === "string" &&
    candidate.status === "paid" &&
    candidate.payment_method?.toLowerCase() === "pix" &&
    candidate.amount === local.amount_cents &&
    (candidate.paid_amount === undefined || candidate.paid_amount === local.amount_cents) &&
    (candidate.currency === undefined || candidate.currency === "BRL") &&
    (candidate.last_transaction?.status === undefined || candidate.last_transaction.status === "paid"),
  );

  return charge?.id ? { id: charge.id } : null;
}

async function localPendingOrder(env: Env, orderId: string): Promise<PendingPagarmeOrder | null> {
  return env.ORDERS.prepare(
    `SELECT id, email, tracking_json, amount_cents, status, pagarme_link_id, pagarme_order_id
     FROM orders WHERE id = ?`,
  ).bind(orderId).first<PendingPagarmeOrder>();
}

async function confirmPagarmeOrder(env: Env, orderId: string, providerOrderId: string): Promise<boolean> {
  const local = await localPendingOrder(env, orderId);
  if (!local || local.status !== "pending" || !local.pagarme_link_id ||
    (local.pagarme_order_id && local.pagarme_order_id !== providerOrderId)) return false;

  const providerOrder = await getPagarmeOrder(env, providerOrderId);
  if (providerOrder.id !== providerOrderId) return false;
  const charge = paidPixCharge(providerOrder, local);
  if (!charge) return false;

  const paidAt = new Date().toISOString();
  const update = await env.ORDERS.prepare(
    `UPDATE orders
     SET status = 'paid', pagarme_order_id = ?, pagarme_charge_id = ?, paid_at = ?, updated_at = ?
     WHERE id = ? AND status = 'pending' AND pagarme_link_id = ?
       AND (pagarme_order_id IS NULL OR pagarme_order_id = ?) AND pagarme_charge_id IS NULL`,
  ).bind(providerOrderId, charge.id, paidAt, paidAt, local.id, local.pagarme_link_id, providerOrderId).run();
  if (update.meta.changes !== 1) return false;

  await env.VOW_JOBS.send({ orderId: local.id });

  let tracking: { fbp?: string; fbc?: string } = {};
  try {
    tracking = JSON.parse(local.tracking_json) as { fbp?: string; fbc?: string };
  } catch {
    // Older orders have no saved tracking cookies.
  }

  const metaSent = await sendMetaEvent(env, {
    eventName: "Purchase",
    eventId: `purchase_${local.id}`,
    eventTime: Math.floor(new Date(paidAt).getTime() / 1000),
    eventSourceUrl: "https://votosperfeitos.avancoai.com.br/",
    email: local.email,
    orderId: local.id,
    fbp: tracking.fbp,
    fbc: tracking.fbc,
    value: local.amount_cents / 100,
    currency: "BRL",
  });
  if (metaSent) {
    await env.ORDERS.prepare(
      "UPDATE orders SET meta_purchase_sent_at = ? WHERE id = ? AND meta_purchase_sent_at IS NULL",
    ).bind(new Date().toISOString(), local.id).run();
  }

  return true;
}

export async function handlePagarmeWebhook(
  request: Request,
  env: Env,
): Promise<Response> {
  if (!env.PAGARME_WEBHOOK_TOKEN) return new Response(null, { status: 503 });
  if (!equalToken(new URL(request.url).searchParams.get("token"), env.PAGARME_WEBHOOK_TOKEN)) {
    return new Response(null, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 32_000) return new Response(null, { status: 413 });

  let event: unknown;
  try {
    const body = await request.text();
    if (body.length > 32_000) return new Response(null, { status: 413 });
    event = JSON.parse(body);
  } catch {
    return new Response(null, { status: 400 });
  }

  if (!event || typeof event !== "object" || Array.isArray(event)) return new Response(null, { status: 400 });
  const notification = event as { type?: unknown; data?: { id?: unknown; code?: unknown } };
  if (notification.type !== "order.paid") return new Response(null, { status: 200 });
  const providerOrderId = notification.data?.id;
  const orderId = notification.data?.code;
  if (!isPagarmeOrderId(providerOrderId) || typeof orderId !== "string" || orderId.length > 52) {
    return new Response(null, { status: 400 });
  }

  try {
    await confirmPagarmeOrder(env, orderId, providerOrderId);
    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 500 });
  }
}

export async function reconcilePendingPagarmeOrders(env: Env): Promise<void> {
  const pending = await env.ORDERS.prepare(
    `SELECT id FROM orders
     WHERE status = 'pending' AND pagarme_link_id IS NOT NULL
     ORDER BY updated_at ASC LIMIT 30`,
  ).all<{ id: string }>();

  for (const local of pending.results) {
    try {
      const matches = await listPagarmeOrdersByCode(env, local.id);
      for (const match of matches) {
        if (match.code === local.id && match.status === "paid" && isPagarmeOrderId(match.id)) {
          if (await confirmPagarmeOrder(env, local.id, match.id)) break;
        }
      }
    } catch {
      // The next scheduled run retries temporary provider and database errors.
    } finally {
      await env.ORDERS.prepare(
        "UPDATE orders SET updated_at = ? WHERE id = ? AND status = 'pending'",
      ).bind(new Date().toISOString(), local.id).run();
    }
  }
}
