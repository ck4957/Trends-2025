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
  LEFT JOIN 
    trend_days td ON t.trend_day_id = td.id
  WHERE
    (date_param IS NULL OR td.date = date_param::DATE) -- Cast text to DATE
  GROUP BY 
    c.id, c.name, c.slug, c.description
  ORDER BY 
    c.name;
END;
$$ LANGUAGE plpgsql;