ALTER TABLE orders ADD COLUMN pagarme_link_id TEXT;
ALTER TABLE orders ADD COLUMN pagarme_order_id TEXT;
ALTER TABLE orders ADD COLUMN pagarme_charge_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS orders_pagarme_link_id_unique
  ON orders (pagarme_link_id)
  WHERE pagarme_link_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_pagarme_order_id_unique
  ON orders (pagarme_order_id)
  WHERE pagarme_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_pagarme_charge_id_unique
  ON orders (pagarme_charge_id)
  WHERE pagarme_charge_id IS NOT NULL;
