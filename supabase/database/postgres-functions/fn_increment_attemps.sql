/*
increment_attempts()
When used: 
    This function is called whenever a queue item is processed,              
    to track how many times we've tried to generate a summary for it.

How it works: 
    When the process-summary-queue function updates queue items to "processing" status, 
    it calls this function:
*/

CREATE OR REPLACE FUNCTION increment_attempts()
RETURNS integer AS $$
BEGIN
  RETURN attempts + 1;
END;
$$ LANGUAGE plpgsql;
