PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products_cache (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price_ngn INTEGER NOT NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('physical', 'digital')),
    cover_image_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'checked_out', 'abandoned')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
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
    reference TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    amount_kobo INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    paystack_transaction_id TEXT,
    paystack_raw_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts (id)
);

CREATE INDEX IF NOT EXISTS idx_products_cache_is_active ON products_cache (is_active);
CREATE INDEX IF NOT EXISTS idx_products_cache_slug ON products_cache (slug);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items (product_id);
CREATE INDEX IF NOT EXISTS idx_orders_cart_id ON orders (cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);

CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
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
