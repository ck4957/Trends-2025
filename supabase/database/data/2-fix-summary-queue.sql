-- Identify trends with news items that aren't in the summary queue
WITH trends_with_news AS (
  -- Find trends that have associated news items
  SELECT DISTINCT 
    t.id AS trend_id,
    t.title AS trend_title,
    COUNT(n.id) AS news_count
  FROM 
    trends t
  JOIN 
    news_items n ON t.id = n.trend_id
  WHERE t.trend_day_id = '' -- Replace with the actual trend_day_id
  GROUP BY 
    t.id, t.title
  HAVING 
    COUNT(n.id) > 0
),
missing_summaries AS (
  -- Find trends that should have summaries but don't
  SELECT 
    twn.trend_id,
    twn.trend_title,
    twn.news_count
  FROM 
    trends_with_news twn
  LEFT JOIN 
    summary_queue sq ON twn.trend_id = sq.trend_id
  WHERE 
    sq.id IS NULL
)

-- Insert the missing entries into summary_queue
INSERT INTO summary_queue (trend_id, trend_title, status, created_at)
SELECT 
  trend_id,
  trend_title,
  'pending',
  NOW()
FROM 
  missing_summaries
RETURNING id, trend_id, trend_title;