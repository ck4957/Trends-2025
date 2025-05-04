CREATE OR REPLACE FUNCTION get_categories_with_counts(date_param TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    COUNT(t.id)::BIGINT AS count
  FROM 
    categories c
  LEFT JOIN 
    trends t ON c.id = t.category_id
  LEFT JOIN (
    -- Get only the most recent run for each date
    SELECT td1.*
    FROM trend_days td1
    JOIN (
      SELECT date, MAX(run_time) as latest_run_time
      FROM trend_days
      GROUP BY date
    ) td2 ON td1.date = td2.date AND td1.run_time = td2.latest_run_time
  ) td ON t.trend_day_id = td.id
  WHERE
    (date_param IS NULL OR td.date = date_param::DATE) -- Cast text to DATE
  GROUP BY 
    c.id, c.name, c.slug, c.description
  ORDER BY 
    c.name;
END;
$$ LANGUAGE plpgsql;