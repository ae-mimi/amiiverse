ALTER TABLE orders ADD COLUMN payment_provider TEXT NOT NULL DEFAULT 'flutterwave' CHECK (payment_provider = 'flutterwave');
ALTER TABLE orders ADD COLUMN provider_transaction_id TEXT;
ALTER TABLE orders ADD COLUMN provider_raw_json TEXT;

UPDATE orders
SET payment_provider = 'flutterwave'
WHERE payment_provider IS NULL OR payment_provider = '';
