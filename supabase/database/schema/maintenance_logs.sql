-- Table to track maintenance operations
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation TEXT NOT NULL,
  details TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  execution_status TEXT DEFAULT 'success'
);

-- Index for efficient querying
CREATE INDEX idx_maintenance_logs_operation ON maintenance_logs(operation);
CREATE INDEX idx_maintenance_logs_executed_at ON maintenance_logs(executed_at);