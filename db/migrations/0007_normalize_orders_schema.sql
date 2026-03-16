PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS orders__new (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL,
    quote_id TEXT,
    reference TEXT UNIQUE NOT NULL,
    idempotency_key TEXT,
    email TEXT NOT NULL,
    amount_kobo INTEGER NOT NULL,
    currency_code TEXT NOT NULL DEFAULT 'NGN',
    subtotal_minor INTEGER NOT NULL DEFAULT 0,
    shipping_minor INTEGER NOT NULL DEFAULT 0,
    tax_minor INTEGER NOT NULL DEFAULT 0,
    total_minor INTEGER NOT NULL DEFAULT 0,
    payment_provider TEXT NOT NULL DEFAULT 'flutterwave' CHECK (payment_provider = 'flutterwave'),
    status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (
        status IN (
            'pending_payment',
            'paid',
            'fulfillment_pending',
            'fulfilled',
            'cancelled',
            'refund_pending',
            'refunded',
            'failed'
        )
    ),
    provider_transaction_id TEXT,
    provider_raw_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts (id)
);

INSERT INTO orders__new (
    id,
    cart_id,
    quote_id,
    reference,
    idempotency_key,
    email,
    amount_kobo,
    currency_code,
    subtotal_minor,
    shipping_minor,
    tax_minor,
    total_minor,
    payment_provider,
    status,
    provider_transaction_id,
    provider_raw_json,
    created_at,
    updated_at
)
SELECT
    id,
    cart_id,
    quote_id,
    reference,
    idempotency_key,
    email,
    amount_kobo,
    COALESCE(currency_code, 'NGN'),
    COALESCE(subtotal_minor, 0),
    COALESCE(shipping_minor, 0),
    COALESCE(tax_minor, 0),
    COALESCE(total_minor, amount_kobo),
    COALESCE(payment_provider, 'flutterwave'),
    CASE
        WHEN status = 'pending' THEN 'pending_payment'
        WHEN status IN (
            'pending_payment',
            'paid',
            'fulfillment_pending',
            'fulfilled',
            'cancelled',
            'refund_pending',
            'refunded',
            'failed'
        ) THEN status
        ELSE 'failed'
    END,
    provider_transaction_id,
    provider_raw_json,
    created_at,
    updated_at
FROM orders;

DROP TABLE orders;
ALTER TABLE orders__new RENAME TO orders;

CREATE INDEX IF NOT EXISTS idx_orders_cart_id ON orders (cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_quote_id ON orders (quote_id);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);

PRAGMA foreign_keys = ON;
