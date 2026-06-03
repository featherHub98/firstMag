ALTER TABLE partners ADD COLUMN country_id TEXT REFERENCES countries(id);
CREATE INDEX IF NOT EXISTS idx_partners_country ON partners(country_id);
