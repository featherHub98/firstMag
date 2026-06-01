CREATE TABLE IF NOT EXISTS payment_modes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS document_series (
    id TEXT PRIMARY KEY,
    doc_type TEXT NOT NULL UNIQUE,
    prefix TEXT NOT NULL DEFAULT '',
    next_number INTEGER NOT NULL DEFAULT 1,
    format TEXT NOT NULL DEFAULT '{PREFIX}{NUM:06d}'
);

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

INSERT OR IGNORE INTO payment_modes (id, name) VALUES
    ('cash', 'Espèces'),
    ('card', 'Carte bancaire'),
    ('cheque', 'Chèque'),
    ('transfer', 'Virement'),
    ('other', 'Autre');

INSERT OR IGNORE INTO document_series (id, doc_type, prefix, next_number) VALUES
    ('s_quote', 'quote', 'DEV', 1),
    ('s_order', 'order', 'BC', 1),
    ('s_delivery', 'delivery', 'BL', 1),
    ('s_invoice', 'invoice', 'FAC', 1),
    ('s_credit', 'credit_note', 'AV', 1),
    ('s_po', 'purchase_order', 'CAC', 1),
    ('s_pd', 'purchase_delivery', 'BLA', 1),
    ('s_pi', 'purchase_invoice', 'FAC', 1),
    ('s_pr', 'purchase_return', 'RAV', 1);

INSERT OR IGNORE INTO tax_rates (id, name, rate) VALUES
    ('tva_19', 'TVA 19%', 19),
    ('tva_7', 'TVA 7%', 7),
    ('tva_0', 'TVA 0%', 0);

INSERT OR IGNORE INTO units (id, name, symbol) VALUES
    ('pcs', 'Pièce', 'pcs'),
    ('kg', 'Kilogramme', 'kg'),
    ('l', 'Litre', 'L'),
    ('m', 'Mètre', 'm');

INSERT OR IGNORE INTO roles (id, name, permissions) VALUES
    ('admin', 'Administrateur', '["*"]'),
    ('manager', 'Manager', '["pos", "sales", "stock", "articles", "partners", "reports"]'),
    ('cashier', 'Caissier', '["pos"]');
