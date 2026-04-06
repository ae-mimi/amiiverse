PRAGMA foreign_keys = ON;

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

CREATE INDEX IF NOT EXISTS idx_fan_leads_email ON fan_leads (email);
CREATE INDEX IF NOT EXISTS idx_fan_leads_brevo_status ON fan_leads (brevo_status);
CREATE INDEX IF NOT EXISTS idx_fan_leads_created_at ON fan_leads (created_at);
CREATE INDEX IF NOT EXISTS idx_music_cache_release_date ON music_cache (release_date);
CREATE INDEX IF NOT EXISTS idx_music_cache_is_active ON music_cache (is_active);

CREATE VIRTUAL TABLE IF NOT EXISTS music_fts USING fts5(
    title,
    description,
    tags,
    slug
);

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
