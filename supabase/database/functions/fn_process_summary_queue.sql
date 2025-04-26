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
RETURNS TEXT AS $$
DECLARE
  pending_count INTEGER;
  processing_count INTEGER;
  last_processed TIMESTAMPTZ;
  supabase_url TEXT;
  api_key TEXT;
  queue_threshold INTEGER := 3; -- Process exactly 3 at a time
  cooldown_period INTERVAL := '1 minute'; -- OpenAI rate limit period
  response_id TEXT;
  fixed_items INTEGER;
  reset_items INTEGER;
BEGIN
  -- Step 1: Find and insert missing trends into the queue
  WITH trends_needing_summary AS (
    SELECT 
      t.id AS trend_id,
      t.title AS trend_title
    FROM 
      trends t
    LEFT JOIN 
      summary_queue sq ON t.id = sq.trend_id
    WHERE 
      t.ai_summary IS NULL AND
      sq.id IS NULL AND
      -- Only consider trends that have news items
      EXISTS (SELECT 1 FROM news_items WHERE trend_id = t.id)
  )
  INSERT INTO summary_queue (trend_id, trend_title, status, created_at)
  SELECT 
    trend_id, 
    trend_title, 
    'pending', 
    NOW()
  FROM 
    trends_needing_summary
  RETURNING (
    SELECT COUNT(*) FROM trends_needing_summary
  ) INTO fixed_items;

  -- Step 2: Reset completed entries that still don't have summaries
  WITH completed_but_no_summary AS (
    SELECT 
      sq.id AS queue_id
    FROM 
      summary_queue sq
    JOIN 
      trends t ON sq.trend_id = t.id
    WHERE 
      sq.status = 'completed' AND 
      t.ai_summary IS NULL
  )
  UPDATE summary_queue
  SET 
    status = 'pending',
    updated_at = NOW(),
    retry_count = COALESCE(retry_count, 0) + 1
  WHERE 
    id IN (SELECT queue_id FROM completed_but_no_summary)
  RETURNING (
    SELECT COUNT(*) FROM completed_but_no_summary
  ) INTO reset_items;

  -- Get the Supabase URL and API key from vault
  supabase_url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url');
  api_key := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key');
  
  -- Get the timestamp of the last processed batch
  SELECT MAX(triggered_at) INTO last_processed 
  FROM summary_queue_trigger_log 
  WHERE http_response_id IS NOT NULL;
  
  -- Check how many items are currently being processed
  SELECT COUNT(*) INTO processing_count 
  FROM summary_queue 
  WHERE status = 'processing';
  
  -- Count pending items
  SELECT COUNT(*) INTO pending_count 
  FROM summary_queue 
  WHERE status = 'pending';
  
  -- Only proceed if:
  -- 1. We have enough items to process
  -- 2. Nothing is currently being processed
  -- 3. We've waited at least 1 minute since the last batch
  IF pending_count > 0 
     AND processing_count = 0
     AND (last_processed IS NULL OR NOW() - last_processed >= cooldown_period) 
  THEN
    -- Call your edge function to process the queue
    -- Add a limit parameter to control batch size
    response_id := net.http_post(
      url := supabase_url || '/functions/v1/process-summary-queue',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || api_key
      ),
      body := jsonb_build_object('batch_size', LEAST(pending_count, queue_threshold))::text
    );
    
    -- Log the request with successful call
    INSERT INTO summary_queue_trigger_log (
      triggered_at,
      pending_count,
      http_response_id,
      notes
    ) VALUES (
      NOW(),
      pending_count,
      response_id,
      format('Processed batch of %s items. Fixed %s missing, reset %s completed items.', 
             LEAST(pending_count, queue_threshold),
             fixed_items,
             reset_items)
    );
    
    RETURN format('Processing triggered. Request ID: %s, Pending items: %s, Fixed: %s, Reset: %s', 
                  response_id, pending_count, fixed_items, reset_items);
  ELSIF pending_count > 0 THEN
    -- Log skipped processing with reason
    INSERT INTO summary_queue_trigger_log (
      triggered_at,
      pending_count,
      notes
    ) VALUES (
      NOW(),
      pending_count,
      format(
        'Skipped processing: %s items pending, %s processing, last batch %s. Fixed %s missing, reset %s completed items.', 
        pending_count, 
        processing_count,
        CASE 
          WHEN last_processed IS NULL THEN 'never'
          ELSE format('%s ago', NOW() - last_processed)
        END,
        fixed_items,
        reset_items
      )
    );
    
    RETURN format('Processing skipped. Pending items: %s, Fixed: %s, Reset: %s', 
                  pending_count, fixed_items, reset_items);
  ELSE
    RETURN format('No pending items. Fixed %s missing, reset %s completed items.', 
                 fixed_items, reset_items);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Set up a safety-net scheduled job to handle any pending items
-- that might have been missed by the triggers (runs hourly)


-- Replace with a scheduled job that runs every minute
SELECT cron.schedule(
  'process-summary-queue-every-minute',
  '* * * * *', -- Run every minute
  $$
  SELECT trigger_process_summary_queue();
  $$
);
-- Manually trigger the function to process the queue
-- SELECT trigger_process_summary_queue();