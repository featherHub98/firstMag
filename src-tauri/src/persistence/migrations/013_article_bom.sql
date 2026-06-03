CREATE TABLE IF NOT EXISTS article_bom_headers (
    id TEXT PRIMARY KEY,
    parent_article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    output_quantity INTEGER NOT NULL DEFAULT 1000,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS article_bom_lines (
    id TEXT PRIMARY KEY,
    bom_id TEXT NOT NULL REFERENCES article_bom_headers(id) ON DELETE CASCADE,
    component_article_id TEXT NOT NULL REFERENCES articles(id),
    quantity INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(bom_id, component_article_id)
);

CREATE INDEX IF NOT EXISTS idx_article_bom_headers_parent ON article_bom_headers(parent_article_id);
CREATE INDEX IF NOT EXISTS idx_article_bom_lines_bom ON article_bom_lines(bom_id);
