import type { Env } from "./env";

export interface PagarmePaymentLink {
  linkId: string;
  url: string;
}

export interface PagarmeOrderSummary {
  id: string;
  code: string;
  status: string;
}

export interface PagarmeOrder extends PagarmeOrderSummary {
  amount: number;
  currency: string;
  payment_link_id?: string;
  charges: Array<{
    id: string;
    status: string;
    amount: number;
    payment_method?: string;
    paid_amount?: number;
    currency?: string;
    last_transaction?: { status?: string };
  }>;
}

const INVALID_RESPONSE = "O provedor de pagamento retornou uma resposta inválida";
const ALLOWED_BASE_URLS = new Set([
  "https://api.pagar.me/core/v5",
  "https://sdx-api.pagar.me/core/v5",
]);
const ALLOWED_CHECKOUT_HOSTS = {
  "https://api.pagar.me/core/v5": new Set([
    "payment-link.pagar.me",
    "payment-link-v3.pagar.me",
    "checkout.pagar.me",
  ]),
  "https://sdx-api.pagar.me/core/v5": new Set([
    "payment-link.pagar.me",
    "payment-link-v3-sdx.pagar.me",
    "checkout.pagar.me",
  ]),
};

function baseUrl(env: Env): string {
  const base = env.PAGARME_BASE_URL?.replace(/\/$/, "");
  if (!base || !ALLOWED_BASE_URLS.has(base) || !env.PAGARME_SECRET_KEY) {
    throw new Error("Configuração de pagamento inválida");
  }
  return base;
}

function headers(env: Env): Record<string, string> {
  return {
    Authorization: `Basic ${btoa(`${env.PAGARME_SECRET_KEY}:`)}`,
    Accept: "application/json",
    "User-Agent": "VotosPerfeitos/1.0",
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error(INVALID_RESPONSE);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function checkoutUrl(value: unknown, base: string): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && ALLOWED_CHECKOUT_HOSTS[base as keyof typeof ALLOWED_CHECKOUT_HOSTS].has(url.hostname)
      && !url.username
      && !url.password
      && !url.port;
  } catch {
    return false;
  }
}

function parseOrder(value: unknown): PagarmeOrder {
  if (!isRecord(value)
    || typeof value.id !== "string"
    || typeof value.code !== "string"
    || typeof value.status !== "string"
    || !Number.isSafeInteger(value.amount)
    || typeof value.currency !== "string"
    || !Array.isArray(value.charges)
    || !value.charges.every((charge: unknown) => isRecord(charge)
      && typeof charge.id === "string"
      && typeof charge.status === "string"
      && Number.isSafeInteger(charge.amount))) {
    throw new Error(INVALID_RESPONSE);
  }
  return value as unknown as PagarmeOrder;
}

function parseOrderSummary(value: unknown): PagarmeOrderSummary {
  if (!isRecord(value)
    || typeof value.id !== "string"
    || typeof value.code !== "string"
    || typeof value.status !== "string") {
    throw new Error(INVALID_RESPONSE);
  }
  return value as unknown as PagarmeOrderSummary;
}

export async function createPagarmePaymentLink(
  env: Env,
  input: { orderId: string; amountCents: number },
): Promise<PagarmePaymentLink> {
  const base = baseUrl(env);
  if (!input.orderId || !Number.isSafeInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("Dados de pagamento inválidos");
  }

  const response = await fetch(`${base}/paymentlinks`, {
    method: "POST",
    redirect: "manual",
    headers: {
      ...headers(env),
      "Content-Type": "application/json",
      "Idempotency-key": input.orderId,
    },
    body: JSON.stringify({
      type: "order",
      order_code: input.orderId,
      max_paid_sessions: 1,
      expires_in: 10_080,
      payment_settings: {
        accepted_payment_methods: ["pix"],
        pix_settings: { expires_in: 3_600 },
      },
      cart_settings: {
        items: [{ name: "Votos Perfeitos", amount: input.amountCents, default_quantity: 1 }],
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível iniciar o pagamento agora");
  }

  const link = await readJson(response);
  if (!isRecord(link) || typeof link.id !== "string" || !link.id || !checkoutUrl(link.url, base)) {
    throw new Error(INVALID_RESPONSE);
  }
  return { linkId: link.id, url: link.url };
}

export async function getPagarmeOrder(env: Env, providerOrderId: string): Promise<PagarmeOrder> {
  const base = baseUrl(env);
  if (!providerOrderId) throw new Error("Identificador de pedido inválido");
  const response = await fetch(`${base}/orders/${encodeURIComponent(providerOrderId)}`, {
    method: "GET",
    redirect: "manual",
    headers: headers(env),
  });
  if (!response.ok) throw new Error("Não foi possível consultar o pagamento agora");
  return parseOrder(await readJson(response));
}

export async function listPagarmeOrdersByCode(env: Env, code: string): Promise<PagarmeOrderSummary[]> {
  const base = baseUrl(env);
  if (!code) throw new Error("Identificador de pedido inválido");
  const orders: PagarmeOrderSummary[] = [];
  const size = 30;

  for (let page = 1; page <= 100; page += 1) {
    const query = new URLSearchParams({ code, size: String(size) });
    if (page > 1) query.set("page", String(page));
    const response = await fetch(`${base}/orders?${query}`, {
      method: "GET",
      redirect: "manual",
      headers: headers(env),
    });
    if (!response.ok) throw new Error("Não foi possível consultar o pagamento agora");
    const result = await readJson(response);
    if (!isRecord(result) || !Array.isArray(result.data)) throw new Error(INVALID_RESPONSE);
    const pageOrders = result.data.map(parseOrderSummary);
    orders.push(...pageOrders);

    const total = isRecord(result.paging) ? result.paging.total : undefined;
    if (pageOrders.length < size || (typeof total === "number" && orders.length >= total)) {
      return orders;
    }
  }

  throw new Error(INVALID_RESPONSE);
}
