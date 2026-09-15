CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('lagrimas', 'sorrisos', 'classica')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents = 2990),
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'processing', 'sent', 'failed')),
  mercado_pago_preference_id TEXT,
  mercado_pago_payment_id TEXT,
  resend_message_id TEXT,
  delivery_attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT,
  sent_at TEXT,
  last_error TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_mercado_pago_payment_id_unique
  ON orders (mercado_pago_payment_id)
  WHERE mercado_pago_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_status_created_at_idx
  ON orders (status, created_at);
