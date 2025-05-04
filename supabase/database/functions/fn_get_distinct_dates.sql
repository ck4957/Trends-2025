-- Create a function to get distinct dates, limited to N most recent
CREATE OR REPLACE FUNCTION get_distinct_dates(limit_count integer)
RETURNS TABLE(date date) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (td.date) td.date
  FROM trend_days td
  ORDER BY td.date DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;