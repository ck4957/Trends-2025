CREATE OR REPLACE FUNCTION get_categories_with_counts()
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
  GROUP BY 
    c.id, c.name, c.slug, c.description
  ORDER BY 
    c.name;
END;
$$ LANGUAGE plpgsql;