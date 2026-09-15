import type { Env } from "./env";

interface OrderResponse {
  id?: string;
  transactions?: {
    payments?: Array<{
      id?: string;
      payment_method?: {
        qr_code?: string;
        qr_code_base64?: string;
        ticket_url?: string;
      };
    }>;
  };
}

export interface MercadoPagoPixPayment {
  orderId: string;
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
}

function formatAmount(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

export async function createPixOrder(
  env: Env,
  input: { orderId: string; email: string; amountCents: number },
): Promise<MercadoPagoPixPayment> {
  const amount = formatAmount(input.amountCents);
  const response = await fetch("https://api.mercadopago.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": input.orderId,
    },
    body: JSON.stringify({
      type: "online",
      total_amount: amount,
      external_reference: input.orderId,
      processing_mode: "automatic",
      payer: { email: input.email },
      transactions: {
        payments: [{ amount, payment_method: { id: "pix", type: "bank_transfer" } }],
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível iniciar o pagamento agora");
  }

  const order = (await response.json()) as OrderResponse;
  const payment = order.transactions?.payments?.[0];
  const method = payment?.payment_method;

  if (!order.id || !payment?.id || !method?.qr_code || !method.qr_code_base64 || !method.ticket_url) {
    throw new Error("O provedor de pagamento retornou uma resposta inválida");
  }

  return {
    orderId: order.id,
    paymentId: payment.id,
    qrCode: method.qr_code,
    qrCodeBase64: method.qr_code_base64,
    ticketUrl: method.ticket_url,
  };
}
