CREATE TABLE IF NOT EXISTS product_ranges (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tariff_categories (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    discount_rate INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS accounting_categories (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    account_number TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS advanced_tax_rates (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    rate INTEGER NOT NULL DEFAULT 0,
    surcharge_rate INTEGER NOT NULL DEFAULT 0,
    withholding_rate INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO product_ranges (id, code, name, description, active) VALUES
    ('range_std', 'STD', 'Standard', 'Gamme standard', 1),
    ('range_prem', 'PREM', 'Premium', 'Gamme premium', 1);

INSERT OR IGNORE INTO tariff_categories (id, code, name, discount_rate, active) VALUES
    ('tariff_a', 'A', 'Tarif A', 0, 1),
    ('tariff_b', 'B', 'Tarif B', 5, 1);

INSERT OR IGNORE INTO accounting_categories (id, code, name, account_number, active) VALUES
    ('acc_sales', 'VENTE', 'Ventes locales', '701000', 1),
    ('acc_purchase', 'ACHAT', 'Achats locaux', '601000', 1);

INSERT OR IGNORE INTO advanced_tax_rates (id, code, name, rate, surcharge_rate, withholding_rate, active) VALUES
    ('atva_19', 'TVA19', 'TVA 19%', 19, 0, 0, 1),
    ('atva_7', 'TVA7', 'TVA 7%', 7, 0, 0, 1),
    ('atva_0', 'TVA0', 'TVA 0%', 0, 0, 0, 1);
