CREATE OR REPLACE FUNCTION fn_purge_old_data(retention_days INTEGER DEFAULT 7)
RETURNS TEXT AS $$
DECLARE
    purge_date DATE := CURRENT_DATE - retention_days;
    trend_days_count INTEGER := 0;
    log_entries_count INTEGER := 0;
    orphaned_queue_count INTEGER := 0;
    start_time TIMESTAMPTZ := NOW();
    execution_time INTERVAL;
BEGIN
    -- Start a transaction to ensure atomicity
    BEGIN
        -- 1. Delete old trend_days (will cascade to trends, news_items, and associated summary_queue entries)
        DELETE FROM trend_days 
        WHERE date < purge_date
        RETURNING COUNT(*) INTO trend_days_count;

        -- 2. Delete old trigger log entries 
        DELETE FROM summary_queue_trigger_log
        WHERE triggered_at < (CURRENT_TIMESTAMP - (retention_days || ' days')::INTERVAL)
        RETURNING COUNT(*) INTO log_entries_count;
        
        -- 3. Clean up orphaned summary_queue entries (if any)
        -- These should generally be handled by cascade, but this ensures data integrity
        DELETE FROM summary_queue 
        WHERE NOT EXISTS (SELECT 1 FROM trends WHERE trends.id = summary_queue.trend_id)
        RETURNING COUNT(*) INTO orphaned_queue_count;
        
        -- Calculate execution time
        execution_time := NOW() - start_time;
        
        -- Return summary
        RETURN format(
            'Purge completed successfully in %s. Removed %s trend_days (with cascaded deletions), %s log entries, and %s orphaned queue items.',
            execution_time,
            trend_days_count,
            log_entries_count,
            orphaned_queue_count
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log the error and rollback
        RAISE LOG 'Data purge error: %', SQLERRM;
        RETURN format('Error during purge operation: %s', SQLERRM);
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;