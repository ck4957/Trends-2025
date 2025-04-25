/*
-- Add this function to reset stuck jobs
When used: 
This function is called at the beginning of each queue processing run 
to recover from any "zombie" processing jobs.

How it works: 
It finds any queue items that have been stuck in 
"processing" status for longer than the specified timeout period 
and resets them to "pending" so they can be retried.
*/
CREATE OR REPLACE FUNCTION reset_stuck_queue_items(timeout_minutes integer)
RETURNS void AS $$
BEGIN
  UPDATE summary_queue
  SET status = 'pending',
      error = 'Reset due to timeout',
      processed_at = NULL,
      batch_id = NULL
  WHERE status = 'processing'
    AND processed_at < NOW() - (timeout_minutes * interval '1 minute');
END;
$$ LANGUAGE plpgsql;