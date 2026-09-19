import type { Env } from "./env";
import { ORDER_AMOUNT_CENTS } from "./orders";
import { sendMetaEvent } from "./meta";

interface MercadoPagoOrder {
  id?: string;
  status?: string;
  status_detail?: string;
  total_amount?: string | number;
  currency?: string;
  currency_id?: string;
  external_reference?: string;
  transactions?: {
    payments?: Array<{
      id?: string | number;
      status?: string;
      status_detail?: string;
      payment_method?: { id?: string; type?: string };
    }>;
  };
}

function readSignaturePart(signature: string, name: string): string | null {
  for (const part of signature.split(",")) {
    const [key, value] = part.trim().split("=", 2);
    if (key === name && value) {
      return value;
    }
  }

  return null;
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, "0")).join("");
}

function equalHex(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}

export async function verifyMercadoPagoSignature(request: Request, secret: string): Promise<boolean> {
  const dataId = new URL(request.url).searchParams.get("data.id");
  const requestId = request.headers.get("x-request-id");
  const signature = request.headers.get("x-signature");

  if (!dataId || !requestId || !signature) {
    return false;
  }

  const timestamp = readSignaturePart(signature, "ts");
  const receivedHash = readSignaturePart(signature, "v1");
  if (!timestamp || !receivedHash) {
    return false;
  }

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expectedHash = toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest)));

  return equalHex(expectedHash, receivedHash);
}

async function getOrder(env: Env, providerOrderId: string): Promise<MercadoPagoOrder> {
  const response = await fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(providerOrderId)}`, {
    headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` },
  });

  if (!response.ok) {
    throw new Error("Não foi possível confirmar o pagamento");
  }

  return (await response.json()) as MercadoPagoOrder;
}

function isAccreditedPixOrder(providerOrder: MercadoPagoOrder, providerOrderId: string): boolean {
  const amountCents = Math.round(Number(providerOrder.total_amount ?? 0) * 100);
  const payment = providerOrder.transactions?.payments?.[0];

  return Boolean(
    providerOrder.external_reference &&
      providerOrder.id === providerOrderId &&
      providerOrder.status === "processed" &&
      providerOrder.status_detail === "accredited" &&
      (providerOrder.currency ?? providerOrder.currency_id) === "BRL" &&
      amountCents === ORDER_AMOUNT_CENTS &&
      payment?.status === "processed" &&
      payment.status_detail === "accredited" &&
      payment.payment_method?.id === "pix",
  );
}

async function processAccreditedPixOrder(
  env: Env,
  providerOrder: MercadoPagoOrder,
  providerOrderId: string,
): Promise<boolean> {
  const orderId = providerOrder.external_reference as string;
  const payment = providerOrder.transactions?.payments?.[0];

  const order = await env.ORDERS.prepare(
    "SELECT id, email, tracking_json, amount_cents, status, mercado_pago_order_id FROM orders WHERE id = ?",
  )
    .bind(orderId)
    .first<{
      id: string;
      email: string;
      tracking_json: string;
      amount_cents: number;
      status: string;
      mercado_pago_order_id: string | null;
    }>();

  if (
    !order ||
    order.amount_cents !== ORDER_AMOUNT_CENTS ||
    order.mercado_pago_order_id !== providerOrderId ||
    order.status !== "pending"
  ) {
    return false;
  }

  const paidAt = new Date().toISOString();
  const update = await env.ORDERS.prepare(
    `UPDATE orders
     SET status = 'paid', mercado_pago_payment_id = ?, paid_at = ?, updated_at = ?
     WHERE id = ? AND status = 'pending' AND mercado_pago_order_id = ? AND mercado_pago_payment_id IS NULL`,
  )
    .bind(String(payment?.id ?? providerOrderId), paidAt, paidAt, orderId, providerOrderId)
    .run();

  if (update.meta.changes !== 1) {
    return false;
  }

  await env.VOW_JOBS.send({ orderId });

  let tracking: { fbp?: string; fbc?: string } = {};
  try {
    tracking = JSON.parse(order.tracking_json) as { fbp?: string; fbc?: string };
  } catch {
    // Historic orders do not contain tracking data.
  }

  const metaSent = await sendMetaEvent(env, {
    eventName: "Purchase",
    eventId: `purchase_${orderId}`,
    eventTime: Math.floor(new Date(paidAt).getTime() / 1000),
    eventSourceUrl: "https://votosperfeitos.avancoai.com.br/",
    email: order.email,
    orderId,
    fbp: tracking.fbp,
    fbc: tracking.fbc,
    value: ORDER_AMOUNT_CENTS / 100,
    currency: "BRL",
  });

  if (metaSent) {
    await env.ORDERS.prepare(
      "UPDATE orders SET meta_purchase_sent_at = ? WHERE id = ? AND meta_purchase_sent_at IS NULL",
    )
      .bind(new Date().toISOString(), orderId)
      .run();
  }

  return true;
}

export async function reconcilePendingPixOrders(env: Env): Promise<void> {
  const pending = await env.ORDERS.prepare(
    `SELECT mercado_pago_order_id
     FROM orders
     WHERE status = 'pending' AND mercado_pago_order_id IS NOT NULL
     ORDER BY created_at ASC
     LIMIT 50`,
  ).all<{ mercado_pago_order_id: string }>();

  for (const order of pending.results) {
    try {
      const providerOrder = await getOrder(env, order.mercado_pago_order_id);
      if (isAccreditedPixOrder(providerOrder, order.mercado_pago_order_id)) {
        await processAccreditedPixOrder(env, providerOrder, order.mercado_pago_order_id);
      }
    } catch {
      // A later scheduled run retries transient provider and database failures.
    }
  }
}

async function processMercadoPagoWebhook(dataId: string, env: Env): Promise<void> {
  const providerOrder = await getOrder(env, dataId);
  if (isAccreditedPixOrder(providerOrder, dataId)) {
    await processAccreditedPixOrder(env, providerOrder, dataId);
  }
}

export async function handleMercadoPagoWebhook(
  request: Request,
  env: Env,
  context?: Pick<ExecutionContext, "waitUntil">,
): Promise<Response> {
  const dataId = new URL(request.url).searchParams.get("data.id");
  if (!(await verifyMercadoPagoSignature(request, env.MP_WEBHOOK_SECRET)) || !dataId) {
    return new Response(null, { status: 401 });
  }

  if (context) {
    context.waitUntil(processMercadoPagoWebhook(dataId, env));
    return new Response(null, { status: 200 });
  }

  try {
    await processMercadoPagoWebhook(dataId, env);
    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 500 });
  }
}
