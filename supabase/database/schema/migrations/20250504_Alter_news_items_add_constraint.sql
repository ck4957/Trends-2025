ALTER TABLE news_items
ADD CONSTRAINT news_items_trend_title_url_unique UNIQUE (trend_id, title, url);