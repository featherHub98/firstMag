CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'cashier',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    permissions TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,
    partner_type TEXT NOT NULL CHECK(partner_type IN ('client', 'supplier')),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    tax_id TEXT NOT NULL DEFAULT '',
    credit_limit INTEGER NOT NULL DEFAULT 0,
    balance INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(partner_type, code)
);

CREATE TABLE IF NOT EXISTS article_families (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT REFERENCES article_families(id)
);

CREATE TABLE IF NOT EXISTS article_sub_families (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    family_id TEXT NOT NULL REFERENCES article_families(id)
);

CREATE TABLE IF NOT EXISTS tax_rates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rate INTEGER NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    symbol TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS depots (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    barcode TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL,
    family_id TEXT REFERENCES article_families(id),
    sub_family_id TEXT REFERENCES article_sub_families(id),
    purchase_price INTEGER NOT NULL DEFAULT 0,
    sale_price INTEGER NOT NULL DEFAULT 0,
    tax_rate_id TEXT REFERENCES tax_rates(id),
    unit TEXT NOT NULL DEFAULT 'pcs',
    image_path TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_levels (
    article_id TEXT NOT NULL REFERENCES articles(id),
    depot_id TEXT NOT NULL REFERENCES depots(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (article_id, depot_id)
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    doc_type TEXT NOT NULL,
    doc_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    partner_id TEXT NOT NULL,
    partner_name TEXT NOT NULL DEFAULT '',
    total_ht INTEGER NOT NULL DEFAULT 0,
    total_tax INTEGER NOT NULL DEFAULT 0,
    total_ttc INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS document_lines (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id),
    article_id TEXT NOT NULL,
    article_name TEXT NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL DEFAULT 0,
    tax_rate INTEGER NOT NULL DEFAULT 0,
    total_ht INTEGER NOT NULL DEFAULT 0,
    total_ttc INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pos_sessions (
    id TEXT PRIMARY KEY,
    register_id TEXT NOT NULL DEFAULT '1',
    cashier_id TEXT NOT NULL,
    opening_fund INTEGER NOT NULL DEFAULT 0,
    closing_fund INTEGER,
    status TEXT NOT NULL DEFAULT 'open',
    ticket_count INTEGER NOT NULL DEFAULT 0,
    total_sales INTEGER NOT NULL DEFAULT 0,
    opened_at TEXT NOT NULL,
    closed_at TEXT
);

CREATE TABLE IF NOT EXISTS pos_tickets (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES pos_sessions(id),
    ticket_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    total_ht INTEGER NOT NULL DEFAULT 0,
    total_tax INTEGER NOT NULL DEFAULT 0,
    total_ttc INTEGER NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    UNIQUE(session_id, ticket_number)
);

CREATE TABLE IF NOT EXISTS ticket_lines (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL REFERENCES pos_tickets(id),
    article_id TEXT NOT NULL,
    article_name TEXT NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL DEFAULT 0,
    tax_rate INTEGER NOT NULL DEFAULT 0,
    total_ht INTEGER NOT NULL DEFAULT 0,
    total_ttc INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL REFERENCES pos_tickets(id),
    mode TEXT NOT NULL CHECK(mode IN ('cash', 'card', 'cheque', 'transfer', 'other')),
    amount INTEGER NOT NULL DEFAULT 0,
    reference TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    movement_type TEXT NOT NULL,
    article_id TEXT NOT NULL,
    depot_id TEXT NOT NULL,
    target_depot_id TEXT,
    quantity INTEGER NOT NULL,
    reference TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_barcode ON articles(barcode);
CREATE INDEX IF NOT EXISTS idx_articles_name ON articles(name);
CREATE INDEX IF NOT EXISTS idx_partners_name ON partners(name);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_partner ON documents(partner_id);
CREATE INDEX IF NOT EXISTS idx_documents_number ON documents(doc_number);
CREATE INDEX IF NOT EXISTS idx_pos_tickets_session ON pos_tickets(session_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_article ON stock_movements(article_id);
