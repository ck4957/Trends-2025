-- 9-populate_trends_slug.sql

UPDATE trends
SET slug = 
  lower(
    regexp_replace(
      regexp_replace(trim(title), '[^a-zA-Z0-9\\s-]', '', 'g'),
      '\\s+', '-', 'g'
    )
  ) || '-' || (
    SELECT to_char(td.date, 'YYYY-MM-DD')
    FROM trend_days td
    WHERE td.id = trends.trend_day_id
  );