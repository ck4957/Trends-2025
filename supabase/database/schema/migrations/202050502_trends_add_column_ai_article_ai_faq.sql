ALTER TABLE trends
ADD COLUMN ai_article TEXT,
ADD COLUMN ai_faq JSONB;

-- 8-add_slug_column_to_trends.sql

ALTER TABLE trends
ADD COLUMN slug TEXT;


-- Add unique index for fast lookup and to prevent duplicates
CREATE UNIQUE INDEX trends_slug_day_idx ON trends(slug, trend_day_id);

-- Populate slug for existing rows (run separately, see below)

-- 10-make_slug_not_null.sql
ALTER TABLE trends
ALTER COLUMN slug SET NOT NULL;