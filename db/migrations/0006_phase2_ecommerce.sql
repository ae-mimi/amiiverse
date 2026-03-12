PRAGMA foreign_keys = ON;

ALTER TABLE carts ADD COLUMN currency TEXT NOT NULL DEFAULT 'NGN';
ALTER TABLE carts ADD COLUMN country TEXT;
ALTER TABLE carts ADD COLUMN region TEXT;

ALTER TABLE cart_items ADD COLUMN variant_id TEXT;
ALTER TABLE cart_items ADD COLUMN sku_snapshot TEXT;
ALTER TABLE cart_items ADD COLUMN currency_code TEXT NOT NULL DEFAULT 'NGN';

ALTER TABLE orders ADD COLUMN quote_id TEXT;
ALTER TABLE orders ADD COLUMN idempotency_key TEXT;
ALTER TABLE orders ADD COLUMN currency_code TEXT NOT NULL DEFAULT 'NGN';
ALTER TABLE orders ADD COLUMN subtotal_minor INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN shipping_minor INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN tax_minor INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN total_minor INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    product_type TEXT NOT NULL CHECK (product_type IN ('physical', 'digital')),
    cover_image_url TEXT,
    r2_key TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    sku TEXT,
    title TEXT NOT NULL,
    options_json TEXT NOT NULL DEFAULT '{}',
    base_price_minor_ngn INTEGER NOT NULL,
    weight_grams INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory (
    variant_id TEXT PRIMARY KEY,
    on_hand INTEGER NOT NULL DEFAULT 0,
    reserved INTEGER NOT NULL DEFAULT 0,
    safety_stock INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS price_overrides (
    variant_id TEXT NOT NULL,
    currency TEXT NOT NULL,
    amount_minor INTEGER NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'fx')),
    updated_at TEXT NOT NULL,
    PRIMARY KEY (variant_id, currency),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL,
    quote_hash TEXT NOT NULL,
    subtotal_minor INTEGER NOT NULL,
    shipping_minor INTEGER NOT NULL,
    tax_minor INTEGER NOT NULL,
    total_minor INTEGER NOT NULL,
    currency TEXT NOT NULL,
    fx_rate REAL NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    variant_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    sku TEXT,
    title_snapshot TEXT NOT NULL,
    cover_image_snapshot TEXT,
    unit_price_minor INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_minor INTEGER NOT NULL,
    currency TEXT NOT NULL,
    metadata_json TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'flutterwave' CHECK (provider = 'flutterwave'),
    reference TEXT UNIQUE NOT NULL,
    provider_tx_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    raw_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    event_key TEXT NOT NULL,
    reference TEXT,
    payload_hash TEXT,
    processed_at TEXT NOT NULL,
    UNIQUE(provider, event_key)
);

CREATE TABLE IF NOT EXISTS shipping_rules (
    id TEXT PRIMARY KEY,
    country TEXT NOT NULL,
    region TEXT,
    currency TEXT NOT NULL,
    method TEXT NOT NULL,
    min_subtotal_minor INTEGER NOT NULL DEFAULT 0,
    max_weight_grams INTEGER,
    price_minor INTEGER NOT NULL DEFAULT 0,
    active_from TEXT,
    active_to TEXT
);

CREATE TABLE IF NOT EXISTS tax_rules (
    id TEXT PRIMARY KEY,
    country TEXT NOT NULL,
    region TEXT,
    product_type TEXT NOT NULL CHECK (product_type IN ('physical', 'digital', 'all')),
    rate_bps INTEGER NOT NULL DEFAULT 0,
    inclusive INTEGER NOT NULL DEFAULT 0 CHECK (inclusive IN (0, 1)),
    active_from TEXT,
    active_to TEXT
);

CREATE TABLE IF NOT EXISTS fx_rates (
    base_currency TEXT NOT NULL,
    quote_currency TEXT NOT NULL,
    rate REAL NOT NULL,
    as_of TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    PRIMARY KEY (base_currency, quote_currency, as_of)
);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_active ON product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_quotes_cart_id ON quotes(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_quote_id ON orders(quote_id);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_rules_country_currency ON shipping_rules(country, currency);
CREATE INDEX IF NOT EXISTS idx_tax_rules_country ON tax_rules(country);

INSERT OR IGNORE INTO products (
    id,
    slug,
    title,
    description,
    product_type,
    cover_image_url,
    r2_key,
    is_active,
    created_at,
    updated_at
)
SELECT
    id,
    slug,
    title,
    description,
    product_type,
    cover_image_url,
    r2_key,
    is_active,
    updated_at,
    updated_at
FROM products_cache;

UPDATE products
SET
    slug = (
        SELECT pc.slug FROM products_cache pc WHERE pc.id = products.id
    ),
    title = (
        SELECT pc.title FROM products_cache pc WHERE pc.id = products.id
    ),
    description = (
        SELECT pc.description FROM products_cache pc WHERE pc.id = products.id
    ),
    product_type = (
        SELECT pc.product_type FROM products_cache pc WHERE pc.id = products.id
    ),
    cover_image_url = (
        SELECT pc.cover_image_url FROM products_cache pc WHERE pc.id = products.id
    ),
    r2_key = (
        SELECT pc.r2_key FROM products_cache pc WHERE pc.id = products.id
    ),
    is_active = (
        SELECT pc.is_active FROM products_cache pc WHERE pc.id = products.id
    ),
    updated_at = (
        SELECT pc.updated_at FROM products_cache pc WHERE pc.id = products.id
    )
WHERE id IN (SELECT id FROM products_cache);

INSERT OR IGNORE INTO product_variants (
    id,
    product_id,
    sku,
    title,
    options_json,
    base_price_minor_ngn,
    weight_grams,
    is_active,
    created_at,
    updated_at
)
SELECT
    id || '_default',
    id,
    slug || '-default',
    title,
    '{}',
    price_ngn,
    0,
    is_active,
    updated_at,
    updated_at
FROM products_cache;

UPDATE product_variants
SET
    product_id = (
        SELECT pc.id FROM products_cache pc WHERE (pc.id || '_default') = product_variants.id
    ),
    sku = (
        SELECT pc.slug || '-default' FROM products_cache pc WHERE (pc.id || '_default') = product_variants.id
    ),
    title = (
        SELECT pc.title FROM products_cache pc WHERE (pc.id || '_default') = product_variants.id
    ),
    base_price_minor_ngn = (
        SELECT pc.price_ngn FROM products_cache pc WHERE (pc.id || '_default') = product_variants.id
    ),
    is_active = (
        SELECT pc.is_active FROM products_cache pc WHERE (pc.id || '_default') = product_variants.id
    ),
    updated_at = (
        SELECT pc.updated_at FROM products_cache pc WHERE (pc.id || '_default') = product_variants.id
    )
WHERE id IN (SELECT id || '_default' FROM products_cache);

INSERT OR IGNORE INTO inventory (variant_id, on_hand, reserved, safety_stock, updated_at)
SELECT
    id || '_default',
    1000000,
    0,
    0,
    updated_at
FROM products_cache;

UPDATE cart_items
SET variant_id = product_id || '_default'
WHERE variant_id IS NULL OR variant_id = '';

INSERT INTO fx_rates (base_currency, quote_currency, rate, as_of, source)
VALUES
    ('NGN', 'NGN', 1.0, datetime('now'), 'seed'),
    ('NGN', 'USD', 0.00065, datetime('now'), 'seed'),
    ('NGN', 'GBP', 0.00052, datetime('now'), 'seed');

INSERT INTO shipping_rules (
    id,
    country,
    region,
    currency,
    method,
    min_subtotal_minor,
    max_weight_grams,
    price_minor,
    active_from,
    active_to
)
VALUES
    ('ship_ng_all_ngn_flat', 'NG', NULL, 'NGN', 'flat_standard', 0, NULL, 2500, datetime('now'), NULL),
    ('ship_us_all_usd_flat', 'US', NULL, 'USD', 'flat_standard', 0, NULL, 10, datetime('now'), NULL),
    ('ship_gb_all_gbp_flat', 'GB', NULL, 'GBP', 'flat_standard', 0, NULL, 8, datetime('now'), NULL);

INSERT INTO tax_rules (
    id,
    country,
    region,
    product_type,
    rate_bps,
    inclusive,
    active_from,
    active_to
)
VALUES
    ('tax_ng_all', 'NG', NULL, 'all', 750, 0, datetime('now'), NULL),
    ('tax_us_all', 'US', NULL, 'all', 0, 0, datetime('now'), NULL),
    ('tax_gb_all', 'GB', NULL, 'all', 2000, 0, datetime('now'), NULL);
