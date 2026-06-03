CREATE TABLE IF NOT EXISTS partner_profiles (
    partner_id TEXT PRIMARY KEY REFERENCES partners(id) ON DELETE CASCADE,
    fiscal_address TEXT NOT NULL DEFAULT '',
    commercial_contact TEXT NOT NULL DEFAULT '',
    payment_model TEXT NOT NULL DEFAULT '',
    shipping_address TEXT NOT NULL DEFAULT '',
    currency_code TEXT NOT NULL DEFAULT 'TND',
    credit_control_enabled INTEGER NOT NULL DEFAULT 0,
    loyalty_barcode TEXT NOT NULL DEFAULT '',
    family_segment TEXT NOT NULL DEFAULT '',
    milestone_tier TEXT NOT NULL DEFAULT '',
    deferred_discount_rate INTEGER NOT NULL DEFAULT 0,
    global_discount_millimes INTEGER NOT NULL DEFAULT 0,
    allow_deferred_payment INTEGER NOT NULL DEFAULT 0,
    deposit_balance INTEGER NOT NULL DEFAULT 0,
    last_visit_at TEXT,
    notes_ext TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_profiles_loyalty_barcode
ON partner_profiles(loyalty_barcode)
WHERE loyalty_barcode <> '';

CREATE TABLE IF NOT EXISTS partner_followups (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'done', 'cancelled')),
    priority INTEGER NOT NULL DEFAULT 1,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_partner_followups_partner ON partner_followups(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_followups_status ON partner_followups(status);
CREATE INDEX IF NOT EXISTS idx_partner_followups_due ON partner_followups(due_date);

CREATE TABLE IF NOT EXISTS partner_reclamations (
    id TEXT PRIMARY KEY,
    partner_id TEXT REFERENCES partners(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK(severity IN ('low', 'medium', 'high', 'critical')),
    source TEXT NOT NULL DEFAULT 'client' CHECK(source IN ('client', 'supplier', 'internal')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_partner_reclamations_partner ON partner_reclamations(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_reclamations_status ON partner_reclamations(status);
CREATE INDEX IF NOT EXISTS idx_partner_reclamations_created ON partner_reclamations(created_at);
