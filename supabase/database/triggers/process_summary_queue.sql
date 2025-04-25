-- Enable the required extensions if not already enabled
/*
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
*/

-- Store service role key securely in the database
-- (You'll need to set this value via Supabase SQL editor)
-- DO NOT COMMIT THIS WITH YOUR ACTUAL KEY
/*
CREATE OR REPLACE FUNCTION set_service_role_key(api_key text) RETURNS void AS $$
BEGIN
  PERFORM set_config('app.settings.service_role_key', api_key, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/


-- Function to call the Edge Function to process the queue
CREATE OR REPLACE FUNCTION trigger_process_summary_queue()
RETURNS TRIGGER AS $$
DECLARE
  pending_count INTEGER;
  supabase_url TEXT;
  api_key TEXT;
  queue_threshold INTEGER := 3; -- Minimum number of pending items to trigger processing
  response_id TEXT;
BEGIN
  -- Get the Supabase URL and API key from vault
  supabase_url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url');
  api_key := (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key');
  
  -- Count pending items - only trigger if we have enough to process
  SELECT COUNT(*) INTO pending_count 
  FROM summary_queue 
  WHERE status = 'pending';
  
  -- Also check if there are any items currently being processed
  -- to avoid flooding the queue with concurrent requests
  IF pending_count >= queue_threshold AND NOT EXISTS (
    SELECT 1 FROM summary_queue WHERE status = 'processing' LIMIT 1
  ) THEN
    -- Call your edge function to process the queue
    response_id := net.http_post(
      supabase_url || '/functions/v1/process-summary-queue',
      headers:=jsonb_build_object(
            'Content-type', 'application/json',
            'Authorization', 'Bearer ' || api_key
          ),
    );
    
    -- Log the request (optional)
    INSERT INTO summary_queue_trigger_log (
      triggered_at,
      pending_count,
      http_response_id
    ) VALUES (
      NOW(),
      pending_count,
      response_id
    );
  END IF;
  
  RETURN NULL; -- for AFTER triggers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on summary_queue table
DROP TRIGGER IF EXISTS summary_queue_insert_trigger ON summary_queue;
CREATE TRIGGER summary_queue_insert_trigger
AFTER INSERT ON summary_queue
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_process_summary_queue();

-- Create a trigger that also runs when items are updated back to pending
DROP TRIGGER IF EXISTS summary_queue_update_trigger ON summary_queue;
CREATE TRIGGER summary_queue_update_trigger
AFTER UPDATE ON summary_queue
FOR EACH ROW
WHEN (NEW.status = 'pending' AND OLD.status <> 'pending')
EXECUTE FUNCTION trigger_process_summary_queue();

-- Set up a safety-net scheduled job to handle any pending items
-- that might have been missed by the triggers (runs hourly)
SELECT cron.schedule(
  'process-summary-queue-hourly',
  '0 * * * *', -- Run once per hour
  $$
  SELECT trigger_process_summary_queue();
  $$
);


-- Manually trigger the function to process the queue
-- SELECT trigger_process_summary_queue();