-- Add run_time column to trend_days
ALTER TABLE trend_days
ADD COLUMN run_time TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Remove UNIQUE constraint from date
ALTER TABLE trend_days
DROP CONSTRAINT IF EXISTS trend_days_date_key;

-- (Optional) Add unique constraint on (date, run_time)
ALTER TABLE trend_days
ADD CONSTRAINT trend_days_date_run_time_unique UNIQUE (date, run_time);