ALTER TABLE orders ADD COLUMN payment_provider TEXT NOT NULL DEFAULT 'paystack' CHECK (payment_provider IN ('paystack', 'flutterwave'));
ALTER TABLE orders ADD COLUMN provider_transaction_id TEXT;
ALTER TABLE orders ADD COLUMN provider_raw_json TEXT;

UPDATE orders
SET payment_provider = 'paystack'
WHERE payment_provider IS NULL OR payment_provider = '';

UPDATE orders
SET provider_transaction_id = paystack_transaction_id
WHERE (provider_transaction_id IS NULL OR provider_transaction_id = '')
  AND paystack_transaction_id IS NOT NULL
  AND paystack_transaction_id != '';

UPDATE orders
SET provider_raw_json = paystack_raw_json
WHERE (provider_raw_json IS NULL OR provider_raw_json = '')
  AND paystack_raw_json IS NOT NULL
  AND paystack_raw_json != '';
