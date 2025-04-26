-- Schedule weekly data purge job (every Sunday at 2 AM)
SELECT cron.schedule(
  'weekly-data-purge',
  '0 2 * * 0',  -- At 2:00 AM every Sunday
  $$
    -- Execute the purge with the default 7-day retention
    SELECT fn_purge_old_data();
    
    -- Log the execution
    INSERT INTO maintenance_logs (
      operation, 
      details,
      executed_at
    ) VALUES (
      'weekly_purge',
      (SELECT fn_purge_old_data()),
      NOW()
    );
  $$
);