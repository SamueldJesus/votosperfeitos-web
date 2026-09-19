import type { Env } from "./env";
import { errorResponse, json } from "./http";
import { createCheckout, parseCheckoutInput } from "./orders";
import { handleVowMessage } from "./queue";
import { cleanupExpiredOrders } from "./retention";
import { handleMercadoPagoWebhook, reconcilePendingPixOrders } from "./webhook";
import { retryPendingMetaPurchases } from "./meta";

async function handleCheckout(request: Request, env: Env): Promise<Response> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 40_000) {
    return json({ error: "Dados do pedido são muito grandes" }, 413);
  }

  let input;
  try {
    input = parseCheckoutInput(await request.json());
  } catch (error) {
    return errorResponse(error);
  }

  try {
    const result = await createCheckout(env, input, {
      sourceUrl: request.headers.get("origin") ?? new URL(request.url).origin,
      ip: request.headers.get("cf-connecting-ip") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    return json({
      orderId: result.orderId,
      payment: {
        orderId: result.payment.orderId,
        qrCode: result.payment.qrCode,
        qrCodeBase64: result.payment.qrCodeBase64,
        ticketUrl: result.payment.ticketUrl,
      },
    }, 201);
  } catch {
    return json({ error: "Não foi possível iniciar o pagamento agora" }, 502);
  }
}

export default {
  async fetch(request: Request, env: Env, context?: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/checkout") {
      if (request.method !== "POST") {
        return json({ error: "Método não permitido" }, 405);
      }

      return handleCheckout(request, env);
    }

    if (url.pathname === "/api/webhooks/mercado-pago") {
      if (request.method !== "POST") {
        return json({ error: "Método não permitido" }, 405);
      }

      return handleMercadoPagoWebhook(request, env, context);
    }

    if (url.pathname === "/api/meta/config") {
      if (request.method !== "GET") return json({ error: "Método não permitido" }, 405);
      return new Response(JSON.stringify({ pixelId: env.META_PIXEL_ID || null }), {
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300" },
      });
    }

    return env.ASSETS.fetch(request);
  },
  async queue(batch, env): Promise<void> {
    await Promise.all(batch.messages.map((message) => handleVowMessage(message, env)));
  },
  async scheduled(_event, env): Promise<void> {
    await Promise.all([cleanupExpiredOrders(env), retryPendingMetaPurchases(env), reconcilePendingPixOrders(env)]);
  },
} satisfies ExportedHandler<Env>;
