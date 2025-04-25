-- Create the summary queue table
CREATE TABLE summary_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_id UUID REFERENCES trends(id) NOT NULL ON DELETE CASCADE,
  trend_title TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error TEXT,
  batch_id UUID
);

-- Create a table to log trigger executions (optional but helpful for monitoring)
CREATE TABLE IF NOT EXISTS summary_queue_trigger_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pending_count INTEGER,
  http_response_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_summary_queue_status ON summary_queue(status);
CREATE INDEX idx_summary_queue_created_at ON summary_queue(created_at);
CREATE INDEX idx_summary_queue_trend_id ON summary_queue(trend_id);