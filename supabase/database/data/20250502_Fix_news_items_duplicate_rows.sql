SELECT title, url, COUNT(*) as count
FROM news_items
GROUP BY title, url
HAVING COUNT(*) > 1;

DELETE FROM news_items
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY title, url ORDER BY id) as rn
    FROM news_items
  ) t
  WHERE t.rn > 1
);