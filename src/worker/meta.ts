import type { Env } from "./env";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const META_COOKIE_PATTERN = /^fb\.[0-9]+\.[0-9]+\.[A-Za-z0-9._-]+$/;
const META_ORIGIN = "https://votosperfeitos.avancoai.com.br";

export interface MetaTracking {
  eventId: string;
  fbp?: string;
  fbc?: string;
}

export interface MetaEvent {
  eventName: "InitiateCheckout" | "Purchase";
  eventId: string;
  eventTime: number;
  eventSourceUrl: string;
  email: string;
  orderId: string;
  fbp?: string;
  fbc?: string;
  ip?: string;
  userAgent?: string;
  value: number;
  currency: "BRL";
}

function readMetaCookie(value: unknown): string | undefined {
  return typeof value === "string" && value.length <= 255 && META_COOKIE_PATTERN.test(value) ? value : undefined;
}

export function parseMetaTracking(value: unknown): MetaTracking | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (typeof input.eventId !== "string" || !UUID_PATTERN.test(input.eventId)) return null;

  const fbp = readMetaCookie(input.fbp);
  const fbc = readMetaCookie(input.fbc);
  return { eventId: input.eventId, ...(fbp ? { fbp } : {}), ...(fbc ? { fbc } : {}) };
}

export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizedEventSourceUrl(value: string): string {
  try {
    const url = new URL(value);
    return url.origin === META_ORIGIN ? url.href : `${META_ORIGIN}/`;
  } catch {
    return `${META_ORIGIN}/`;
  }
}

async function buildUserData(event: MetaEvent): Promise<Record<string, string>> {
  const userData: Record<string, string> = {
    em: await sha256(event.email),
    external_id: await sha256(event.orderId),
  };
  if (event.fbp) userData.fbp = event.fbp;
  if (event.fbc) userData.fbc = event.fbc;
  if (event.ip && event.ip.length <= 64) userData.client_ip_address = event.ip;
  if (event.userAgent && event.userAgent.length <= 512) userData.client_user_agent = event.userAgent;
  return userData;
}

export async function sendMetaEvent(
  env: Pick<Env, "META_PIXEL_ID" | "META_CAPI_ACCESS_TOKEN" | "META_TEST_EVENT_CODE">,
  event: MetaEvent,
): Promise<boolean> {
  if (!env.META_PIXEL_ID || !env.META_CAPI_ACCESS_TOKEN) return false;

  try {
    const response = await fetch(`https://graph.facebook.com/v24.0/${encodeURIComponent(env.META_PIXEL_ID)}/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        data: [{
          event_name: event.eventName,
          event_time: event.eventTime,
          event_id: event.eventId,
          action_source: "website",
          event_source_url: normalizedEventSourceUrl(event.eventSourceUrl),
          user_data: await buildUserData(event),
          custom_data: { value: event.value, currency: event.currency, order_id: await sha256(event.orderId) },
        }],
        ...(env.META_TEST_EVENT_CODE ? { test_event_code: env.META_TEST_EVENT_CODE } : {}),
        access_token: env.META_CAPI_ACCESS_TOKEN,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

interface PendingPurchaseRow {
  id: string;
  email: string;
  tracking_json: string;
  paid_at: string;
}

export async function retryPendingMetaPurchases(env: Env): Promise<number> {
  if (!env.META_PIXEL_ID || !env.META_CAPI_ACCESS_TOKEN) return 0;
  const pending = await env.ORDERS.prepare(
    `SELECT id, email, tracking_json, paid_at
     FROM orders
     WHERE paid_at IS NOT NULL AND meta_purchase_sent_at IS NULL AND status IN ('paid', 'processing', 'sent')
     ORDER BY paid_at ASC
     LIMIT 100`,
  ).all<PendingPurchaseRow>();
  let sent = 0;

  for (const order of pending.results) {
    let tracking: { fbp?: string; fbc?: string } = {};
    try {
      tracking = JSON.parse(order.tracking_json) as { fbp?: string; fbc?: string };
    } catch {
      // Orders created before tracking have no cookies to recover.
    }
    const delivered = await sendMetaEvent(env, {
      eventName: "Purchase",
      eventId: `purchase_${order.id}`,
      eventTime: Math.floor(new Date(order.paid_at).getTime() / 1000),
      eventSourceUrl: `${META_ORIGIN}/`,
      email: order.email,
      orderId: order.id,
      fbp: tracking.fbp,
      fbc: tracking.fbc,
      value: 1,
      currency: "BRL",
    });
    if (delivered) {
      await env.ORDERS.prepare(
        "UPDATE orders SET meta_purchase_sent_at = ? WHERE id = ? AND meta_purchase_sent_at IS NULL",
      ).bind(new Date().toISOString(), order.id).run();
      sent += 1;
    }
  }
  return sent;
}
