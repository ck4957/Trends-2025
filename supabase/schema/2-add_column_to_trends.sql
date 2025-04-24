-- Add AI summary column to the trends table
ALTER TABLE trends 
ADD COLUMN ai_summary TEXT,
ADD COLUMN summary_generated_at TIMESTAMPTZ;

