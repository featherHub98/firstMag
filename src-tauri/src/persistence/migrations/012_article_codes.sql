CREATE TABLE IF NOT EXISTS article_codes (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    code_type TEXT NOT NULL CHECK(code_type IN ('barcode', 'plu')),
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_article_codes_article ON article_codes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_codes_code ON article_codes(code);
