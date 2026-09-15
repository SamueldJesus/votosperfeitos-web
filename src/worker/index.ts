import type { Env } from "./env";
import { errorResponse, json } from "./http";
import { createCheckout, parseCheckoutInput } from "./orders";
import { handleVowMessage } from "./queue";
import { cleanupExpiredOrders } from "./retention";
import { handleMercadoPagoWebhook } from "./webhook";

async function handleCheckout(request: Request, env: Env): Promise<Response> {
  let input;
  try {
    input = parseCheckoutInput(await request.json());
  } catch (error) {
    return errorResponse(error);
  }

  try {
    const result = await createCheckout(env, input);
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
  async fetch(request, env): Promise<Response> {
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

      return handleMercadoPagoWebhook(request, env);
    }

    return env.ASSETS.fetch(request);
  },
  async queue(batch, env): Promise<void> {
    await Promise.all(batch.messages.map((message) => handleVowMessage(message, env)));
  },
  async scheduled(_event, env): Promise<void> {
    await cleanupExpiredOrders(env);
  },
} satisfies ExportedHandler<Env>;
