-- Update rank values based on approx_traffic for all existing rows
UPDATE trends
SET rank = 
  CASE 
    -- When approx_traffic is null or 'N/A', set rank to 0
    WHEN approx_traffic IS NULL OR approx_traffic = 'N/A' THEN 0
    -- Otherwise, remove the '+' sign and convert to integer
    ELSE (regexp_replace(approx_traffic, '\+', '', 'g'))::integer
  END
WHERE TRUE;