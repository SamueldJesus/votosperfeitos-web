import type { Env } from "./env";
import { createPixOrder, type MercadoPagoPixPayment } from "./mercado-pago";
import { TONES, type CheckoutInput, type Tone } from "./types";
import { parseMetaTracking, sendMetaEvent } from "./meta";

export const ORDER_AMOUNT_CENTS = 4700;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const MAX_NARRATIVE_LENGTH = 4000;

const requiredFields = {
  who: "Para quem são os votos",
  speakerName: "Seu nome",
  partnerName: "Nome da pessoa amada",
  howMet: "Como vocês se conheceram",
  insideJoke: "Uma lembrança só de vocês",
  certainMoment: "Um momento que confirmou esse amor",
  admiration: "O que você mais admira nessa pessoa",
  deepPromise: "Uma promessa que vem do coração",
} as const;

function readText(value: Record<string, unknown>, field: keyof typeof requiredFields): string {
  const raw = value[field];
  const text = typeof raw === "string" ? raw.trim() : "";

  if (!text) {
    throw new Error(`${requiredFields[field]} é obrigatório`);
  }

  if (text.length > MAX_NARRATIVE_LENGTH) {
    throw new Error(`${requiredFields[field]} pode ter no máximo ${MAX_NARRATIVE_LENGTH} caracteres`);
  }

  return text;
}

function readTone(value: unknown): Tone {
  if (typeof value !== "string" || !TONES.includes(value as Tone)) {
    throw new Error("Tom inválido");
  }

  return value as Tone;
}

export function parseCheckoutInput(value: unknown): CheckoutInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Dados do pedido inválidos");
  }

  const input = value as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("E-mail inválido");
  }

  const tracking = parseMetaTracking(input.tracking);
  return {
    email,
    who: readText(input, "who"),
    speakerName: readText(input, "speakerName"),
    partnerName: readText(input, "partnerName"),
    howMet: readText(input, "howMet"),
    insideJoke: readText(input, "insideJoke"),
    certainMoment: readText(input, "certainMoment"),
    admiration: readText(input, "admiration"),
    deepPromise: readText(input, "deepPromise"),
    tone: readTone(input.tone),
    ...(tracking ? { tracking } : {}),
  };
}

export function createOrderId(): string {
  return crypto.randomUUID();
}

export async function createCheckout(
  env: Env,
  input: CheckoutInput,
  requestContext: { sourceUrl: string; ip?: string; userAgent?: string },
): Promise<{ orderId: string; payment: MercadoPagoPixPayment }> {
  const orderId = createOrderId();
  const now = new Date().toISOString();

  await env.ORDERS.prepare(
    `INSERT INTO orders (
      id, email, answers_json, tracking_json, tone, amount_cents, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      orderId,
      input.email,
      JSON.stringify({ ...input, tracking: undefined }),
      JSON.stringify(input.tracking ? { fbp: input.tracking.fbp, fbc: input.tracking.fbc } : {}),
      input.tone,
      ORDER_AMOUNT_CENTS,
      "pending",
      now,
      now,
    )
    .run();

  const payment = await createPixOrder(env, {
    orderId,
    email: input.email,
    amountCents: ORDER_AMOUNT_CENTS,
  });

  await env.ORDERS.prepare(
    "UPDATE orders SET mercado_pago_order_id = ?, updated_at = ? WHERE id = ?",
  )
    .bind(payment.orderId, new Date().toISOString(), orderId)
    .run();

  if (input.tracking) {
    await sendMetaEvent(env, {
      eventName: "InitiateCheckout",
      eventId: input.tracking.eventId,
      eventTime: Math.floor(Date.now() / 1000),
      eventSourceUrl: requestContext.sourceUrl,
      email: input.email,
      orderId,
      fbp: input.tracking.fbp,
      fbc: input.tracking.fbc,
      ip: requestContext.ip,
      userAgent: requestContext.userAgent,
      value: ORDER_AMOUNT_CENTS / 100,
      currency: "BRL",
    });
  }

  return { orderId, payment };
}
