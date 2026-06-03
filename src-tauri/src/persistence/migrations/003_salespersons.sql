CREATE TABLE IF NOT EXISTS salespersons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_salespersons_name ON salespersons(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_salespersons_code ON salespersons(code);
