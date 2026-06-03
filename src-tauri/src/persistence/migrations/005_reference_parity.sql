CREATE TABLE IF NOT EXISTS banks (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS currencies (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cashiers (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS registers (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO payment_methods (id, code, name, description, active) VALUES
    ('cash', 'CASH', 'Espèces', 'Paiement en espèces', 1),
    ('card', 'CARD', 'Carte bancaire', 'Paiement par carte', 1),
    ('cheque', 'CHEQUE', 'Chèque', 'Paiement par chèque', 1),
    ('transfer', 'TRANSFER', 'Virement', 'Paiement par virement', 1);

INSERT OR IGNORE INTO currencies (id, code, name, symbol, active) VALUES
    ('tnd', 'TND', 'Dinar tunisien', 'DT', 1),
    ('eur', 'EUR', 'Euro', '€', 1),
    ('usd', 'USD', 'Dollar américain', '$', 1);

INSERT OR IGNORE INTO cashiers (id, code, name, email, phone, active) VALUES
    ('1', 'CAI001', 'Caissier principal', '', '', 1);

INSERT OR IGNORE INTO registers (id, code, name, location, active) VALUES
    ('1', 'REG001', 'Caisse principale', 'Magasin principal', 1);
