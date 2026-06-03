CREATE TABLE IF NOT EXISTS rayons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    depot_id TEXT NOT NULL REFERENCES depots(id),
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gondoles (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    depot_id TEXT NOT NULL REFERENCES depots(id),
    rayon_id TEXT NOT NULL REFERENCES rayons(id),
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rayons_depot_id ON rayons(depot_id);
CREATE INDEX IF NOT EXISTS idx_gondoles_depot_id ON gondoles(depot_id);
CREATE INDEX IF NOT EXISTS idx_gondoles_rayon_id ON gondoles(rayon_id);
