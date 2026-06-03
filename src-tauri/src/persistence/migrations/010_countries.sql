CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    iso2 TEXT NOT NULL DEFAULT '',
    phone_code TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO countries (id, code, name, iso2, phone_code, active) VALUES
    ('country_tn', 'TUN', 'Tunisie', 'TN', '+216', 1),
    ('country_fr', 'FRA', 'France', 'FR', '+33', 1),
    ('country_dz', 'DZA', 'Algerie', 'DZ', '+213', 1);
