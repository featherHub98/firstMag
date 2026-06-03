CREATE TABLE IF NOT EXISTS cash_movements (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES pos_sessions(id),
    movement_type TEXT NOT NULL CHECK(movement_type IN ('in', 'out')),
    amount INTEGER NOT NULL CHECK(amount > 0),
    description TEXT NOT NULL DEFAULT '',
    user_id TEXT NOT NULL DEFAULT '',
    user_name TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cash_movements_session_created
    ON cash_movements(session_id, created_at DESC);
