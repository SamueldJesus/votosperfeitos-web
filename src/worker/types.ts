export const TONES = ["lagrimas", "sorrisos", "classica"] as const;

export type Tone = (typeof TONES)[number];
export type OrderStatus = "pending" | "paid" | "processing" | "sent" | "failed";

export interface CheckoutInput {
  email: string;
  who: string;
  speakerName: string;
  partnerName: string;
  howMet: string;
  insideJoke: string;
  certainMoment: string;
  admiration: string;
  deepPromise: string;
  tone: Tone;
  tracking?: {
    eventId: string;
    fbp?: string;
    fbc?: string;
  };
}

export interface GeneratedVow {
  id: "1" | "2" | "3";
  title: string;
  subtitle: string;
  body: string;
}

export interface StoredOrder {
  id: string;
  email: string;
  tone: Tone;
  answers: CheckoutInput;
}

export interface OrderRecord {
  id: string;
  email: string;
  answers_json: string;
  tone: Tone;
  amount_cents: number;
  status: OrderStatus;
  mercado_pago_preference_id: string | null;
  mercado_pago_order_id: string | null;
  mercado_pago_payment_id: string | null;
  delivery_attempts: number;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  sent_at: string | null;
}
