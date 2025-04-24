-- Add AI summary column to the trends table
ALTER TABLE trends 
ADD COLUMN ai_summary TEXT,
ADD COLUMN summary_generated_at TIMESTAMPTZ;

-- Remove AI summary from news_items table (optional)
ALTER TABLE news_items DROP COLUMN ai_summary;