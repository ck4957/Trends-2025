CREATE OR REPLACE FUNCTION manual_process_summary_queue()
RETURNS TEXT AS $$
DECLARE
  pending_count INTEGER;
  supabase_url TEXT;
  api_key TEXT;
  queue_threshold INTEGER := 0; -- Set to 0 to bypass the threshold check for manual processing
  response_id TEXT;
BEGIN
  -- Get the Supabase URL and API key from vault
  supabase_url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url');
  api_key := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key');
  
  -- Count pending items
  SELECT COUNT(*) INTO pending_count 
  FROM summary_queue 
  WHERE status = 'pending';
  
  -- No threshold check for manual calls (optional - can keep it if you want)
  -- Skip the check for concurrent processing (also optional)
  
  -- Call your edge function to process the queue
  response_id := net.http_post(
    supabase_url || '/functions/v1/process-summary-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || api_key
    )
  );
  
  -- Log the manual request
  INSERT INTO summary_queue_trigger_log (
    triggered_at,
    pending_count,
    http_response_id
  ) VALUES (
    NOW(),
    pending_count,
    response_id
  );
  
  RETURN 'Processing triggered. Request ID: ' || response_id || ', Pending items: ' || pending_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;