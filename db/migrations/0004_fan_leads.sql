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

CREATE INDEX IF NOT EXISTS idx_fan_leads_email ON fan_leads (email);
CREATE INDEX IF NOT EXISTS idx_fan_leads_brevo_status ON fan_leads (brevo_status);
CREATE INDEX IF NOT EXISTS idx_fan_leads_created_at ON fan_leads (created_at);
