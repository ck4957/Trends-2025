-- Table for daily trend batches
CREATE TABLE trend_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  source_filename TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for individual trends within a day
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_day_id UUID REFERENCES trend_days(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  approx_traffic TEXT,
  rank INTEGER
);

-- Table for news items related to each trend
CREATE TABLE news_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source TEXT,
  picture_url TEXT,
  ai_summary TEXT,
  published_at TIMESTAMPTZ
);

-- Indexes for faster queries
CREATE INDEX idx_trend_days_date ON trend_days(date DESC);
CREATE INDEX idx_trends_trend_day_id ON trends(trend_day_id);
CREATE INDEX idx_news_items_trend_id ON news_items(trend_id);

CREATE TABLE summary_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_day_id UUID REFERENCES trend_days(id),
  source_filename TEXT,
  total_items INTEGER NOT NULL,
  items_processed INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  error TEXT
);