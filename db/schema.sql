PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products_cache (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price_ngn INTEGER NOT NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('physical', 'digital')),
    cover_image_url TEXT,
    r2_key TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY,
    email TEXT,
    currency TEXT NOT NULL DEFAULT 'NGN',
    country TEXT,
    region TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'checked_out', 'abandoned')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    variant_id TEXT,
    sku_snapshot TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    currency_code TEXT NOT NULL DEFAULT 'NGN',
    unit_price_ngn INTEGER NOT NULL,
    title_snapshot TEXT NOT NULL,
    product_type_snapshot TEXT NOT NULL,
    cover_image_snapshot TEXT,
    FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products_cache (id)
);

CREATE TABLE IF NOT EXISTS orders (
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
    status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'fulfillment_pending', 'fulfilled', 'cancelled', 'refund_pending', 'refunded', 'failed')),
    provider_transaction_id TEXT,
    provider_raw_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts (id)
);

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

CREATE TABLE IF NOT EXISTS fan_leads (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    consent INTEGER NOT NULL DEFAULT 0 CHECK (consent IN (0, 1)),
    source TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    brevo_status TEXT NOT NULL DEFAULT 'pending' CHECK (brevo_status IN ('pending', 'synced', 'failed')),
    brevo_contact_id TEXT,
    last_error TEXT,
    last_synced_at TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS music_cache (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    release_date TEXT,
    cover_image_url TEXT,
    spotify_url TEXT,
    apple_music_url TEXT,
    youtube_music_url TEXT,
    audio_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_cache_is_active ON products_cache (is_active);
CREATE INDEX IF NOT EXISTS idx_products_cache_slug ON products_cache (slug);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items (product_id);
CREATE INDEX IF NOT EXISTS idx_orders_cart_id ON orders (cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_quote_id ON orders (quote_id);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_active ON product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_quotes_cart_id ON quotes(cart_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_rules_country_currency ON shipping_rules(country, currency);
CREATE INDEX IF NOT EXISTS idx_tax_rules_country ON tax_rules(country);
CREATE INDEX IF NOT EXISTS idx_fan_leads_email ON fan_leads (email);
CREATE INDEX IF NOT EXISTS idx_fan_leads_brevo_status ON fan_leads (brevo_status);
CREATE INDEX IF NOT EXISTS idx_fan_leads_created_at ON fan_leads (created_at);
CREATE INDEX IF NOT EXISTS idx_music_cache_release_date ON music_cache (release_date);
CREATE INDEX IF NOT EXISTS idx_music_cache_is_active ON music_cache (is_active);

CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
    title,
    description,
    tags,
    slug
);

CREATE VIRTUAL TABLE IF NOT EXISTS music_fts USING fts5(
    title,
    description,
    tags,
    slug
);

CREATE TRIGGER IF NOT EXISTS trg_products_cache_ai
AFTER INSERT ON products_cache
BEGIN
    INSERT INTO products_fts (rowid, title, description, tags, slug)
    VALUES (
        new.rowid,
        COALESCE(new.title, ''),
        COALESCE(new.description, ''),
        COALESCE(new.product_type, ''),
        COALESCE(new.slug, '')
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_music_cache_ai
AFTER INSERT ON music_cache
BEGIN
    INSERT INTO music_fts (rowid, title, description, tags, slug)
    VALUES (
        new.rowid,
        COALESCE(new.title, ''),
        COALESCE(new.description, ''),
        '',
        COALESCE(new.slug, '')
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_music_cache_ad
AFTER DELETE ON music_cache
BEGIN
    DELETE FROM music_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS trg_music_cache_au
AFTER UPDATE ON music_cache
BEGIN
    DELETE FROM music_fts WHERE rowid = old.rowid;
    INSERT INTO music_fts (rowid, title, description, tags, slug)
    VALUES (
        new.rowid,
        COALESCE(new.title, ''),
        COALESCE(new.description, ''),
        '',
        COALESCE(new.slug, '')
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_products_cache_ad
AFTER DELETE ON products_cache
BEGIN
    DELETE FROM products_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS trg_products_cache_au
AFTER UPDATE ON products_cache
BEGIN
    DELETE FROM products_fts WHERE rowid = old.rowid;
    INSERT INTO products_fts (rowid, title, description, tags, slug)
    VALUES (
        new.rowid,
        COALESCE(new.title, ''),
        COALESCE(new.description, ''),
        COALESCE(new.product_type, ''),
        COALESCE(new.slug, '')
    );
END;
