CREATE TABLE orders_next (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('lagrimas', 'sorrisos', 'classica')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'processing', 'sent', 'failed')),
  mercado_pago_preference_id TEXT,
  mercado_pago_order_id TEXT,
  mercado_pago_payment_id TEXT,
  resend_message_id TEXT,
  delivery_attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT,
  sent_at TEXT,
  last_error TEXT
);

INSERT INTO orders_next (
  id, email, answers_json, tone, amount_cents, status,
  mercado_pago_preference_id, mercado_pago_order_id, mercado_pago_payment_id,
  resend_message_id, delivery_attempts, created_at, updated_at, paid_at, sent_at, last_error
)
SELECT
  id, email, answers_json, tone, amount_cents, status,
  mercado_pago_preference_id, NULL, mercado_pago_payment_id,
  resend_message_id, delivery_attempts, created_at, updated_at, paid_at, sent_at, last_error
FROM orders;

DROP TABLE orders;
ALTER TABLE orders_next RENAME TO orders;

CREATE UNIQUE INDEX orders_mercado_pago_payment_id_unique
  ON orders (mercado_pago_payment_id)
  WHERE mercado_pago_payment_id IS NOT NULL;

CREATE UNIQUE INDEX orders_mercado_pago_order_id_unique
  ON orders (mercado_pago_order_id)
  WHERE mercado_pago_order_id IS NOT NULL;

CREATE INDEX orders_status_created_at_idx
  ON orders (status, created_at);
