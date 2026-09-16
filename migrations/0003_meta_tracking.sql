ALTER TABLE orders ADD COLUMN tracking_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE orders ADD COLUMN meta_purchase_sent_at TEXT;
CREATE INDEX IF NOT EXISTS orders_meta_purchase_pending_idx
  ON orders (status, meta_purchase_sent_at)
  WHERE meta_purchase_sent_at IS NULL;
